# 04. 開発・運用ルール

> ステータス: ドラフト(壁打ち中)

## 1. 基本の進め方

- **方針 → 仕様 → 要件を固めてから実装**。ドキュメント(docs/)を先に更新し、合意してからコードを書く。
- 仕様変更は該当 md を更新してから着手する。コードと文書を乖離させない。

## 2. Git / ブランチ運用

- `main`: 本番にデプロイされるブランチ。直接 push しない。
- `feature/xxx`: 機能ごとの作業ブランチ。`main` から分岐し、PR 経由でマージ。
- コミットメッセージは簡潔に何を変えたか(例: `feat: アプリ一覧ページを追加`, `docs: セキュリティ方針を更新`)。
- **`.env.local` や鍵を絶対にコミットしない**(→ [03_security.md](03_security.md))。

### コミットプレフィックス(目安)
| prefix | 用途 |
|---|---|
| feat | 新機能 |
| fix | バグ修正 |
| docs | ドキュメント |
| style | 整形(挙動変更なし) |
| refactor | リファクタ |
| chore | 設定・雑務 |

## 3. デプロイ運用

- GitHub `main` への push → Vercel が **本番自動デプロイ**。
- PR 作成 → Vercel が **プレビューデプロイ**を自動生成。レビューはプレビューURLで確認。
- 本番反映前にプレビューで動作確認する。

## 4. 環境変数の管理

| 変数名 | 公開可否 | 置き場所 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 公開可 | Vercel + .env.local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 公開可 | Vercel + .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | **非公開** | Vercel(本番のみ)+ ローカルのみ |
| `RESEND_API_KEY` | **非公開** | Vercel + .env.local |
| `CONTACT_TO_EMAIL` | 設定値 | Vercel + .env.local |

- 変数を追加したら `.env.example`(値は空)にも追記し、チームで共有できるようにする。
- 本番・プレビュー・開発で値を分ける(特に Supabase プロジェクト)。

## 5. アプリデータの追加運用(コンテンツ運用)

- アプリ追加は当面 **Supabase Studio** から行う(`apps` テーブルに行を追加 → `status = published`)。
- 追加項目(ja/en の名称・説明、URL、カテゴリ、画像)を埋める。
- ISR の revalidate 間隔経過後にサイトへ反映(即時反映は将来 Webhook 対応を検討)。
- URL は信頼できる管理者のみが登録する。

## 6. コード規約

- TypeScript の `strict` を有効化。`any` は極力使わない。
- Lint/Format: ESLint + Prettier を導入し、保存時整形。
- Supabase の型は CLI で自動生成し `src/types` に置く(手書きしない)。
- コンポーネントは小さく分割。サーバー/クライアントコンポーネントの境界を意識する。

## 7. レビュー観点

- セキュリティ方針([03_security.md](03_security.md))に違反していないか
- シークレットの露出がないか
- 多言語(ja/en)両方で表示が壊れていないか
- レスポンシブ(スマホ/PC)で崩れていないか

## 8. ドキュメント更新ルール

- 仕様・方針が変わったら、対応する `docs/*.md` を同じ PR で更新する。
- 各 md 冒頭のステータス(ドラフト/✅確定)を最新化する。
