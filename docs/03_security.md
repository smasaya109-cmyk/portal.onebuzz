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
- メール送信(Resend)・将来の書き込みは **必ず Route Handler(サーバー側)経由**。クライアントから Resend を呼ばない。
- サーバー専用コードに `service_role` を使う場合、`import 'server-only'` を付け、誤ってクライアントへ混入しないようにする。

## 4. 入力・フォーム対策(問い合わせを入れる場合)

- サーバー側でバリデーション(`zod` 等)。クライアント検証だけに頼らない。
- スパム/悪用対策: レート制限(IP単位)、ハニーポット項目、必要なら CAPTCHA(Cloudflare Turnstile 等)。
- Resend の送信先は固定(自分の通知用アドレス)。ユーザー入力をそのまま宛先にしない(オープンリレー化を防ぐ)。
- メール本文に入る入力値はエスケープし、ヘッダインジェクションを防ぐ。

## 5. 外部リンクの安全性

- アプリの外部URLへのリンクは `rel="noopener noreferrer"` を付与。
- DB に入る URL は信頼できる管理者が登録する前提だが、表示時に `http(s)` スキームのみ許可(`javascript:` 等を弾く)。

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

## 8. 画像・アップロード(該当する場合)

- アップロード機能は当面なし。画像は管理者が Supabase Storage / 外部URLで用意。
- `next/image` の `remotePatterns` で許可ドメインを明示し、任意ドメイン読み込みを防ぐ。

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
