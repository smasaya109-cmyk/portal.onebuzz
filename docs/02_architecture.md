# 02. アーキテクチャ方針

> ステータス: ドラフト(壁打ち中)

## 1. 全体構成

```
[閲覧者ブラウザ]
      │  HTTPS
      ▼
[Vercel] ── Next.js (App Router / TypeScript)
      │           │
      │           ├─ ビルド時/ISR: Supabase から公開アプリを取得して静的生成
      │           └─ 問い合わせ等のサーバー処理(Route Handler)
      ▼
[Supabase (Postgres)] ── アプリデータ。RLS で「公開データの読み取りのみ」許可
      │
      └─ Storage(画像を置く場合)

[Resend] ── 問い合わせ通知メール(サーバー側からのみ呼び出し)
[GitHub] ── ソース管理。push → Vercel 自動デプロイ
```

## 2. 技術選定と理由

| 項目 | 採用 | 理由 |
|---|---|---|
| 言語 | **TypeScript** | Next.js/Supabase/Vercel すべて第一級サポート。Supabase から型を自動生成でき、DB とフロントの型ズレを防げる。保守・引き継ぎが容易。 |
| フレームワーク | **Next.js (App Router)** | SSG/ISR でポータルに最適。Vercel と相性が最良。SEO・画像最適化・i18n が標準。 |
| UI | **Tailwind CSS + shadcn/ui** | 高速にきれいなUIを構築。デザインの一貫性を保ちやすい。 |
| DB | **Supabase (Postgres)** | マネージドPostgres + 管理UI(Studio)。認証画面を作らなくても Studio から運用追加できる。 |
| メール | **Resend** | シンプルなAPI。問い合わせ通知に十分。 |
| ホスティング | **Vercel** | GitHub 連携で push 自動デプロイ。プレビュー環境が自動生成。 |

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

- Next.js App Router の `[locale]` セグメント方式(`/ja/...`, `/en/...`)を採用予定。
- ライブラリ候補: `next-intl`(App Router 対応・型安全)。
- DB 側はカラムを `name_ja` / `name_en` のように言語別に持つ(シンプル運用)。将来言語が増える場合は翻訳テーブル分離を検討。

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
