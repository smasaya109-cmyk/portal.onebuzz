import { getTranslations } from "next-intl/server";
import { LINE_OFFICIAL_URL } from "@/lib/links";

/** LINE 公式アカウントのアイコン(吹き出し) */
function LineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2C6.48 2 2 5.69 2 10.24c0 4.08 3.55 7.5 8.35 8.14.32.07.77.21.88.49.1.25.07.64.03.9l-.14.85c-.04.25-.2.98.86.53 1.06-.45 5.72-3.37 7.8-5.77 1.44-1.58 2.13-3.18 2.13-4.96C21.91 5.69 17.52 2 12 2Z" />
    </svg>
  );
}

export async function AffiliateCTA() {
  const t = await getTranslations("affiliate");

  const points = [
    { title: t("point1Title"), body: t("point1Body") },
    { title: t("point2Title"), body: t("point2Body") },
    { title: t("point3Title"), body: t("point3Body") },
  ];

  return (
    <section className="px-5 pb-12 sm:px-8 sm:pb-20">
      <div className="mx-auto w-full max-w-5xl">
        <div
          style={{
            backgroundImage:
              "radial-gradient(28rem 18rem at 100% 0%, var(--accent-soft), transparent 70%)",
          }}
          className="relative overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--accent)_25%,transparent)] bg-surface px-6 py-8 sm:px-10 sm:py-10"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-md">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Affiliate Program
              </span>
              <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                {t("title")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                {t("subtitle")}
              </p>
            </div>

            {/* CTA */}
            <div className="shrink-0 text-center sm:text-right">
              <a
                href={LINE_OFFICIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#06C755] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#06C755]/25 transition hover:-translate-y-0.5 hover:bg-[#05b84e] hover:shadow-lg"
              >
                <LineIcon className="h-4 w-4" />
                {t("cta")}
              </a>
              <p className="mx-auto mt-2 max-w-[18rem] whitespace-pre-line text-xs leading-relaxed text-muted sm:mx-0 sm:max-w-[16rem]">
                {t("note")}
              </p>
            </div>
          </div>

          {/* points */}
          <ul className="mt-8 grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-3">
            {points.map((p, i) => (
              <li key={p.title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-xs font-bold text-accent-strong">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
