import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-strong text-sm font-bold text-white shadow-sm transition group-hover:scale-105">
            ob
          </span>
          <span className="text-base font-semibold tracking-tight">
            onebuzz
          </span>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
