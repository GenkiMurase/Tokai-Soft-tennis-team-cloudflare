import type {
  AnnualSchedule,
  MaintenanceSettings,
  Match,
  MatchGame,
  OpponentPlayer,
  Player,
  Post,
  Staff,
  Team,
  Tournament,
} from '../../src/types/domain';
import {
  assertRuntimeConfig,
  clearSessionCookie,
  createSessionCookie,
  error,
  getPublicMediaBaseUrl,
  getAdminCredentials,
  isAdminAuthenticated,
  json,
  readJson,
  requireAdmin,
  type Env,
} from '../_shared/http';

type MatchPayload = Omit<Match, 'id'>;
type MatchGamePayload = Omit<MatchGame, 'id' | 'match_id'>;

function nowIso() {
  return new Date().toISOString();
}

function getSegments(request: Request) {
  const url = new URL(request.url);
  return url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
}

function parseImages(value: unknown) {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function asNullableString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

async function listPosts(env: Env) {
  const result = await env.DB.prepare(
    'SELECT id, title, content, publish_date, header_image, images FROM posts ORDER BY publish_date DESC'
  ).all<Post & { images: string }>();

  return (result.results || []).map((post) => ({
    ...post,
    images: parseImages(post.images),
  }));
}

async function listPlayers(env: Env) {
  const result = await env.DB.prepare(
    `SELECT id, first_name, last_name, first_name_kana, last_name_kana, grade, position, school, admission_type, image, usage_count
     FROM players
     ORDER BY usage_count DESC, grade DESC, last_name ASC, first_name ASC`
  ).all<Player>();

  return (result.results || []).map((player) => ({
    ...player,
    name: `${player.last_name} ${player.first_name}`,
  }));
}

async function listStaff(env: Env) {
  const result = await env.DB.prepare(
    `SELECT id, first_name, last_name, first_name_kana, last_name_kana, position, school, image
     FROM staff
     ORDER BY position ASC, last_name ASC, first_name ASC`
  ).all<Staff>();

  return (result.results || []).map((member) => ({
    ...member,
    name: `${member.last_name} ${member.first_name}`,
  }));
}

async function listTeams(env: Env) {
  const result = await env.DB.prepare(
    'SELECT id, name, image FROM teams ORDER BY name ASC'
  ).all<Team>();

  return result.results || [];
}

async function listOpponentPlayers(env: Env) {
  const result = await env.DB.prepare(
    `SELECT id, name, team_name, usage_count, created_at, updated_at
     FROM opponent_players
     ORDER BY usage_count DESC, name ASC`
  ).all<OpponentPlayer>();

  return result.results || [];
}

async function listMatchesData(env: Env) {
  const [tournamentsResult, matchesResult, gamesResult, schedulesResult, teamsResult] = await Promise.all([
    env.DB.prepare(
      'SELECT id, name, start_date, end_date, location, is_active FROM tournaments ORDER BY start_date DESC'
    ).all<Tournament>(),
    env.DB.prepare(
      `SELECT id, tournament_id, team1_id, team2_id, team1_name, team2_name, team1_score, team2_score,
              status, court_number, start_time, end_time, round, notes, year, result
       FROM matches
       ORDER BY start_time DESC`
    ).all<Match>(),
    env.DB.prepare(
      `SELECT id, match_id, game_type, game_number, team1_player1, team1_player2,
              team2_player1, team2_player2, team1_score, team2_score, result
       FROM match_games
       ORDER BY game_number ASC`
    ).all<MatchGame>(),
    env.DB.prepare(
      'SELECT id, date, title, description, tournament_id FROM annual_schedules ORDER BY date ASC'
    ).all<AnnualSchedule>(),
    env.DB.prepare('SELECT id, image FROM teams').all<Team>(),
  ]);

  const gamesByMatchId = new Map<string, MatchGame[]>();
  for (const game of gamesResult.results || []) {
    const current = gamesByMatchId.get(game.match_id) || [];
    current.push(game);
    gamesByMatchId.set(game.match_id, current);
  }

  const teamsById = new Map((teamsResult.results || []).map((team) => [team.id, team]));
  const matches = (matchesResult.results || []).map((match) => ({
    ...match,
    team1_image: match.team1_id ? teamsById.get(match.team1_id)?.image : undefined,
    team2_image: match.team2_id ? teamsById.get(match.team2_id)?.image : undefined,
    games: gamesByMatchId.get(match.id) || [],
  }));

  return {
    tournaments: tournamentsResult.results || [],
    matches,
    annualSchedules: schedulesResult.results || [],
  };
}

async function getMaintenanceSettings(env: Env): Promise<MaintenanceSettings> {
  const result = await env.DB.prepare(
    `SELECT id, is_maintenance_mode, maintenance_message, updated_at, updated_by
     FROM maintenance_settings
     WHERE id = 'default'
     LIMIT 1`
  ).first<MaintenanceSettings>();

  if (result) {
    return {
      ...result,
      is_maintenance_mode: Boolean(result.is_maintenance_mode),
    };
  }

  return {
    id: 'default',
    is_maintenance_mode: false,
    maintenance_message: 'メンテナンス中です。しばらくお待ちください。',
  };
}

async function getImageStats(env: Env) {
  const result = await env.DB.prepare(
    'SELECT COALESCE(SUM(size), 0) AS totalImageSize FROM media_assets'
  ).first<{ totalImageSize: number }>();

  return {
    totalImageSize: Number(result?.totalImageSize || 0),
  };
}

async function handleUploadImage(request: Request, env: Env) {
  await requireAdmin(request, env);

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return error('アップロードするファイルが見つかりません。', 400);
  }

  const extension = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';
  const key = `images/${Date.now()}-${crypto.randomUUID()}${extension}`;
  const publicBaseUrl = getPublicMediaBaseUrl(request, env);
  const url = `${publicBaseUrl}/${key}`;

  await env.IMAGES_BUCKET.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type || 'application/octet-stream',
    },
  });

  await env.DB.prepare(
    `INSERT INTO media_assets (id, object_key, url, size, content_type, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      crypto.randomUUID(),
      key,
      url,
      file.size,
      file.type || 'application/octet-stream',
      nowIso()
    )
    .run();

  return json({ url, key });
}

async function handleMediaRequest(key: string, env: Env) {
  const object = await env.IMAGES_BUCKET.get(key);
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  return new Response(object.body, { headers });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const method = request.method.toUpperCase();
  const segments = getSegments(request);

  try {
    if (segments[0] === 'admin' && segments[1] === 'session' && method === 'GET') {
      assertRuntimeConfig(env);
      const authenticated = await isAdminAuthenticated(request, env);
      return json({ authenticated });
    }

    if (segments[0] === 'admin' && segments[1] === 'login' && method === 'POST') {
      assertRuntimeConfig(env);
      const body = await readJson<{ username: string; password: string }>(request);
      const credentials = getAdminCredentials(env);

      if (body.username !== credentials.username || body.password !== credentials.password) {
        return error('ログイン情報が正しくありません。', 401);
      }

      return json(
        { authenticated: true },
        {
          headers: {
            'Set-Cookie': await createSessionCookie(request, env),
          },
        }
      );
    }

    if (segments[0] === 'admin' && segments[1] === 'logout' && method === 'POST') {
      assertRuntimeConfig(env);
      return json(
        { authenticated: false },
        {
          headers: {
            'Set-Cookie': clearSessionCookie(request),
          },
        }
      );
    }

    if (segments[0] === 'media' && segments.length > 1 && method === 'GET') {
      return handleMediaRequest(segments.slice(1).join('/'), env);
    }

    if (segments[0] === 'posts') {
      if (method === 'GET' && segments.length === 1) {
        return json(await listPosts(env));
      }

      if (method === 'POST' && segments.length === 1) {
        await requireAdmin(request, env);
        const body = await readJson<Omit<Post, 'id'>>(request);
        await env.DB.prepare(
          `INSERT INTO posts (id, title, content, publish_date, header_image, images, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            crypto.randomUUID(),
            body.title,
            body.content,
            body.publish_date,
            asNullableString(body.header_image),
            JSON.stringify(body.images || []),
            nowIso(),
            nowIso()
          )
          .run();
        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'PUT') {
        await requireAdmin(request, env);
        const body = await readJson<Partial<Post>>(request);
        await env.DB.prepare(
          `UPDATE posts
           SET title = ?, content = ?, publish_date = ?, header_image = ?, images = ?, updated_at = ?
           WHERE id = ?`
        )
          .bind(
            body.title || '',
            body.content || '',
            body.publish_date || nowIso(),
            asNullableString(body.header_image),
            JSON.stringify(body.images || []),
            nowIso(),
            segments[1]
          )
          .run();
        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'DELETE') {
        await requireAdmin(request, env);
        await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(segments[1]).run();
        return json({ ok: true });
      }
    }

    if (segments[0] === 'players') {
      if (method === 'GET' && segments.length === 1) {
        return json(await listPlayers(env));
      }

      if (method === 'POST' && segments.length === 1) {
        await requireAdmin(request, env);
        const body = await readJson<Partial<Player>>(request);
        await env.DB.prepare(
          `INSERT INTO players (id, first_name, last_name, first_name_kana, last_name_kana, grade, position, school, admission_type, image, usage_count, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            crypto.randomUUID(),
            body.first_name || '',
            body.last_name || '',
            body.first_name_kana || '',
            body.last_name_kana || '',
            Number(body.grade || 1),
            body.position || '前衛',
            body.school || '',
            body.admission_type || '',
            asNullableString(body.image),
            Number(body.usage_count || 0),
            nowIso(),
            nowIso()
          )
          .run();
        return json({ ok: true });
      }

      if (segments[1] === 'promote-grades' && method === 'POST') {
        await requireAdmin(request, env);
        await env.DB.batch([
          env.DB.prepare('DELETE FROM players WHERE grade = 4'),
          env.DB.prepare('UPDATE players SET grade = grade + 1, updated_at = ? WHERE grade < 4').bind(nowIso()),
        ]);
        return json({ ok: true });
      }

      if (segments[1] === 'increment-usage' && method === 'POST') {
        const body = await readJson<{ playerName: string }>(request);
        await env.DB.prepare(
          `UPDATE players
           SET usage_count = COALESCE(usage_count, 0) + 1, updated_at = ?
           WHERE TRIM(last_name || ' ' || first_name) = ?`
        )
          .bind(nowIso(), body.playerName)
          .run();
        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'PUT') {
        await requireAdmin(request, env);
        const body = await readJson<Partial<Player>>(request);
        await env.DB.prepare(
          `UPDATE players
           SET first_name = ?, last_name = ?, first_name_kana = ?, last_name_kana = ?, grade = ?, position = ?, school = ?, admission_type = ?, image = ?, updated_at = ?
           WHERE id = ?`
        )
          .bind(
            body.first_name || '',
            body.last_name || '',
            body.first_name_kana || '',
            body.last_name_kana || '',
            Number(body.grade || 1),
            body.position || '前衛',
            body.school || '',
            body.admission_type || '',
            asNullableString(body.image),
            nowIso(),
            segments[1]
          )
          .run();
        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'DELETE') {
        await requireAdmin(request, env);
        await env.DB.prepare('DELETE FROM players WHERE id = ?').bind(segments[1]).run();
        return json({ ok: true });
      }
    }

    if (segments[0] === 'staff') {
      if (method === 'GET' && segments.length === 1) {
        return json(await listStaff(env));
      }

      if (method === 'POST' && segments.length === 1) {
        await requireAdmin(request, env);
        const body = await readJson<Partial<Staff>>(request);
        await env.DB.prepare(
          `INSERT INTO staff (id, first_name, last_name, first_name_kana, last_name_kana, position, school, image, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            crypto.randomUUID(),
            body.first_name || '',
            body.last_name || '',
            body.first_name_kana || '',
            body.last_name_kana || '',
            body.position || '監督',
            body.school || '',
            asNullableString(body.image),
            nowIso(),
            nowIso()
          )
          .run();
        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'PUT') {
        await requireAdmin(request, env);
        const body = await readJson<Partial<Staff>>(request);
        await env.DB.prepare(
          `UPDATE staff
           SET first_name = ?, last_name = ?, first_name_kana = ?, last_name_kana = ?, position = ?, school = ?, image = ?, updated_at = ?
           WHERE id = ?`
        )
          .bind(
            body.first_name || '',
            body.last_name || '',
            body.first_name_kana || '',
            body.last_name_kana || '',
            body.position || '監督',
            body.school || '',
            asNullableString(body.image),
            nowIso(),
            segments[1]
          )
          .run();
        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'DELETE') {
        await requireAdmin(request, env);
        await env.DB.prepare('DELETE FROM staff WHERE id = ?').bind(segments[1]).run();
        return json({ ok: true });
      }
    }

    if (segments[0] === 'teams') {
      if (method === 'GET' && segments.length === 1) {
        return json(await listTeams(env));
      }

      if (method === 'POST' && segments.length === 1) {
        await requireAdmin(request, env);
        const body = await readJson<Partial<Team>>(request);
        await env.DB.prepare(
          'INSERT INTO teams (id, name, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
        )
          .bind(crypto.randomUUID(), body.name || '', asNullableString(body.image), nowIso(), nowIso())
          .run();
        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'PUT') {
        await requireAdmin(request, env);
        const body = await readJson<Partial<Team>>(request);
        await env.DB.prepare('UPDATE teams SET name = ?, image = ?, updated_at = ? WHERE id = ?')
          .bind(body.name || '', asNullableString(body.image), nowIso(), segments[1])
          .run();
        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'DELETE') {
        await requireAdmin(request, env);
        await env.DB.prepare('DELETE FROM teams WHERE id = ?').bind(segments[1]).run();
        return json({ ok: true });
      }
    }

    if (segments[0] === 'opponent-players') {
      if (method === 'GET' && segments.length === 1) {
        return json(await listOpponentPlayers(env));
      }

      if (method === 'POST' && segments.length === 1) {
        await requireAdmin(request, env);
        const body = await readJson<{ name: string; team_name: string }>(request);
        await env.DB.prepare(
          `INSERT INTO opponent_players (id, name, team_name, usage_count, created_at, updated_at)
           VALUES (?, ?, ?, 0, ?, ?)`
        )
          .bind(crypto.randomUUID(), body.name, body.team_name, nowIso(), nowIso())
          .run();
        return json({ ok: true });
      }

      if (segments[1] === 'increment-usage' && method === 'POST') {
        const body = await readJson<{ playerName: string; teamName: string }>(request);
        await env.DB.prepare(
          `INSERT INTO opponent_players (id, name, team_name, usage_count, created_at, updated_at)
           VALUES (?, ?, ?, 1, ?, ?)
           ON CONFLICT(name, team_name)
           DO UPDATE SET usage_count = usage_count + 1, updated_at = excluded.updated_at`
        )
          .bind(crypto.randomUUID(), body.playerName, body.teamName, nowIso(), nowIso())
          .run();
        return json({ ok: true });
      }
    }

    if (segments[0] === 'matches-data' && method === 'GET') {
      return json(await listMatchesData(env));
    }

    if (segments[0] === 'tournaments') {
      if (method === 'POST' && segments.length === 1) {
        await requireAdmin(request, env);
        const body = await readJson<Partial<Tournament>>(request);
        await env.DB.prepare(
          `INSERT INTO tournaments (id, name, start_date, end_date, location, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            crypto.randomUUID(),
            body.name || '',
            body.start_date || '',
            body.end_date || '',
            body.location || '',
            body.is_active ? 1 : 0,
            nowIso(),
            nowIso()
          )
          .run();
        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'PUT') {
        await requireAdmin(request, env);
        const body = await readJson<Partial<Tournament>>(request);
        await env.DB.prepare(
          `UPDATE tournaments
           SET name = ?, start_date = ?, end_date = ?, location = ?, is_active = ?, updated_at = ?
           WHERE id = ?`
        )
          .bind(
            body.name || '',
            body.start_date || '',
            body.end_date || '',
            body.location || '',
            body.is_active ? 1 : 0,
            nowIso(),
            segments[1]
          )
          .run();
        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'DELETE') {
        await requireAdmin(request, env);
        await env.DB.prepare('DELETE FROM tournaments WHERE id = ?').bind(segments[1]).run();
        return json({ ok: true });
      }
    }

    if (segments[0] === 'matches') {
      if (method === 'POST' && segments.length === 1) {
        await requireAdmin(request, env);
        const body = await readJson<{ match: MatchPayload; games: MatchGamePayload[] }>(request);
        const matchId = crypto.randomUUID();

        await env.DB.prepare(
          `INSERT INTO matches (id, tournament_id, team1_id, team2_id, team1_name, team2_name, team1_score, team2_score,
                                status, court_number, start_time, end_time, round, notes, year, result, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            matchId,
            body.match.tournament_id,
            asNullableString(body.match.team1_id),
            asNullableString(body.match.team2_id),
            body.match.team1_name,
            body.match.team2_name,
            Number(body.match.team1_score || 0),
            Number(body.match.team2_score || 0),
            body.match.status,
            asNullableString(body.match.court_number),
            asNullableString(body.match.start_time),
            asNullableString(body.match.end_time),
            asNullableString(body.match.round),
            asNullableString(body.match.notes),
            Number(body.match.year || new Date().getFullYear()),
            asNullableString(body.match.result),
            nowIso(),
            nowIso()
          )
          .run();

        if (body.games.length > 0) {
          await env.DB.batch(
            body.games.map((game) =>
              env.DB.prepare(
                `INSERT INTO match_games (id, match_id, game_type, game_number, team1_player1, team1_player2,
                                          team2_player1, team2_player2, team1_score, team2_score, result, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
              ).bind(
                crypto.randomUUID(),
                matchId,
                game.game_type,
                game.game_number,
                game.team1_player1,
                asNullableString(game.team1_player2),
                game.team2_player1,
                asNullableString(game.team2_player2),
                Number(game.team1_score || 0),
                Number(game.team2_score || 0),
                asNullableString(game.result),
                nowIso(),
                nowIso()
              )
            )
          );
        }

        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'PUT') {
        await requireAdmin(request, env);
        const body = await readJson<{ match: Partial<Match>; games?: MatchGamePayload[] }>(request);
        await env.DB.prepare(
          `UPDATE matches
           SET tournament_id = ?, team1_id = ?, team2_id = ?, team1_name = ?, team2_name = ?, team1_score = ?, team2_score = ?,
               status = ?, court_number = ?, start_time = ?, end_time = ?, round = ?, notes = ?, year = ?, result = ?, updated_at = ?
           WHERE id = ?`
        )
          .bind(
            body.match.tournament_id || '',
            asNullableString(body.match.team1_id),
            asNullableString(body.match.team2_id),
            body.match.team1_name || '',
            body.match.team2_name || '',
            Number(body.match.team1_score || 0),
            Number(body.match.team2_score || 0),
            body.match.status || 'upcoming',
            asNullableString(body.match.court_number),
            asNullableString(body.match.start_time),
            asNullableString(body.match.end_time),
            asNullableString(body.match.round),
            asNullableString(body.match.notes),
            Number(body.match.year || new Date().getFullYear()),
            asNullableString(body.match.result),
            nowIso(),
            segments[1]
          )
          .run();

        if (body.games) {
          await env.DB.prepare('DELETE FROM match_games WHERE match_id = ?').bind(segments[1]).run();
          if (body.games.length > 0) {
            await env.DB.batch(
              body.games.map((game) =>
                env.DB.prepare(
                  `INSERT INTO match_games (id, match_id, game_type, game_number, team1_player1, team1_player2,
                                            team2_player1, team2_player2, team1_score, team2_score, result, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                  crypto.randomUUID(),
                  segments[1],
                  game.game_type,
                  game.game_number,
                  game.team1_player1,
                  asNullableString(game.team1_player2),
                  game.team2_player1,
                  asNullableString(game.team2_player2),
                  Number(game.team1_score || 0),
                  Number(game.team2_score || 0),
                  asNullableString(game.result),
                  nowIso(),
                  nowIso()
                )
              )
            );
          }
        }

        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'DELETE') {
        await requireAdmin(request, env);
        await env.DB.batch([
          env.DB.prepare('DELETE FROM match_games WHERE match_id = ?').bind(segments[1]),
          env.DB.prepare('DELETE FROM matches WHERE id = ?').bind(segments[1]),
        ]);
        return json({ ok: true });
      }
    }

    if (segments[0] === 'annual-schedules') {
      if (method === 'POST' && segments.length === 1) {
        await requireAdmin(request, env);
        const body = await readJson<Partial<AnnualSchedule>>(request);
        await env.DB.prepare(
          `INSERT INTO annual_schedules (id, date, title, description, tournament_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            crypto.randomUUID(),
            body.date || '',
            body.title || '',
            asNullableString(body.description),
            asNullableString(body.tournament_id),
            nowIso(),
            nowIso()
          )
          .run();
        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'PUT') {
        await requireAdmin(request, env);
        const body = await readJson<Partial<AnnualSchedule>>(request);
        await env.DB.prepare(
          `UPDATE annual_schedules
           SET date = ?, title = ?, description = ?, tournament_id = ?, updated_at = ?
           WHERE id = ?`
        )
          .bind(
            body.date || '',
            body.title || '',
            asNullableString(body.description),
            asNullableString(body.tournament_id),
            nowIso(),
            segments[1]
          )
          .run();
        return json({ ok: true });
      }

      if (segments.length === 2 && method === 'DELETE') {
        await requireAdmin(request, env);
        await env.DB.prepare('DELETE FROM annual_schedules WHERE id = ?').bind(segments[1]).run();
        return json({ ok: true });
      }
    }

    if (segments[0] === 'maintenance-settings') {
      if (method === 'GET') {
        return json(await getMaintenanceSettings(env));
      }

      if (method === 'PUT') {
        await requireAdmin(request, env);
        const body = await readJson<Partial<MaintenanceSettings>>(request);
        await env.DB.prepare(
          `INSERT INTO maintenance_settings (id, is_maintenance_mode, maintenance_message, updated_at, updated_by)
           VALUES ('default', ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             is_maintenance_mode = excluded.is_maintenance_mode,
             maintenance_message = excluded.maintenance_message,
             updated_at = excluded.updated_at,
             updated_by = excluded.updated_by`
        )
          .bind(
            body.is_maintenance_mode ? 1 : 0,
            body.maintenance_message || 'メンテナンス中です。しばらくお待ちください。',
            nowIso(),
            body.updated_by || 'admin'
          )
          .run();
        return json({ ok: true });
      }
    }

    if (segments[0] === 'image-stats' && method === 'GET') {
      return json(await getImageStats(env));
    }

    if (segments[0] === 'images' && segments[1] === 'upload' && method === 'POST') {
      return handleUploadImage(request, env);
    }

    if (segments[0] === 'images' && segments[1] === 'compress-existing' && method === 'POST') {
      await requireAdmin(request, env);
      return error('Cloudflare 移行版では一括画像圧縮は停止しました。必要な場合はローカルで一括変換して再アップロードしてください。', 501);
    }

    return error('Not found', 404);
  } catch (caught) {
    if (caught instanceof Error && caught.message === 'UNAUTHORIZED') {
      return error('認証が必要です。', 401);
    }

    console.error(caught);
    const message = caught instanceof Error ? caught.message : 'サーバーエラーが発生しました。';
    return error(message, 500);
  }
};
