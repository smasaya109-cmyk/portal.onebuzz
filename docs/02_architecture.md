# 02. アーキテクチャ方針

> ステータス: ドラフト(壁打ち中)

## 1. 全体構成

```
[パートナー流入: portal.onebuzz.net/?aff_click_id=XXX]
      │  HTTPS
      ▼
[Vercel] ── Next.js (App Router / TypeScript)
      │   ├─ ★ middleware: ?aff_click_id を Cookie(.onebuzz.net)に保存 ← 核心
      │   ├─ ビルド時/ISR: Supabase から公開アプリを取得して静的生成
      │   └─ 問い合わせ等のサーバー処理(Route Handler)
      ▼
[Supabase (Postgres)] ── アプリデータ。RLS で「公開データの読み取りのみ」許可
      │   └─ Storage(画像を置く場合)
      │
      ▼ 送客(普通のリンク。Cookieは親ドメイン共有済み)
[*.onebuzz.net アプリ群] ── Cookie の aff_click_id を読む(SDKはアプリ側)

[Resend] ── 問い合わせ通知メール(サーバー側からのみ呼び出し)
[GitHub] ── ソース管理。push → Vercel 自動デプロイ
```

> ポータルとアプリ群は **同一親ドメイン `onebuzz.net` のサブドメイン**である必要がある(Cookie 共有の前提)。
> このサイトは ASPリポ `onebuzz` とは別の **独立リポ・独立 Vercel プロジェクト**。

## 2. 技術選定と理由

| 項目 | 採用 | 理由 |
|---|---|---|
| 言語 | **TypeScript** | Next.js/Supabase/Vercel すべて第一級サポート。Supabase から型を自動生成でき、DB とフロントの型ズレを防げる。保守・引き継ぎが容易。 |
| フレームワーク | **Next.js (App Router)** | SSG/ISR でポータルに最適。Vercel と相性が最良。SEO・画像最適化・i18n が標準。 |
| UI | **Tailwind CSS + shadcn/ui** | 高速にきれいなUIを構築。デザインの一貫性を保ちやすい。 |
| DB | **Supabase (Postgres)** | マネージドPostgres + 管理UI(Studio)。認証画面を作らなくても Studio から運用追加できる。 |
| メール | **Resend**(現状未使用) | 問い合わせフォームを入れない方針のため現状用途なし。将来必要になった場合の候補として保持。 |
| ホスティング | **Vercel** | GitHub 連携で push 自動デプロイ。プレビュー環境が自動生成。 |

## 2.5 middleware(aff_click_id 引き継ぎ)

- `middleware.ts` で全リクエスト(`matcher: "/:path*"`)を通し、`?aff_click_id` があれば親ドメイン Cookie に上書き保存(ラストクリック)。
- Cookie 仕様・実装コード・テスト観点は [06_affiliate_clickid.md](06_affiliate_clickid.md)(★確定仕様)を正とする。
- middleware は Cookie をセットするだけで、値の加工・外部送信は行わない。

## 3. レンダリング戦略

- **アプリ一覧 / 詳細**: ISR(`revalidate`)で静的生成。閲覧高速 + 追加データを定期反映。
  - アプリを追加したら即時反映したい場合は、Supabase の Webhook → Vercel の On-Demand Revalidation を後で検討。
- **問い合わせ等の動的処理**: Route Handler(サーバー側)で実行。

## 4. Supabase アクセス方針(重要)

- **クライアント(ブラウザ)からは `anon` キーのみ使用**。RLS で読み取り専用に制限。
- **`service_role` キーは絶対にクライアントへ出さない**。サーバー側(Route Handler / Server Component / ビルド)でのみ使用。
- 書き込み(アプリ追加・編集)は当面 **Supabase Studio から手動**。サイト経由の書き込みUIは作らない。
- 詳細は [03_security.md](03_security.md) と [05_database.md](05_database.md)。

## 5. 多言語(i18n)方針

- 対応言語: **ja / en / zh**(3言語)。
- Next.js App Router の `[locale]` セグメント方式(`/ja/...`, `/en/...`, `/zh/...`)を採用。
- ライブラリ: `next-intl`(App Router 対応・型安全)。
- UI 文言は `messages/{ja,en,zh}.json`。
- DB は言語別カラム(`name_ja` / `name_en` / `name_zh` 等)で持つ。3言語は固定運用のためカラム分割で十分。さらに言語が増える場合は翻訳テーブル分離へ移行(→ [05_database.md](05_database.md))。

## 6. ディレクトリ構成(実装時の案)

```
portal.onebuzz/
├─ docs/                # 設計・ルール文書(本フォルダ)
├─ src/
│  ├─ app/
│  │  └─ [locale]/      # ja / en
│  │     ├─ page.tsx           # トップ(一覧)
│  │     └─ apps/[slug]/page.tsx  # アプリ詳細
│  ├─ components/       # UIコンポーネント
│  ├─ lib/
│  │  ├─ supabase/      # クライアント/サーバー用クライアント生成
│  │  └─ i18n/          # 翻訳設定
│  └─ types/            # Supabase 自動生成型 ほか
├─ messages/            # ja.json / en.json(UI文言)
├─ supabase/            # マイグレーション/RLSポリシー(SQL)
├─ .env.example
├─ .env.local           # ★Git管理しない
└─ ...
```

## 7. 環境の分離

| 環境 | 用途 | データ |
|---|---|---|
| Local | 開発 | Supabase ローカル or 開発プロジェクト |
| Preview (Vercel) | PRごとの確認 | 開発/ステージング用 Supabase |
| Production (Vercel) | 本番 | 本番 Supabase プロジェクト |

環境変数は Vercel の Environment Variables で環境ごとに設定。詳細は [04_rules.md](04_rules.md)。
