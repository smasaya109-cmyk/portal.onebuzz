// Supabase の手書き型(将来 `supabase gen types typescript` で自動生成に置き換え予定)

export type Locale = "ja" | "en" | "zh";
export type AppStatus = "draft" | "published";

export interface Category {
  id: string;
  slug: string;
  name_ja: string;
  name_en: string;
  name_zh: string;
  sort_order: number;
}

export interface Tag {
  id: string;
  slug: string;
  name_ja: string;
  name_en: string;
  name_zh: string;
}

export interface App {
  id: string;
  slug: string;
  name_ja: string;
  name_en: string;
  name_zh: string;
  description_ja: string | null;
  description_en: string | null;
  description_zh: string | null;
  url: string;
  image_url: string | null;
  category_id: string | null;
  status: AppStatus;
  is_featured: boolean;
  sort_order: number;
  published_at: string | null;
  // join 済みの関連
  category?: Category | null;
  tags?: Tag[];
}
