const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function buildUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const body = init.body;

  if (!(body instanceof FormData) && body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    ...init,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String(payload.error)
        : response.statusText || 'リクエストに失敗しました';
    throw new Error(message);
  }

  return payload as T;
}

export function apiGet<T>(path: string) {
  return apiRequest<T>(path);
}

export function apiPost<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
}

export function apiPut<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T>(path: string) {
  return apiRequest<T>(path, { method: 'DELETE' });
}
