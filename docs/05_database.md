# 05. データベース設計(Supabase / Postgres)

> ステータス: ドラフト(壁打ち中)。スキーマは実装合意後に確定する。

## 1. 設計方針

- アプリ情報を中心としたシンプルな構成。MVP は `apps` と `categories` の2テーブル + タグ。
- 多言語は **カラム分割方式**(`name_ja` / `name_en`)で開始。言語が増えたら翻訳テーブル分離に移行。
- 全テーブル RLS 有効、`anon` は公開行の SELECT のみ(→ [03_security.md](03_security.md))。

## 2. テーブル案

### categories(カテゴリ)
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | 主キー |
| slug | text (unique) | URL用識別子(例: `productivity`) |
| name_ja | text | 表示名(日本語) |
| name_en | text | 表示名(英語) |
| sort_order | int | 表示順 |
| created_at | timestamptz | 作成日時 |

### apps(アプリ)
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | 主キー |
| slug | text (unique) | 詳細ページURL用(例: `my-cool-app`) |
| name_ja | text | アプリ名(日本語) |
| name_en | text | アプリ名(英語) |
| description_ja | text | 説明(日本語) |
| description_en | text | 説明(英語) |
| url | text | アプリ本体への外部リンク |
| image_url | text | サムネイル/アイコン |
| category_id | uuid (FK→categories) | カテゴリ |
| status | text | `draft` / `published` |
| is_featured | bool | 注目アプリ枠に出すか |
| sort_order | int | 表示順 |
| published_at | timestamptz | 公開日時(新着順用) |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### tags(タグ)/ app_tags(中間)
- `tags`: id, slug, name_ja, name_en
- `app_tags`: app_id (FK), tag_id (FK) — 多対多
- ※タグが不要なら省略可。要相談。

## 3. RLS ポリシー(案)

```sql
-- 例: apps
alter table apps enable row level security;

create policy "public read published apps"
  on apps for select
  to anon
  using (status = 'published');

-- categories / tags も同様に anon は select のみ許可
-- insert/update/delete のポリシーは作らない(= 管理者/Studioのみ)
```

## 4. インデックス(目安)

- `apps(status, published_at desc)` — 公開一覧の新着順
- `apps(category_id)` — カテゴリ絞り込み
- `apps(slug)` unique — 詳細ページ参照

## 5. 画像の置き場所(要相談)

| 候補 | メモ |
|---|---|
| 外部URL | 一番簡単。各アプリの既存画像URLを `image_url` に入れる |
| Supabase Storage | Supabase内で完結。公開バケットを用意 |
| Vercel Blob | Vercel側で管理 |

→ どれにするかで `image_url` の運用と `next/image` の許可ドメイン設定が変わる。

## 6. マイグレーション運用

- スキーマ変更は `supabase/` 配下に SQL を置きバージョン管理する(手作業の Studio 変更を SQL に反映)。
- 型は `supabase gen types typescript` で生成し `src/types` に置く。

## 7. 未決事項

- [ ] タグ機能は入れるか(`tags` / `app_tags` の要否)
- [ ] 画像の置き場所
- [ ] 多言語をカラム分割のままでよいか(対応言語が3つ以上になる予定があるか)
- [ ] 「注目アプリ(is_featured)」枠を設けるか
