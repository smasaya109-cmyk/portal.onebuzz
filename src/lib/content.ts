import type { App, Category, Tag, Locale } from "@/types/db";

/** ロケールに応じた表示名を返す(無ければ日本語にフォールバック) */
export function localizedName(
  row: App | Category | Tag,
  locale: Locale,
): string {
  const key = `name_${locale}` as keyof typeof row;
  return (row[key] as string) || row.name_ja;
}

/** ロケールに応じたアプリ説明を返す(無ければ日本語 → 空文字) */
export function localizedDescription(app: App, locale: Locale): string {
  const key = `description_${locale}` as keyof App;
  return (app[key] as string | null) || app.description_ja || "";
}

/** html lang 属性用(中国語は簡体字 zh-CN) */
export function htmlLang(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : locale;
}
