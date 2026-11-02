import Link from "next/link";
import { GuardedLink } from "@/components/navigation-guard";

export function SiteFooter({ workspace = false }: { workspace?: boolean }) {
  const FooterLink = workspace ? GuardedLink : Link;
  const linkClassName = "inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-[#4f5b52] underline-offset-4 hover:text-[#176b3a] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#176b3a]";

  return (
    <footer className={`mt-auto border-t border-[#d7ddd7] bg-white ${workspace ? "pb-16 sm:pb-0" : ""}`}>
      <div className={`mx-auto flex flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 ${workspace ? "max-w-7xl" : "max-w-6xl"}`}>
        <div>
          <p className="text-lg font-semibold text-[#176b3a]">FieldNote</p>
          <p className="mt-1 text-sm leading-6 text-[#657068]">Speak the job. Send the invoice. Get paid.</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6">
            <FooterLink href="/" className={linkClassName}>Home</FooterLink>
            <FooterLink href="/app" className={linkClassName}>Workspace</FooterLink>
          </nav>
          <p className="text-xs leading-5 text-[#657068]">© 2026 FieldNote.</p>
        </div>
      </div>
    </footer>
  );
}
