import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAppBySlug, getApps } from "@/lib/apps";
import { localizedName, localizedDescription } from "@/lib/content";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types/db";

export const revalidate = 300;

export async function generateStaticParams() {
  const apps = await getApps();
  return routing.locales.flatMap((locale) =>
    apps.map((app) => ({ locale, slug: app.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) return {};
  const name = localizedName(app, locale as Locale);
  const description = localizedDescription(app, locale as Locale);
  return {
    title: name,
    description: description || undefined,
    openGraph: {
      title: name,
      description: description || undefined,
      images: app.image_url ? [app.image_url] : undefined,
    },
  };
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;

  const app = await getAppBySlug(slug);
  if (!app) notFound();

  const t = await getTranslations("appDetail");
  const name = localizedName(app, locale);
  const description = localizedDescription(app, locale);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/"
        className="text-sm text-black/60 hover:text-foreground dark:text-white/60"
      >
        ← {t("back")}
      </Link>

      <article className="mt-6 flex flex-col gap-6">
        {app.image_url && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5">
            <Image
              src={app.image_url}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="flex flex-col gap-3">
          {app.category && (
            <span className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
              {localizedName(app.category, locale)}
            </span>
          )}
          <h1 className="text-2xl font-bold sm:text-3xl">{name}</h1>
          {description && (
            <p className="whitespace-pre-line text-black/70 dark:text-white/70">
              {description}
            </p>
          )}
        </div>

        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {app.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/60 dark:bg-white/10 dark:text-white/60"
              >
                {localizedName(tag, locale)}
              </span>
            ))}
          </div>
        )}

        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center justify-center rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
        >
          {t("visit")} →
        </a>
      </article>
    </div>
  );
}
