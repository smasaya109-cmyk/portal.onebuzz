"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AppCard } from "@/components/AppCard";
import { localizedName, localizedDescription } from "@/lib/content";
import type { App, Category, Locale } from "@/types/db";

/**
 * カテゴリ絞り込み + キーワード検索(MVP)。
 * 公開アプリは多くないため、サーバーで取得済みの一覧をクライアント側で
 * フィルタリングする(名称・説明の部分一致)。
 */
export function AppsBrowser({
  apps,
  categories,
  locale,
}: {
  apps: App[];
  categories: Category[];
  locale: Locale;
}) {
  const t = useTranslations("home");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((app) => {
      if (categoryId && app.category_id !== categoryId) return false;
      if (!q) return true;
      const haystack = [
        localizedName(app, locale),
        localizedDescription(app, locale),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [apps, categoryId, query, locale]);

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">{t("allApps")}</h2>

      <div className="flex flex-col gap-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-black/40 dark:border-white/15 dark:bg-white/5"
        />

        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={categoryId === null}
            onClick={() => setCategoryId(null)}
            label={t("categoryAll")}
          />
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              active={categoryId === c.id}
              onClick={() => setCategoryId(c.id)}
              label={localizedName(c, locale)}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-black/50 dark:text-white/50">
          {t("noResults")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-foreground text-background"
          : "border border-black/15 text-black/70 hover:border-black/40 dark:border-white/15 dark:text-white/70"
      }`}
    >
      {label}
    </button>
  );
}
