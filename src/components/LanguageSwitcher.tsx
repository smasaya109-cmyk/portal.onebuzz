"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types/db";

// 各ロケールの国旗(絵文字)
const FLAGS: Record<Locale, string> = {
  ja: "🇯🇵",
  en: "🇺🇸",
  zh: "🇨🇳",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("locale");

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 外側クリック / Esc で閉じる
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function select(l: Locale) {
    setOpen(false);
    if (l !== locale) router.replace(pathname, { locale: l });
  }

  return (
    <div ref={ref} className="relative text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md border border-black/10 px-2.5 py-1.5 transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
      >
        <span aria-hidden className="text-base leading-none">
          {FLAGS[locale]}
        </span>
        <span className="font-medium">{t(locale)}</span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 text-black/40 transition dark:text-white/40 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-1 min-w-[9rem] overflow-hidden rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/15 dark:bg-neutral-900"
        >
          {routing.locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => select(l)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-black/5 dark:hover:bg-white/10 ${
                  l === locale ? "font-semibold" : "text-black/70 dark:text-white/70"
                }`}
              >
                <span aria-hidden className="text-base leading-none">
                  {FLAGS[l]}
                </span>
                <span>{t(l)}</span>
                {l === locale && (
                  <svg
                    aria-hidden
                    viewBox="0 0 20 20"
                    className="ml-auto h-4 w-4 text-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m5 10 3.5 3.5L15 6.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
