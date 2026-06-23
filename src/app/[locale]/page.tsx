import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApps, getCategories } from "@/lib/apps";
import { AppsBrowser } from "@/components/AppsBrowser";
import { AppCard } from "@/components/AppCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Locale } from "@/types/db";

// ISR: 5分ごとに再生成(Supabase の更新を反映)
export const revalidate = 300;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;

  const [apps, categories] = await Promise.all([getApps(), getCategories()]);
  const featured = apps.filter((a) => a.is_featured);
  const t = await getTranslations("home");

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60 sm:text-base">
            {t("heroSubtitle")}
          </p>
        </div>
        <LanguageSwitcher />
      </header>

      {apps.length === 0 ? (
        <p className="py-20 text-center text-sm text-black/50 dark:text-white/50">
          {t("empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-12">
          {featured.length > 0 && (
            <section className="flex flex-col gap-5">
              <h2 className="text-xl font-bold">{t("featured")}</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((app) => (
                  <AppCard key={app.id} app={app} locale={locale} />
                ))}
              </div>
            </section>
          )}

          <AppsBrowser apps={apps} categories={categories} locale={locale} />
        </div>
      )}
    </div>
  );
}
