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
    <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent"
      >
        ← {t("back")}
      </Link>

      <article className="mt-8 flex flex-col gap-6">
        {app.image_url && (
          <div
            style={{ boxShadow: "var(--shadow-card)" }}
            className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius)] border border-border bg-surface"
          >
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
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              {localizedName(app.category, locale)}
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
          {description && (
            <p className="whitespace-pre-line leading-relaxed text-muted">
              {description}
            </p>
          )}
        </div>

        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {app.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
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
          className="inline-flex w-fit items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-strong px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          {t("visit")} →
        </a>
      </article>
    </div>
  );
}
