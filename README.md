# portal.onebuzz.net

`portal.onebuzz.net` で動く、一般ユーザー向けのアプリ紹介ポータル(カタログ / LP)。
各アプリ(`*.onebuzz.net` のサブドメイン)へ送客する。**独立リポ・独立 Vercel プロジェクト**で構築する。

> **現在のフェーズ: 初期実装完了 → アプリ登録待ち**
> Next.js 実装・Vercel/Supabase 接続まで完了。サイトは稼働可能で、あとは `apps` を登録していく段階。
> **次回チャットはまず [docs/07_status.md](docs/07_status.md)(実装状況・引き継ぎ)を読む。**

## ドキュメント一覧

| # | ファイル | 内容 |
|---|---|---|
| 1 | [docs/01_requirements.md](docs/01_requirements.md) | 要件定義(何を作るか・スコープ) |
| 2 | [docs/02_architecture.md](docs/02_architecture.md) | 技術構成・アーキテクチャ方針 |
| 3 | [docs/03_security.md](docs/03_security.md) | セキュリティ方針(必読) |
| 4 | [docs/04_rules.md](docs/04_rules.md) | 開発・運用ルール |
| 5 | [docs/05_database.md](docs/05_database.md) | Supabase スキーマ設計 |
| 6 | [docs/06_affiliate_clickid.md](docs/06_affiliate_clickid.md) | ★唯一の必須要件: aff_click_id Cookie 引き継ぎ |
| 7 | [docs/07_status.md](docs/07_status.md) | **実装状況・引き継ぎ(次回チャットはここから)** |

## 確定済みの方針

- **★核心要件**: アフィリエイト `aff_click_id` を親ドメイン Cookie(`.onebuzz.net`)に保存し、配下アプリへ引き継ぐ。詳細は [docs/06](docs/06_affiliate_clickid.md)。
- **送客のみ**: アカウント登録・決済・成果送信(trackConversion)は一切やらない(アプリ側の責務)。
- **データ管理**: Supabase(Postgres)。アプリ情報は DB で管理し、Supabase Studio から運用追加する。
- **認証**: なし(誰でも閲覧できる公開サイト)。問い合わせフォームも無し。
- **表示言語**: 日本語 + 英語 + 中国語(ja / en / zh)。
- **アプリ画像**: 外部URL(`*.onebuzz.net`)。
- **分類**: カテゴリ(初期=診断/フィットネス/健康)+ タグ(初期=ストレス/睡眠/ダイエット)。
- **トップ**: 注目アプリ(is_featured)枠 + 検索機能あり。
- **デザイン**: 独自デザイン(緑系UI・マスコット「バズ」は採用しない)。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| 言語 | TypeScript |
| フレームワーク | Next.js (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| データ | Supabase (Postgres) |
| メール | Resend(現状未使用) |
| ホスティング | Vercel |
| ソース管理 | GitHub |

## 残タスク(実装フェーズへ)

- 独自ドメイン(`portal.onebuzz.net`)の DNS 接続手順
- ローカル開発時の aff_click_id Cookie 検証方法(プレビュー/本番で実機確認)
- 独自デザインの具体トーン(配色・タイポ)— 実装着手時に決定

## 進め方

方針 → 仕様書 → 要件をすべて固めてから実装。壁打ちしながら各 md を更新していく。
