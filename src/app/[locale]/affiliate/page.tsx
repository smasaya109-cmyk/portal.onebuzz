import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LINE_OFFICIAL_URL } from "@/lib/links";

// 静的な案内ページ(データ取得なし)
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "affiliate" });
  return {
    title: t("title"),
    description: t("subtitle"),
    openGraph: { title: t("title"), description: t("subtitle") },
  };
}

// 応募先: onebuzz 公式 LINE(src/lib/links.ts で一元管理)
const SIGNUP_URL = LINE_OFFICIAL_URL;

export default async function AffiliatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("affiliate");

  const points = [
    { title: t("point1Title"), body: t("point1Body") },
    { title: t("point2Title"), body: t("point2Body") },
    { title: t("point3Title"), body: t("point3Body") },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent"
      >
        ← {t("back")}
      </Link>

      <header className="mt-8 flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="text-lg text-muted">{t("subtitle")}</p>
      </header>

      <p className="mt-6 leading-relaxed text-muted">{t("intro")}</p>

      <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {points.map((p, i) => (
          <li
            key={p.title}
            style={{ boxShadow: "var(--shadow-card)" }}
            className="rounded-[var(--radius)] border border-border bg-surface p-6"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-sm font-bold text-accent-strong">
              {i + 1}
            </span>
            <h2 className="mt-4 text-base font-semibold tracking-tight">
              {p.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-col items-start gap-3">
        <a
          href={SIGNUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-strong px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          {t("cta")} →
        </a>
        <p className="text-xs text-muted">{t("note")}</p>
      </div>
    </div>
  );
}
