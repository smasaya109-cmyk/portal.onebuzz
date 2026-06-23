-- portal.onebuzz 初期スキーマ
-- 仕様: docs/05_database.md / RLS: docs/03_security.md
-- 公開サイト・認証なし。anon は「公開行の SELECT のみ」可。書き込みは Studio / service_role のみ。

-- ============================================================
-- extensions
-- ============================================================
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ============================================================
-- categories
-- ============================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name_ja     text not null,
  name_en     text not null,
  name_zh     text not null,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- tags
-- ============================================================
create table if not exists public.tags (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name_ja     text not null,
  name_en     text not null,
  name_zh     text not null,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- apps
-- ============================================================
create table if not exists public.apps (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name_ja         text not null,
  name_en         text not null,
  name_zh         text not null,
  description_ja  text,
  description_en  text,
  description_zh  text,
  url             text not null,
  image_url       text,
  category_id     uuid references public.categories(id) on delete set null,
  status          text not null default 'draft' check (status in ('draft','published')),
  is_featured     boolean not null default false,
  sort_order      int  not null default 0,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists apps_status_published_at_idx
  on public.apps (status, published_at desc);
create index if not exists apps_category_idx
  on public.apps (category_id);

-- ============================================================
-- app_tags(多対多)
-- ============================================================
create table if not exists public.app_tags (
  app_id  uuid not null references public.apps(id) on delete cascade,
  tag_id  uuid not null references public.tags(id) on delete cascade,
  primary key (app_id, tag_id)
);

-- ============================================================
-- updated_at 自動更新
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists apps_set_updated_at on public.apps;
create trigger apps_set_updated_at
  before update on public.apps
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS: 全テーブル有効化 + anon は SELECT のみ
--   apps は status='published' のみ公開。書き込みポリシーは作らない。
-- ============================================================
alter table public.categories enable row level security;
alter table public.tags       enable row level security;
alter table public.apps       enable row level security;
alter table public.app_tags   enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories"
  on public.categories for select to anon using (true);

drop policy if exists "public read tags" on public.tags;
create policy "public read tags"
  on public.tags for select to anon using (true);

drop policy if exists "public read published apps" on public.apps;
create policy "public read published apps"
  on public.apps for select to anon using (status = 'published');

drop policy if exists "public read app_tags" on public.app_tags;
create policy "public read app_tags"
  on public.app_tags for select to anon using (true);

-- ============================================================
-- seed: 初期カテゴリ / 初期タグ
-- ============================================================
insert into public.categories (slug, name_ja, name_en, name_zh, sort_order) values
  ('diagnosis', '診断',        'Diagnosis', '诊断', 1),
  ('fitness',   'フィットネス', 'Fitness',   '健身', 2),
  ('health',    '健康',        'Health',    '健康', 3)
on conflict (slug) do nothing;

insert into public.tags (slug, name_ja, name_en, name_zh) values
  ('stress', 'ストレス',   'Stress', '压力'),
  ('sleep',  '睡眠',       'Sleep',  '睡眠'),
  ('diet',   'ダイエット', 'Diet',   '减肥')
on conflict (slug) do nothing;
