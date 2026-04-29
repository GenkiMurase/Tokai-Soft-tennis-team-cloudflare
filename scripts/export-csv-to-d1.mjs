import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';

const INPUT_DIR =
  process.env.CSV_IMPORT_DIR ||
  path.resolve(process.cwd(), '吸取データベース');
const OUTPUT_FILE =
  process.env.D1_IMPORT_OUTPUT ||
  path.resolve(process.cwd(), 'cloudflare/d1/import-from-supabase.sql');

const SOURCE_FILES = {
  posts: 'posts_rows.csv',
  players: 'players_rows.csv',
  staff: 'staff_rows.csv',
  teams: 'teams_rows.csv',
  tournaments: 'tournaments_rows.csv',
  matches: 'matches_rows.csv',
  match_games: 'match_games_rows.csv',
  annual_schedules: 'annual_schedules_rows.csv',
  opponent_players: 'opponent_players_rows.csv',
  maintenance_settings: 'maintenance_settings_rows.csv',
};

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

function nullableText(value) {
  return value === '' ? null : value;
}

function intValue(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function boolToInt(value) {
  return value === true || value === 'true' || value === '1' ? 1 : 0;
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

function normalizeRow(table, row) {
  switch (table) {
    case 'posts':
      return {
        id: row.id,
        title: row.title || '',
        content: row.content || '',
        publish_date: row.publish_date || nowIso(),
        header_image: nullableText(row.header_image),
        images: parseJsonArray(row.images),
        created_at: row.publish_date || nowIso(),
        updated_at: row.publish_date || nowIso(),
      };
    case 'players':
      return {
        id: row.id,
        first_name: row.first_name || '',
        last_name: row.last_name || '',
        first_name_kana: row.first_name_kana || '',
        last_name_kana: row.last_name_kana || '',
        grade: intValue(row.grade, 1),
        position: row.position || '前衛',
        school: row.school || '',
        admission_type: row.admission_type || '',
        image: nullableText(row.image),
        usage_count: intValue(row.usage_count, 0),
        created_at: nowIso(),
        updated_at: nowIso(),
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
        image: nullableText(row.image),
        created_at: nowIso(),
        updated_at: nowIso(),
      };
    case 'teams':
      return {
        id: row.id,
        name: row.name || '',
        image: nullableText(row.image),
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
        is_active: boolToInt(row.is_active),
        created_at: row.created_at || nowIso(),
        updated_at: row.updated_at || row.created_at || nowIso(),
      };
    case 'matches':
      return {
        id: row.id,
        tournament_id: row.tournament_id || '',
        team1_id: nullableText(row.team1_id),
        team2_id: nullableText(row.team2_id),
        team1_name: row.team1_name || '',
        team2_name: row.team2_name || '',
        team1_score: intValue(row.team1_score, 0),
        team2_score: intValue(row.team2_score, 0),
        status: row.status || 'upcoming',
        court_number: nullableText(row.court_number),
        start_time: nullableText(row.start_time),
        end_time: nullableText(row.end_time),
        round: nullableText(row.round),
        notes: nullableText(row.notes),
        year: intValue(row.year, new Date().getFullYear()),
        result: nullableText(row.result),
        created_at: row.created_at || nowIso(),
        updated_at: row.updated_at || row.created_at || nowIso(),
      };
    case 'match_games':
      return {
        id: row.id,
        match_id: row.match_id || '',
        game_type: row.game_type || 'doubles',
        game_number: intValue(row.game_number, 1),
        team1_player1: row.team1_player1 || '',
        team1_player2: nullableText(row.team1_player2),
        team2_player1: row.team2_player1 || '',
        team2_player2: nullableText(row.team2_player2),
        team1_score: intValue(row.team1_score, 0),
        team2_score: intValue(row.team2_score, 0),
        result: nullableText(row.result),
        created_at: row.created_at || nowIso(),
        updated_at: row.updated_at || row.created_at || nowIso(),
      };
    case 'annual_schedules':
      return {
        id: row.id,
        date: row.date || '',
        title: row.title || '',
        description: nullableText(row.description),
        tournament_id: nullableText(row.tournament_id),
        created_at: row.created_at || nowIso(),
        updated_at: row.updated_at || row.created_at || nowIso(),
      };
    case 'opponent_players':
      return {
        id: row.id,
        name: row.name || '',
        team_name: row.team_name || '',
        usage_count: intValue(row.usage_count, 0),
        created_at: row.created_at || nowIso(),
        updated_at: row.updated_at || row.created_at || nowIso(),
      };
    case 'maintenance_settings':
      return {
        id: row.id || 'default',
        is_maintenance_mode: boolToInt(row.is_enabled),
        maintenance_message: row.message || 'メンテナンス中です。しばらくお待ちください。',
        updated_at: nullableText(row.updated_at),
        updated_by: null,
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

async function loadTable(table) {
  const fileName = SOURCE_FILES[table];
  const filePath = path.join(INPUT_DIR, fileName);

  try {
    const text = await readFile(filePath, 'utf8');
    return parseCsv(text).map((row) => normalizeRow(table, row));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function main() {
  const datasets = {};

  for (const table of Object.keys(SOURCE_FILES)) {
    datasets[table] = await loadTable(table);
    console.log(`Loaded ${datasets[table].length} rows from ${SOURCE_FILES[table]}`);
  }

  datasets.media_assets = collectMediaAssets(datasets);

  const parts = [
    '-- Generated by scripts/export-csv-to-d1.mjs',
    `-- Source directory: ${INPUT_DIR}`,
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
