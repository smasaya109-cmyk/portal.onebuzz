# 03. セキュリティ方針

> ステータス: ドラフト(壁打ち中)。**実装前に必読。実装時はこの方針に違反しないこと。**

公開・認証なしのサイトだが、「シークレットの漏洩」「Supabase への不正書き込み」「フォーム悪用」が主なリスク。以下を遵守する。

## 1. シークレット・環境変数(最重要)

- **シークレットを Git にコミットしない**。`.env.local` 等は `.gitignore` で除外。コミットしてよいのは `.env.example`(値は空)のみ。
- **`SUPABASE_SERVICE_ROLE_KEY` は絶対にクライアントへ露出させない**。
  - `NEXT_PUBLIC_` プレフィックスを付けるのは公開してよい値だけ(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)。
  - service_role / Resend APIキーには `NEXT_PUBLIC_` を**絶対に付けない**。
- 本番のシークレットは Vercel の Environment Variables にのみ保存。ローカルの `.env.local` と本番は別の値。
- キーが漏れた場合は即ローテーション(Supabase / Resend のダッシュボードで再発行)。

## 2. Supabase / RLS(Row Level Security)

- **全テーブルで RLS を有効化する**(デフォルト拒否)。
- `anon`(公開クライアント)には **公開フラグが立った行の SELECT のみ** 許可。INSERT/UPDATE/DELETE は付与しない。
- 書き込みは `service_role`(サーバー側)または Supabase Studio からのみ。
- 例(apps テーブル):
  ```sql
  alter table apps enable row level security;

  create policy "public can read published apps"
    on apps for select
    to anon
    using (status = 'published');
  -- anon への insert/update/delete ポリシーは作らない(= 不可)
  ```
- 機密カラムは公開ビュー/ポリシーで露出させない。公開して困る情報はそもそも公開テーブルに置かない。

## 3. クライアント/サーバーの責務分離

- ブラウザから直接叩いてよいのは「RLSで保護された読み取り」だけ。
- 将来の書き込みは **必ず Route Handler(サーバー側)経由**。
- サーバー専用コードに `service_role` を使う場合、`import 'server-only'` を付け、誤ってクライアントへ混入しないようにする。

## 4. 入力・フォーム対策

- **問い合わせフォームは設けない方針**(確定)。ユーザー入力を受け付けるエンドポイントが無いため、フォーム由来の攻撃面は現状なし。
- 将来フォームやユーザー入力を追加する場合は、サーバー側バリデーション(`zod`)、レート制限、ハニーポット/CAPTCHA、メールヘッダインジェクション対策を必ず実装する。

## 5. 外部リンクの安全性

- アプリの外部URLへのリンクは `rel="noopener noreferrer"` を付与。
- DB に入る URL は信頼できる管理者が登録する前提だが、表示時に `http(s)` スキームのみ許可(`javascript:` 等を弾く)。

## 5.5 aff_click_id Cookie の扱い

- `aff_click_id` は秘密情報ではない(指示書明記)。最終的な成果帰属はアプリ側のサーバ署名で担保される。よって `HttpOnly: false`(JS から読めてよい)。
- それでも以下は守る:
  - Cookie に入れるのは受け取った `aff_click_id` の値**のみ**。他の用途で加工・外部送信しない。
  - `Secure` を本番で必須化(`process.env.NODE_ENV === "production"`)。HTTP では送らない。
  - `SameSite: Lax` 固定(指示書準拠)。
  - `Domain` は `.onebuzz.net` 固定。任意ドメインを動的に受け付けない(Cookie 注入防止)。
  - 値は最大長などの常識的な範囲でそのまま保存(`?aff_click_id` をそのまま流すだけ。SQL等に使わない)。
- 詳細仕様は [06_affiliate_clickid.md](06_affiliate_clickid.md)。

## 6. HTTP セキュリティヘッダ

`next.config` または Vercel でレスポンスヘッダを設定:
- `Content-Security-Policy`(段階的に厳格化。許可ドメイン: Supabase, 画像ホスト, 必要な解析のみ)
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`(クリックジャッキング対策)
- `Permissions-Policy`(不要な権限を無効化)

## 7. 依存関係・サプライチェーン

- 依存パッケージは最小限に。`npm audit` / Dependabot で脆弱性を監視。
- ロックファイル(`package-lock.json` 等)をコミットして再現性を確保。
- 信頼できないパッケージを安易に追加しない。

## 8. 画像・アップロード

- アップロード機能はなし。アプリ画像は外部URL(`*.onebuzz.net`)を `image_url` に登録する運用。
- `next/image` の `remotePatterns` を **`*.onebuzz.net` に限定**し、任意ドメイン読み込みを防ぐ。
  ```ts
  // next.config の images.remotePatterns 例
  { protocol: "https", hostname: "*.onebuzz.net" }
  ```

## 9. ログ・公開情報

- エラーメッセージにシークレットやスタックトレースの詳細を出さない(本番)。
- 解析ツールを入れる場合は個人情報を送らない設定にする。

## 10. インシデント対応(最低限)

- キー漏洩時: 該当キーを即ローテーション → 影響範囲確認 → コミット履歴から除去(履歴に残った場合は要 force-push / 鍵失効)。
- 不正書き込みの疑い: RLS ポリシーと service_role キーの露出を点検。

---

### 実装前チェックリスト(着手時に再確認)

- [ ] `.gitignore` に `.env*`(`.env.example` 除く)が入っている
- [ ] `service_role` / Resend キーに `NEXT_PUBLIC_` を付けていない
- [ ] 全テーブルで RLS 有効、anon は SELECT(published)のみ
- [ ] Resend 呼び出しはサーバー側のみ
- [ ] セキュリティヘッダを設定
- [ ] `next/image` の許可ドメインを限定
- [ ] aff_click_id Cookie: Domain=`.onebuzz.net` 固定 / 本番 Secure / 値を加工・送信しない
