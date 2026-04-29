# 東海大学ソフトテニス部HP

Cloudflare Pages + Functions + D1 + R2 で安価に運用できる構成へ移行しています。

2026-04-28 時点では `https://tokai-softtennis.com/` はまだ Netlify から配信されています。
Cloudflare 本番へ切り替えるときは、Pages へデプロイしたうえで DNS / 接続先も Cloudflare 側に寄せてください。

## セットアップ

1. 依存関係を入れる

```bash
npm install
```

2. Cloudflare の設定を用意する

`wrangler.jsonc` の以下を実環境に置き換えてください。

- `database_id`
- `bucket_name`

3. ローカル用の機密値を作る

```bash
cp .dev.vars.example .dev.vars
```

`.dev.vars` に以下を設定してください。

- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `R2_PUBLIC_BASE_URL`

本番では Cloudflare Pages / Workers の Environment Variables / Secrets に同じ値を設定します。

本番で最低限必要な runtime config:

- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `R2_PUBLIC_BASE_URL`  
  例: `https://pub-xxxx.r2.dev`

`ADMIN_USERNAME` は未指定なら `admin@tokai-soft.com` を使います。

4. D1 にスキーマを投入する

```bash
npx wrangler d1 execute tokai-softtennis-db --file=./cloudflare/d1/schema.sql
```

5. ローカル確認

フロントだけ確認する場合:

```bash
npm run dev
```

Cloudflare Functions も含めて確認する場合:

```bash
npm run build
npm run preview:cf
```

別ターミナルで `npm run dev` を立てると、Vite 側から `/api` を `8788` にプロキシできます。

## Cloudflare 構成

- フロント: Cloudflare Pages
- API: Cloudflare Pages Functions
- DB: D1
- 画像: R2

## 実運用メモ

- Pages Functions は [public/_routes.json](/Users/gm/個人/プログラム/東海大学ソフトテニス部HP/public/_routes.json) で `/api/*` と `/media/*` に限定しています。
- この設定により、通常の静的ページ表示では Functions が走らず、Cloudflare 側の無料枠を節約できます。
- `R2_PUBLIC_BASE_URL` に実際の公開 URL を入れると、画像配信を Functions 経由にせず R2 直配信へ寄せられるため、さらに安くなります。
- `ADMIN_PASSWORD` と `SESSION_SECRET` が未設定の状態では、管理系 API は明示的にエラーになります。本番で既定値にフォールバックしないようにしています。

## 本番投入手順

1. D1 を作成する

```bash
npx wrangler d1 create tokai-softtennis-db
```

2. 出力された `database_id` を [wrangler.jsonc](/Users/gm/個人/プログラム/東海大学ソフトテニス部HP/wrangler.jsonc) に入れる

3. R2 を作成する

```bash
npx wrangler r2 bucket create tokai-softtennis-images
```

4. D1 にスキーマを流す

```bash
npx wrangler d1 execute tokai-softtennis-db --remote --file=./cloudflare/d1/schema.sql
```

5. Cloudflare Pages に本番 secrets / vars を設定する

Dashboard で Pages project を開いて `Settings > Variables and Secrets` に以下を設定:

- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `R2_PUBLIC_BASE_URL`
- 必要なら `ADMIN_USERNAME`

6. デプロイする

```bash
npm run build
npx wrangler pages deploy dist
```

## Supabase からの移行メモ

- D1 スキーマは [cloudflare/d1/schema.sql](/Users/gm/個人/プログラム/東海大学ソフトテニス部HP/cloudflare/d1/schema.sql)
- 画像アップロードは R2 に切り替え済み
- 一括画像圧縮 Function は Cloudflare 移行版では停止
- Supabase データを D1 用 SQL に変換するスクリプトは [scripts/export-supabase-to-d1.mjs](/Users/gm/個人/プログラム/東海大学ソフトテニス部HP/scripts/export-supabase-to-d1.mjs)

### Supabase データ移行

1. 環境変数を付けて SQL を生成

```bash
SUPABASE_URL="https://<project-ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
npm run export:supabase
```

2. 生成された SQL を D1 に投入

ローカル:

```bash
npm run import:d1:local
```

本番:

```bash
npm run import:d1:remote
```

補足:

- 出力先は `cloudflare/d1/import-from-supabase.sql`
- `posts / players / staff / teams / tournaments / matches / match_games / annual_schedules / opponent_players / maintenance_settings` を移します
- `media_assets` は既存の画像 URL から最低限のレコードを再構成します
