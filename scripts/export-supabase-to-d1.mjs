import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OUTPUT_FILE =
  process.env.D1_IMPORT_OUTPUT ||
  path.resolve(process.cwd(), 'cloudflare/d1/import-from-supabase.sql');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TABLE_CONFIG = [
  { table: 'match_games', orderBy: 'game_number' },
  { table: 'matches', orderBy: 'start_time' },
  { table: 'annual_schedules', orderBy: 'date' },
  { table: 'tournaments', orderBy: 'start_date' },
  { table: 'opponent_players', orderBy: 'updated_at' },
  { table: 'players', orderBy: 'updated_at' },
  { table: 'staff', orderBy: 'updated_at' },
  { table: 'teams', orderBy: 'updated_at' },
  { table: 'posts', orderBy: 'publish_date' },
  { table: 'maintenance_settings', orderBy: 'updated_at' },
];

const INSERT_ORDER = [
  'posts',
  'players',
  'staff',
  'teams',
  'tournaments',
  'matches',
  'match_games',
  'annual_schedules',
  'opponent_players',
  'maintenance_settings',
  'media_assets',
];

const DELETE_ORDER = [
  'match_games',
  'matches',
  'annual_schedules',
  'tournaments',
  'opponent_players',
  'players',
  'staff',
  'teams',
  'posts',
  'maintenance_settings',
  'media_assets',
];

const nowIso = () => new Date().toISOString();

function sqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (Array.isArray(value) || typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function fetchAll(table, orderBy) {
  const rows = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    let query = supabase.from(table).select('*').range(from, from + pageSize - 1);
    if (orderBy) {
      query = query.order(orderBy, { ascending: true, nullsFirst: false });
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`${table}: ${error.message}`);
    }

    if (!data || data.length === 0) break;
    rows.push(...data);

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

function normalizeRow(table, row) {
  switch (table) {
    case 'posts':
      return {
        id: row.id,
        title: row.title || '',
        content: row.content || '',
        publish_date: row.publish_date || nowIso(),
        header_image: row.header_image || null,
        images: Array.isArray(row.images) ? row.images : [],
        created_at: row.created_at || row.publish_date || nowIso(),
        updated_at: row.updated_at || row.created_at || row.publish_date || nowIso(),
      };
    case 'players':
      return {
        id: row.id,
        first_name: row.first_name || '',
        last_name: row.last_name || '',
        first_name_kana: row.first_name_kana || '',
        last_name_kana: row.last_name_kana || '',
        grade: row.grade ?? 1,
        position: row.position || '前衛',
        school: row.school || '',
        admission_type: row.admission_type || '',
        image: row.image || null,
        usage_count: row.usage_count ?? 0,
        created_at: row.created_at || nowIso(),
        updated_at: row.updated_at || row.created_at || nowIso(),
      };
    case 'staff':
      return {
        id: row.id,
        first_name: row.first_name || '',
        last_name: row.last_name || '',
        first_name_kana: row.first_name_kana || '',
        last_name_kana: row.last_name_kana || '',
        position: row.position || '監督',
        school: row.school || '',
        image: row.image || null,
        created_at: row.created_at || nowIso(),
        updated_at: row.updated_at || row.created_at || nowIso(),
      };
    case 'teams':
      return {
        id: row.id,
        name: row.name || '',
        image: row.image || null,
        created_at: row.created_at || nowIso(),
        updated_at: row.updated_at || row.created_at || nowIso(),
      };
    case 'tournaments':
      return {
        id: row.id,
        name: row.name || '',
        start_date: row.start_date || '',
        end_date: row.end_date || '',
        location: row.location || '',
        is_active: row.is_active ? 1 : 0,
        created_at: row.created_at || nowIso(),
        updated_at: row.updated_at || row.created_at || nowIso(),
      };
    case 'matches':
      return {
        id: row.id,
        tournament_id: row.tournament_id,
        team1_id: row.team1_id || null,
        team2_id: row.team2_id || null,
        team1_name: row.team1_name || '',
        team2_name: row.team2_name || '',
        team1_score: row.team1_score ?? 0,
        team2_score: row.team2_score ?? 0,
        status: row.status || 'upcoming',
        court_number: row.court_number || null,
        start_time: row.start_time || null,
        end_time: row.end_time || null,
        round: row.round || null,
        notes: row.notes || null,
        year: row.year ?? new Date().getFullYear(),
        result: row.result || null,
        created_at: row.created_at || nowIso(),
        updated_at: row.updated_at || row.created_at || nowIso(),
      };
    case 'match_games':
      return {
        id: row.id,
        match_id: row.match_id,
        game_type: row.game_type || 'doubles',
        game_number: row.game_number ?? 1,
        team1_player1: row.team1_player1 || '',
        team1_player2: row.team1_player2 || null,
        team2_player1: row.team2_player1 || '',
        team2_player2: row.team2_player2 || null,
        team1_score: row.team1_score ?? 0,
        team2_score: row.team2_score ?? 0,
        result: row.result || null,
        created_at: row.created_at || nowIso(),
        updated_at: row.updated_at || row.created_at || nowIso(),
      };
    case 'annual_schedules':
      return {
        id: row.id,
        date: row.date || '',
        title: row.title || '',
        description: row.description || null,
        tournament_id: row.tournament_id || null,
        created_at: row.created_at || nowIso(),
        updated_at: row.updated_at || row.created_at || nowIso(),
      };
    case 'opponent_players':
      return {
        id: row.id,
        name: row.name || '',
        team_name: row.team_name || '',
        usage_count: row.usage_count ?? 0,
        created_at: row.created_at || nowIso(),
        updated_at: row.updated_at || row.created_at || nowIso(),
      };
    case 'maintenance_settings':
      return {
        id: row.id || 'default',
        is_maintenance_mode: row.is_maintenance_mode ? 1 : 0,
        maintenance_message: row.maintenance_message || 'メンテナンス中です。しばらくお待ちください。',
        updated_at: row.updated_at || null,
        updated_by: row.updated_by || null,
      };
    default:
      return row;
  }
}

function collectMediaAssets(datasets) {
  const seen = new Map();
  const addUrl = (url) => {
    if (!url || typeof url !== 'string' || seen.has(url)) return;
    let objectKey = null;
    try {
      const parsed = new URL(url);
      objectKey = parsed.pathname.replace(/^\/+/, '') || null;
    } catch {
      objectKey = url.replace(/^\/+/, '') || null;
    }

    seen.set(url, {
      id: crypto.randomUUID(),
      object_key: objectKey || `legacy/${crypto.randomUUID()}`,
      url,
      size: 0,
      content_type: 'application/octet-stream',
      created_at: nowIso(),
    });
  };

  for (const post of datasets.posts || []) {
    addUrl(post.header_image);
    for (const image of post.images || []) addUrl(image);
  }

  for (const player of datasets.players || []) addUrl(player.image);
  for (const member of datasets.staff || []) addUrl(member.image);
  for (const team of datasets.teams || []) addUrl(team.image);

  return [...seen.values()];
}

function buildInsert(table, rows) {
  if (!rows.length) return '';
  const columns = Object.keys(rows[0]);
  const values = rows
    .map((row) => `(${columns.map((column) => sqlValue(row[column])).join(', ')})`)
    .join(',\n');

  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n${values};\n`;
}

async function main() {
  const datasets = {};

  for (const config of TABLE_CONFIG) {
    const rawRows = await fetchAll(config.table, config.orderBy);
    datasets[config.table] = rawRows.map((row) => normalizeRow(config.table, row));
    console.log(`Fetched ${datasets[config.table].length} rows from ${config.table}`);
  }

  datasets.media_assets = collectMediaAssets(datasets);

  const parts = [
    '-- Generated by scripts/export-supabase-to-d1.mjs',
    `-- Source: ${SUPABASE_URL}`,
    `-- Generated at: ${nowIso()}`,
    '',
    'PRAGMA defer_foreign_keys = ON;',
    'BEGIN TRANSACTION;',
    '',
  ];

  for (const table of DELETE_ORDER) {
    parts.push(`DELETE FROM ${table};`);
  }

  parts.push('');

  for (const table of INSERT_ORDER) {
    const sql = buildInsert(table, datasets[table] || []);
    if (sql) parts.push(sql);
  }

  parts.push('COMMIT;');
  parts.push('');

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, parts.join('\n'), 'utf8');
  console.log(`Wrote ${OUTPUT_FILE}`);
}

await main();
