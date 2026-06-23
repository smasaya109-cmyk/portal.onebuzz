import { createSupabaseServer } from "@/lib/supabase/server";
import type { App, Category } from "@/types/db";

// Supabase の app_tags 経由ネスト形 → Tag[] へ正規化するための内部型
type RawApp = Omit<App, "tags"> & {
  tags?: { tag: App["tags"] extends (infer T)[] ? T : never }[] | null;
};

function normalize(raw: RawApp): App {
  const tags = (raw.tags ?? [])
    .map((t) => t.tag)
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  return { ...raw, tags };
}

const APP_SELECT =
  "*, category:categories(*), tags:app_tags(tag:tags(*))";

/** 公開中アプリ一覧(注目→表示順→新着順) */
export async function getApps(): Promise<App[]> {
  const supabase = createSupabaseServer();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("apps")
      .select(APP_SELECT)
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });

    if (error || !data) return [];
    return (data as unknown as RawApp[]).map(normalize);
  } catch {
    return [];
  }
}

/** slug でアプリ1件取得 */
export async function getAppBySlug(slug: string): Promise<App | null> {
  const supabase = createSupabaseServer();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("apps")
      .select(APP_SELECT)
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return null;
    return normalize(data as unknown as RawApp);
  } catch {
    return null;
  }
}

/** カテゴリ一覧(表示順) */
export async function getCategories(): Promise<Category[]> {
  const supabase = createSupabaseServer();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return data as Category[];
  } catch {
    return [];
  }
}
