# 05. データベース設計(Supabase / Postgres)

> ステータス: ドラフト(壁打ち中)。スキーマは実装合意後に確定する。

## 1. 設計方針

- アプリ情報を中心とした構成。テーブルは `categories` / `apps` / `tags` / `app_tags` の4つ。
- 多言語は **カラム分割方式**(`name_ja` / `name_en` / `name_zh`)。対応言語は **ja / en / zh** の3言語固定。さらに増える場合は翻訳テーブル分離に移行。
- アプリ画像は **外部URL(`*.onebuzz.net`)** を `image_url` に格納(Storage は使わない)。
- 全テーブル RLS 有効、`anon` は公開行の SELECT のみ(→ [03_security.md](03_security.md))。

## 2. テーブル案

### categories(カテゴリ)
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | 主キー |
| slug | text (unique) | URL用識別子(例: `diagnosis`) |
| name_ja | text | 表示名(日本語) |
| name_en | text | 表示名(英語) |
| name_zh | text | 表示名(中国語) |
| sort_order | int | 表示順 |
| created_at | timestamptz | 作成日時 |

**初期カテゴリ(将来増加していく):**
| slug | name_ja | name_en | name_zh(参考) |
|---|---|---|---|
| diagnosis | 診断 | Diagnosis | 诊断 |
| fitness | フィットネス | Fitness | 健身 |
| health | 健康 | Health | 健康 |

### apps(アプリ)
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | 主キー |
| slug | text (unique) | 詳細ページURL用(例: `my-cool-app`) |
| name_ja | text | アプリ名(日本語) |
| name_en | text | アプリ名(英語) |
| name_zh | text | アプリ名(中国語) |
| description_ja | text | 説明(日本語) |
| description_en | text | 説明(英語) |
| description_zh | text | 説明(中国語) |
| url | text | アプリ本体への外部リンク(`*.onebuzz.net`) |
| image_url | text | サムネイル/アイコン(外部URL: `*.onebuzz.net`) |
| category_id | uuid (FK→categories) | カテゴリ |
| status | text | `draft` / `published` |
| is_featured | bool | 注目アプリ枠に出すか |
| sort_order | int | 表示順 |
| published_at | timestamptz | 公開日時(新着順用) |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### tags(タグ)/ app_tags(中間) ✅採用
- `tags`: id (uuid PK), slug (text unique), name_ja, name_en, name_zh, created_at
- `app_tags`: app_id (FK→apps), tag_id (FK→tags), PK は (app_id, tag_id) — 多対多
- カテゴリは1アプリ1つ、タグは複数付与できる運用。

## 3. RLS ポリシー(案)

```sql
-- 例: apps
alter table apps enable row level security;

create policy "public read published apps"
  on apps for select
  to anon
  using (status = 'published');

-- categories / tags / app_tags も同様に anon は select のみ許可
create policy "public read categories" on categories for select to anon using (true);
create policy "public read tags"       on tags       for select to anon using (true);
create policy "public read app_tags"   on app_tags   for select to anon using (true);
-- insert/update/delete のポリシーは作らない(= 管理者/Studioのみ)
```

## 4. インデックス(目安)

- `apps(status, published_at desc)` — 公開一覧の新着順
- `apps(category_id)` — カテゴリ絞り込み
- `apps(slug)` unique — 詳細ページ参照

## 5. 画像の置き場所 ✅確定: 外部URL

- アプリ画像は各アプリのサブドメイン(`*.onebuzz.net`)上の画像 URL を `image_url` に格納する。
- Supabase Storage / Vercel Blob は使わない。
- `next/image` の `remotePatterns` を `*.onebuzz.net` に限定する(任意ドメイン読み込み防止 → [03_security.md](03_security.md))。

## 6. マイグレーション運用

- スキーマ変更は `supabase/` 配下に SQL を置きバージョン管理する(手作業の Studio 変更を SQL に反映)。
- 型は `supabase gen types typescript` で生成し `src/types` に置く。

## 7. 確定事項(2026-06-23)

- ✅ タグ機能: 採用(`tags` / `app_tags`)
- ✅ 画像: 外部URL(`*.onebuzz.net`)
- ✅ 多言語: ja / en / zh のカラム分割

## 8. 未決事項

- [ ] 「注目アプリ(is_featured)」枠を設けるか
- [ ] 中国語は簡体字(zh-CN)でよいか
- [ ] 初期タグの具体リスト(カテゴリ確定後に詰める)
