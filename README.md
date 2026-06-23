# portal.onebuzz

たくさんのアプリを紹介するポータルサイト。

> **現在のフェーズ: 設計フェーズ(実装前)**
> 方針・仕様・要件をドキュメントで固めてから実装に入る。本 README とその他 md がレビュー対象。

## ドキュメント一覧

実装前に、以下の順で内容を確認・合意してから着手する。

| # | ファイル | 内容 |
|---|---|---|
| 1 | [docs/01_requirements.md](docs/01_requirements.md) | 要件定義(何を作るか・スコープ) |
| 2 | [docs/02_architecture.md](docs/02_architecture.md) | 技術構成・アーキテクチャ方針 |
| 3 | [docs/03_security.md](docs/03_security.md) | セキュリティ方針(実装前に必読) |
| 4 | [docs/04_rules.md](docs/04_rules.md) | 開発・運用ルール |
| 5 | [docs/05_database.md](docs/05_database.md) | Supabase スキーマ設計 |

## 確定済みの方針

- **データ管理**: Supabase(Postgres)。アプリ情報は DB で管理し、Supabase Studio から運用追加する。
- **認証**: なし(誰でも閲覧できる公開サイト)。
- **表示言語**: 日本語 + 英語(多言語対応の枠組みを最初から組み込む)。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| 言語 | TypeScript |
| フレームワーク | Next.js (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| データ | Supabase (Postgres) |
| メール | Resend |
| ホスティング | Vercel |
| ソース管理 | GitHub |

## まだ決まっていないこと(要相談)

- アプリのカテゴリ分類・タグ設計の詳細
- トップページのデザイン/レイアウト方向性
- 問い合わせフォームの要否
- 独自ドメイン(portal.onebuzz)の取得・接続手順

## 進め方

方針 → 仕様書 → 要件をすべて固めてから実装。壁打ちしながら各 md を更新していく。
