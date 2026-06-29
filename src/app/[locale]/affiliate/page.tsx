import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

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

// 外部 ASP の登録ページ URL(Vercel / .env.local の NEXT_PUBLIC_AFFILIATE_SIGNUP_URL で設定)
const SIGNUP_URL = process.env.NEXT_PUBLIC_AFFILIATE_SIGNUP_URL || "#";

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
    <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/"
        className="text-sm text-black/60 hover:text-foreground dark:text-white/60"
      >
        ← {t("back")}
      </Link>

      <header className="mt-6 flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-base text-black/60 dark:text-white/60">
          {t("subtitle")}
        </p>
      </header>

      <p className="mt-6 leading-relaxed text-black/70 dark:text-white/70">
        {t("intro")}
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {points.map((p) => (
          <li
            key={p.title}
            className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5"
          >
            <h2 className="text-base font-semibold">{p.title}</h2>
            <p className="mt-2 text-sm text-black/60 dark:text-white/60">
              {p.body}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col items-start gap-3">
        <a
          href={SIGNUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center justify-center rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
        >
          {t("cta")} →
        </a>
        <p className="text-xs text-black/50 dark:text-white/50">{t("note")}</p>
      </div>
    </div>
  );
}
