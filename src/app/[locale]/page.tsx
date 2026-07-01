import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApps, getCategories } from "@/lib/apps";
import { AppsBrowser } from "@/components/AppsBrowser";
import { AppCard } from "@/components/AppCard";
import { AffiliateCTA } from "@/components/AffiliateCTA";
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
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-aurora border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {apps.length > 0 ? `${apps.length}+ apps` : "onebuzz"}
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        {apps.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted">{t("empty")}</p>
        ) : (
          <div className="flex flex-col gap-16">
            {featured.length > 0 && (
              <section className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {t("featured")}
                  </h2>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* アフィリエイター募集(公式LINEへ) */}
      <AffiliateCTA />
    </main>
  );
}
