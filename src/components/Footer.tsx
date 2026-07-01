import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-strong text-[10px] font-bold text-white">
            ob
          </span>
          <p className="text-muted">
            {t("copyright")} {year}
          </p>
        </div>
        <nav>
          <Link
            href="/affiliate"
            className="font-medium text-muted underline-offset-4 transition hover:text-accent hover:underline"
          >
            {t("affiliate")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
