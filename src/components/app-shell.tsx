import { GuardedForm, GuardedLink as Link, NavigationGuardProvider } from "@/components/navigation-guard";
import {
  BookOpenText,
  LayoutDashboard,
  LogOut,
  PackageOpen,
  Plus,
  Users,
} from "lucide-react";
import { signOut } from "@/app/app/actions";
import { SiteFooter } from "@/components/site-footer";

const navigation = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/customers", label: "Customers", icon: Users },
  { href: "/app/catalog", label: "Price book", icon: PackageOpen },
  { href: "/app/notes", label: "Notes", icon: BookOpenText },
];

export function AppShell({
  email,
  children,
}: Readonly<{ email: string; children: React.ReactNode }>) {
  return (
    <NavigationGuardProvider>
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/app" className="text-xl font-semibold">
            FieldNote
          </Link>
          <Link
            href="/app/notes/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={17} aria-hidden="true" />
            New note
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 sm:grid-cols-[210px_1fr]">
        <aside className="hidden border-r border-line bg-surface px-4 py-6 sm:flex sm:flex-col">
          <nav className="space-y-1" aria-label="Workspace navigation">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-secondary hover:bg-surface-hover hover:text-foreground"
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-line pt-5">
            <p className="truncate px-3 text-xs text-muted">{email}</p>
            <GuardedForm action={signOut} className="mt-2">
              <button className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-secondary hover:bg-surface-hover">
                <LogOut size={17} aria-hidden="true" />
                Sign out
              </button>
            </GuardedForm>
          </div>
        </aside>

        <main className="min-w-0 px-5 py-7 pb-24 sm:px-8 sm:py-10 sm:pb-10">
          {children}
        </main>
      </div>

      <SiteFooter workspace />

      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid h-16 grid-cols-4 border-t border-line bg-surface sm:hidden"
        aria-label="Workspace navigation"
      >
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium text-secondary"
          >
            <Icon size={19} aria-hidden="true" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
    </NavigationGuardProvider>
  );
}
