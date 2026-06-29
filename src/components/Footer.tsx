import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-black/10 dark:border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-black/50 dark:text-white/50">
          {t("copyright")} {year}
        </p>
        <nav>
          <Link
            href="/affiliate"
            className="font-medium text-black/70 underline-offset-4 hover:underline dark:text-white/70"
          >
            {t("affiliate")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
