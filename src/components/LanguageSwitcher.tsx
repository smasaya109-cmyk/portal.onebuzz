"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("locale");

  return (
    <div className="flex items-center gap-1 text-sm">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-current={l === locale}
          className={`rounded-md px-2 py-1 transition ${
            l === locale
              ? "font-semibold text-foreground"
              : "text-black/50 hover:text-foreground dark:text-white/50"
          }`}
        >
          {t(l)}
        </button>
      ))}
    </div>
  );
}
