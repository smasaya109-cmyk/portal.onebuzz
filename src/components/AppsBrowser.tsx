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
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          {t("allApps")}
        </h2>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="m17 17-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="w-full rounded-full border border-border bg-surface py-3 pl-11 pr-4 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-[var(--accent-soft)]"
          />
        </div>

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
        <p className="py-12 text-center text-sm text-muted">{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-foreground text-background shadow-sm"
          : "border border-border bg-surface text-muted hover:border-accent hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
