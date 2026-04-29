export interface Env {
  DB: D1Database;
  IMAGES_BUCKET: R2Bucket;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  R2_PUBLIC_BASE_URL?: string;
}

const SESSION_COOKIE = 'tokai_admin_session';
const DEFAULT_ADMIN_USERNAME = 'admin@tokai-soft.com';

export function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function error(message: string, status = 400) {
  return json({ error: message }, { status });
}

export function getBaseUrl(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function getPublicMediaBaseUrl(request: Request, env: Env) {
  return (env.R2_PUBLIC_BASE_URL || `${getBaseUrl(request)}/media`).replace(/\/$/, '');
}

export function assertRuntimeConfig(env: Env) {
  const missing: string[] = [];

  if (!env.ADMIN_PASSWORD) {
    missing.push('ADMIN_PASSWORD');
  }

  if (!env.SESSION_SECRET) {
    missing.push('SESSION_SECRET');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required runtime config: ${missing.join(', ')}`);
  }
}

export function getAdminCredentials(env: Env) {
  assertRuntimeConfig(env);

  return {
    username: env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME,
    password: env.ADMIN_PASSWORD,
    secret: env.SESSION_SECRET,
  };
}

function parseCookies(request: Request) {
  const cookieHeader = request.headers.get('Cookie') || '';
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split('=');
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

async function sign(value: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function createSessionCookie(request: Request, env: Env) {
  const { secret } = getAdminCredentials(env);
  const payload = `${Date.now()}.${crypto.randomUUID()}`;
  const signature = await sign(payload, secret);
  const token = `${payload}.${signature}`;
  const isSecure = new URL(request.url).protocol === 'https:';

  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isSecure ? '; Secure' : ''}`;
}

export function clearSessionCookie(request: Request) {
  const isSecure = new URL(request.url).protocol === 'https:';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isSecure ? '; Secure' : ''}`;
}

export async function isAdminAuthenticated(request: Request, env: Env) {
  const { secret } = getAdminCredentials(env);
  const cookies = parseCookies(request);
  const token = cookies[SESSION_COOKIE];

  if (!token) return false;

  const parts = token.split('.');
  if (parts.length < 3) return false;

  const signature = parts.pop() as string;
  const payload = parts.join('.');
  const issuedAt = Number(parts[0]);

  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > 7 * 24 * 60 * 60 * 1000) {
    return false;
  }

  const expected = await sign(payload, secret);
  return timingSafeEqual(signature, expected);
}

export async function requireAdmin(request: Request, env: Env) {
  const ok = await isAdminAuthenticated(request, env);
  if (!ok) {
    throw new Error('UNAUTHORIZED');
  }
}

export async function readJson<T>(request: Request) {
  return (await request.json()) as T;
}
