import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { localizedName, localizedDescription } from "@/lib/content";
import type { App, Locale } from "@/types/db";

export function AppCard({ app, locale }: { app: App; locale: Locale }) {
  const name = localizedName(app, locale);
  const description = localizedDescription(app, locale);

  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/5 dark:bg-white/5">
        {app.image_url ? (
          <Image
            src={app.image_url}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-black/20 dark:text-white/20">
            {name.charAt(0)}
          </div>
        )}
        {app.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-black/80 px-2.5 py-1 text-xs font-medium text-white">
            ★
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {app.category && (
          <span className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
            {localizedName(app.category, locale)}
          </span>
        )}
        <h3 className="text-base font-semibold leading-snug">{name}</h3>
        {description && (
          <p className="line-clamp-2 text-sm text-black/60 dark:text-white/60">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
