import crypto from 'node:crypto';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

const INPUT_DIR =
  process.env.CSV_IMPORT_DIR ||
  path.resolve(process.cwd(), '吸取データベース');
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'tokai-softtennis-images';
const PUBLIC_BASE_URL = (
  process.env.MEDIA_PUBLIC_BASE_URL || 'https://tokai-softtennis.com/media'
).replace(/\/$/, '');
const OUTPUT_SQL =
  process.env.IMAGE_MIGRATION_SQL_OUTPUT ||
  path.resolve(process.cwd(), 'cloudflare/d1/update-media-urls.sql');
const OUTPUT_FAILURES =
  process.env.IMAGE_MIGRATION_FAILURES_OUTPUT ||
  path.resolve(process.cwd(), 'cloudflare/d1/image-migration-failures.json');
const DRY_RUN = process.argv.includes('--dry-run');

const SOURCE_FILES = {
  posts: 'posts_rows.csv',
  players: 'players_rows.csv',
  staff: 'staff_rows.csv',
  teams: 'teams_rows.csv',
};

const CONTENT_TYPE_BY_EXT = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.svg', 'image/svg+xml'],
  ['.avif', 'image/avif'],
]);

function sqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (Array.isArray(value) || typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    if (char !== '\r') {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).filter((values) => values.some((value) => value !== '')).map((values) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? '';
    });
    return record;
  });
}

async function readRows(name) {
  const file = path.join(INPUT_DIR, SOURCE_FILES[name]);
  try {
    return parseCsv(await readFile(file, 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

function parseJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string' && item) : [];
  } catch {
    return [];
  }
}

function shouldMigrateUrl(url) {
  if (!url) return false;
  if (url.startsWith('/media/')) return false;
  if (url.startsWith('https://tokai-softtennis.com/media/')) return false;
  return /^https?:\/\//.test(url);
}

function guessExtension(url, contentType) {
  const normalizedType = (contentType || '').split(';')[0].trim().toLowerCase();
  for (const [ext, type] of CONTENT_TYPE_BY_EXT.entries()) {
    if (type === normalizedType) return ext;
  }

  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname).toLowerCase();
    if (ext) return ext;
  } catch {
    // ignore
  }

  return '.bin';
}

function guessContentType(url, headerValue) {
  const normalizedType = (headerValue || '').split(';')[0].trim().toLowerCase();
  if (normalizedType) return normalizedType;
  const ext = guessExtension(url, '');
  return CONTENT_TYPE_BY_EXT.get(ext) || 'application/octet-stream';
}

function buildObjectKey(url, contentType) {
  const hash = crypto.createHash('sha1').update(url).digest('hex');
  const ext = guessExtension(url, contentType);
  return `images/legacy/${hash}${ext}`;
}

async function downloadImage(url, tempDir) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'TokaiSofttennisMigration/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = guessContentType(url, response.headers.get('content-type'));
  const objectKey = buildObjectKey(url, contentType);
  const filePath = path.join(tempDir, path.basename(objectKey));
  await writeFile(filePath, buffer);

  return {
    filePath,
    contentType,
    objectKey,
    size: buffer.byteLength,
  };
}

async function uploadToR2(objectKey, filePath, contentType) {
  await execFile(
    'npx',
    [
      'wrangler',
      'r2',
      'object',
      'put',
      `${BUCKET_NAME}/${objectKey}`,
      '--remote',
      '--file',
      filePath,
      '--content-type',
      contentType,
    ],
    {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: 1024 * 1024 * 8,
    }
  );
}

async function collectSourceData() {
  const [posts, players, staff, teams] = await Promise.all([
    readRows('posts'),
    readRows('players'),
    readRows('staff'),
    readRows('teams'),
  ]);

  return { posts, players, staff, teams };
}

function buildMediaReferenceList(data) {
  const urls = new Set();

  for (const post of data.posts) {
    if (shouldMigrateUrl(post.header_image)) urls.add(post.header_image);
    for (const image of parseJsonArray(post.images)) {
      if (shouldMigrateUrl(image)) urls.add(image);
    }
  }

  for (const player of data.players) {
    if (shouldMigrateUrl(player.image)) urls.add(player.image);
  }

  for (const member of data.staff) {
    if (shouldMigrateUrl(member.image)) urls.add(member.image);
  }

  for (const team of data.teams) {
    if (shouldMigrateUrl(team.image)) urls.add(team.image);
  }

  return [...urls];
}

function buildUpdatedRows(data, uploadedByUrl) {
  const replaceUrl = (url) => uploadedByUrl.get(url)?.publicUrl || url;

  const posts = data.posts.map((post) => ({
    id: post.id,
    header_image: shouldMigrateUrl(post.header_image) ? replaceUrl(post.header_image) : post.header_image || null,
    images: parseJsonArray(post.images).map((url) => (shouldMigrateUrl(url) ? replaceUrl(url) : url)),
  }));

  const players = data.players.map((player) => ({
    id: player.id,
    image: shouldMigrateUrl(player.image) ? replaceUrl(player.image) : player.image || null,
  }));

  const staff = data.staff.map((member) => ({
    id: member.id,
    image: shouldMigrateUrl(member.image) ? replaceUrl(member.image) : member.image || null,
  }));

  const teams = data.teams.map((team) => ({
    id: team.id,
    image: shouldMigrateUrl(team.image) ? replaceUrl(team.image) : team.image || null,
  }));

  const mediaAssets = [...uploadedByUrl.values()].map((item) => ({
    id: crypto.randomUUID(),
    object_key: item.objectKey,
    url: item.publicUrl,
    size: item.size,
    content_type: item.contentType,
    created_at: new Date().toISOString(),
  }));

  return { posts, players, staff, teams, mediaAssets };
}

function buildSql(updated) {
  const parts = [
    '-- Generated by scripts/migrate-images-to-r2.mjs',
    `-- Generated at: ${new Date().toISOString()}`,
    '',
    'DELETE FROM media_assets;',
    '',
  ];

  if (updated.mediaAssets.length) {
    parts.push(
      'INSERT INTO media_assets (id, object_key, url, size, content_type, created_at) VALUES',
      updated.mediaAssets
        .map(
          (row) =>
            `(${[
              sqlValue(row.id),
              sqlValue(row.object_key),
              sqlValue(row.url),
              sqlValue(row.size),
              sqlValue(row.content_type),
              sqlValue(row.created_at),
            ].join(', ')})`
        )
        .join(',\n') + ';',
      ''
    );
  }

  for (const post of updated.posts) {
    parts.push(
      `UPDATE posts SET header_image = ${sqlValue(post.header_image)}, images = ${sqlValue(JSON.stringify(post.images))} WHERE id = ${sqlValue(post.id)};`
    );
  }

  for (const player of updated.players) {
    parts.push(`UPDATE players SET image = ${sqlValue(player.image)} WHERE id = ${sqlValue(player.id)};`);
  }

  for (const member of updated.staff) {
    parts.push(`UPDATE staff SET image = ${sqlValue(member.image)} WHERE id = ${sqlValue(member.id)};`);
  }

  for (const team of updated.teams) {
    parts.push(`UPDATE teams SET image = ${sqlValue(team.image)} WHERE id = ${sqlValue(team.id)};`);
  }

  parts.push('');
  return parts.join('\n');
}

async function main() {
  const data = await collectSourceData();
  const sourceUrls = buildMediaReferenceList(data);
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'tokai-r2-migrate-'));
  const uploadedByUrl = new Map();
  const failures = [];

  try {
    for (const url of sourceUrls) {
      try {
        const downloaded = await downloadImage(url, tempDir);
        const publicUrl = `${PUBLIC_BASE_URL}/${downloaded.objectKey}`;

        if (!DRY_RUN) {
          await uploadToR2(downloaded.objectKey, downloaded.filePath, downloaded.contentType);
        }

        uploadedByUrl.set(url, {
          objectKey: downloaded.objectKey,
          publicUrl,
          size: downloaded.size,
          contentType: downloaded.contentType,
        });
        console.log(`${DRY_RUN ? 'Prepared' : 'Uploaded'} ${url} -> ${publicUrl}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push({ url, error: message });
        console.warn(`Skipped ${url}: ${message}`);
      }
    }

    const updated = buildUpdatedRows(data, uploadedByUrl);
    const sql = buildSql(updated);
    await writeFile(OUTPUT_SQL, sql, 'utf8');
    await writeFile(OUTPUT_FAILURES, JSON.stringify(failures, null, 2), 'utf8');

    console.log(`${DRY_RUN ? 'Prepared' : 'Uploaded'} ${uploadedByUrl.size} images`);
    console.log(`Wrote ${OUTPUT_SQL}`);
    if (failures.length > 0) {
      console.log(`Recorded ${failures.length} failed URLs in ${OUTPUT_FAILURES}`);
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

await main();
