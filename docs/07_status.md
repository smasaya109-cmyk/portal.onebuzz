# 07. 実装状況・引き継ぎ(次回チャット用)

> 最終更新: 2026-06-23
> このファイルを最初に読めば現状を把握できる。詳細仕様は 01〜06 を参照。

## 1. 現在地(サマリー)

**仕様確定 → 初期実装 → Vercel/Supabase 接続まで完了。サイトは本番稼働可能な状態。**
アプリデータが空なので、あとは `apps` を登録していくフェーズ。

- 本番ドメイン: `portal.onebuzz.net`(Vercel に Import 済み・DNS 接続済み)
- GitHub: https://github.com/smasaya109-cmyk/portal.onebuzz(`main` push で自動デプロイ)
- ローカル: `~/Desktop/portal.onebuzz`(`pnpm dev` で起動)

## 2. 完了していること ✅

| 区分 | 内容 |
|---|---|
| ドキュメント | 要件/構成/セキュリティ/ルール/DB/click_id 仕様(docs/01〜06) |
| フレームワーク | Next.js 16(App Router, Turbopack)+ TypeScript + Tailwind 4 |
| ★click_id 引き継ぎ | `middleware.ts` 実装・実機検証済(Cookie 属性が仕様と一致) |
| 多言語 | next-intl で ja / en / zh(簡体字)。`/ja` `/en` `/zh` |
| ページ | トップ(注目枠 + カテゴリ絞り込み + 検索 + 一覧)/ アプリ詳細 |
| データ層 | Supabase(anon 読み取り、env 未設定でも空状態でビルド可) |
| DB | スキーマ + RLS + seed 投入済(categories 3件 / tags 3件 / apps 0件) |
| セキュリティ | RLS で anon 書き込み拒否を確認(401)/ 画像ドメイン限定 / セキュリティヘッダ |
| 運用方針 | アプリ追加は当面 Claude Code 経由(管理画面なし)→ §6 |

## 3. 主要ファイルの地図

```
middleware.ts                      ★click_id Cookie + i18n 振り分け
next.config.ts                     画像ドメイン制限 / セキュリティヘッダ / turbopack root
src/i18n/{routing,request,navigation}.ts   多言語設定
messages/{ja,en,zh}.json           UI 文言
src/app/[locale]/layout.tsx        ロケール別ルート(html lang, metadata)
src/app/[locale]/page.tsx          トップページ(ISR 5分)
src/app/[locale]/apps/[slug]/page.tsx  詳細(ISR 5分, generateStaticParams)
src/components/AppCard.tsx          カード
src/components/AppsBrowser.tsx      検索+カテゴリ絞り込み(client)
src/components/LanguageSwitcher.tsx 言語切替(client)
src/lib/apps.ts                    Supabase 取得(getApps/getAppBySlug/getCategories)
src/lib/content.ts                 多言語表示ヘルパ(localizedName など)
src/lib/supabase/server.ts         anon クライアント生成
src/types/db.ts                    型定義(将来 gen types に置換)
supabase/migrations/0001_init.sql  スキーマ+RLS+seed
```

## 4. 環境変数(値は .env.local / Vercel 側にあり、Git には無い)

| 変数 | 用途 | 備考 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 接続 | 公開可 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 読み取り(RLS) | 公開可 |
| `SUPABASE_SERVICE_ROLE_KEY` | 現状アプリ未使用(ローカルのみ保持) | ★公開厳禁 |
| `NEXT_PUBLIC_SITE_URL` | metadata 等 | ローカル=localhost / 本番=https://portal.onebuzz.net |
| `NEXT_PUBLIC_AFF_COOKIE_DOMAIN` | 参考用 | 実際の Cookie ドメインは middleware 内で `.onebuzz.net` 固定 |

- Supabase プロジェクトは作成済み・スキーマ適用済み。
- ローカル開発は `.env.local` に値あり(Git 管理外)。

## 5. ローカルでの動かし方

```bash
cd ~/Desktop/portal.onebuzz
pnpm install     # 初回のみ
pnpm dev         # http://localhost:3000 → /ja に redirect
pnpm build       # 本番ビルド確認
pnpm lint
```

> 注意: `next dev`(開発)は NODE_ENV=development のため、click_id Cookie の `Domain=.onebuzz.net` / `Secure` は付かない(localhost では付けられないため)。本番属性の確認は `pnpm build && pnpm start` か Vercel 上で行う。

## 6. アプリの追加方法(運用)★

当面は **Claude Code に情報を送る → Claude が Supabase に登録**(管理画面は作らない方針)。

ユーザーが送る最小情報:
- アプリ名(日本語) / URL(`*.onebuzz.net`) / カテゴリ(診断・フィットネス・健康)

任意: 説明(日本語) / 画像URL(`*.onebuzz.net`) / タグ(ストレス・睡眠・ダイエット) / 注目フラグ

Claude が自動補完: `slug` 生成 / en・zh 翻訳 / カテゴリ・タグ ID マッピング / `status='published'` / `published_at` / 必要なら `is_featured`。

→ 登録後、最大5分(ISR revalidate)で本番反映。手動運用なら Supabase Studio の `apps` テーブルに直接追加でも可。

## 7. 次にやること候補(未着手)

- [ ] サンプルアプリ1件を入れて本番表示の通し確認(一覧/詳細/注目枠/言語切替)
- [ ] ヘッダー/フッター・デザインのトーン詰め(現状は無彩色ミニマル、緑/マスコットは不採用)
- [ ] SEO 仕上げ(`sitemap.ts` / `robots.ts` / 各ページ OGP 画像)
- [ ] アプリが増えたら検索を Postgres 全文検索へ(現状はクライアント側フィルタ)
- [ ] 即時反映が欲しくなったら Supabase Webhook → On-Demand Revalidation
- [ ] `supabase gen types typescript` で型を自動生成に置換
- [ ] アプリ多数 or 他者運用になったら認証付き管理画面を検討

## 8. 重要な決定事項(忘れないこと)

- 役割は **送客のみ**。登録・決済・成果送信・SDK 導入は**やらない**(アプリ側責務)。
- **唯一の必須要件は click_id 引き継ぎ**(docs/06、厳守)。
- 認証なしの公開サイト。問い合わせフォームなし。
- ポータルもアプリも **同一親ドメイン `onebuzz.net`** であることが Cookie 共有の前提。
- このリポは ASPリポ `onebuzz` とは別の独立リポ・独立 Vercel プロジェクト。
