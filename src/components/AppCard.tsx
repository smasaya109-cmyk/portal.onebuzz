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
      style={{ boxShadow: "var(--shadow-card)" }}
      className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:[box-shadow:var(--shadow-card-hover)]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {app.image_url ? (
          <Image
            src={app.image_url}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-soft to-transparent text-4xl font-bold text-accent/40">
            {name.charAt(0)}
          </div>
        )}
        {app.is_featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold text-accent shadow-sm backdrop-blur">
            ★ Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {app.category && (
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            {localizedName(app.category, locale)}
          </span>
        )}
        <h3 className="text-base font-semibold leading-snug tracking-tight transition group-hover:text-accent-strong">
          {name}
        </h3>
        {description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
