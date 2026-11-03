import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function PublicHeader({ showSignIn = true }: { showSignIn?: boolean }) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-5 sm:px-8">
        <p className="shrink-0 text-lg font-semibold sm:text-xl">FieldNote</p>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {showSignIn ? (
            <Link href="/login" className="inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-semibold hover:bg-surface-hover sm:px-4">
              Sign in <ArrowRight size={16} aria-hidden="true" className="hidden min-[360px]:block" />
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
