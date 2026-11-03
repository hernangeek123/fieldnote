import type { ReactNode } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";

export function PolicyPage({ title, summary, children }: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-sm font-semibold text-accent">FieldNote</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-4 text-sm text-muted">Last updated: November 3, 2026</p>
        <p className="mt-6 text-lg leading-8 text-secondary">{summary}</p>
        <nav aria-label="Policy pages" className="mt-5 flex flex-wrap gap-x-6 text-sm font-semibold">
          <Link href="/privacy" className="inline-flex min-h-11 items-center text-accent underline underline-offset-4">Privacy Policy</Link>
          <Link href="/terms" className="inline-flex min-h-11 items-center text-accent underline underline-offset-4">Terms of Service</Link>
        </nav>
        <article className="mt-8 space-y-9">{children}</article>
      </main>
      <SiteFooter />
    </div>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 text-base leading-7 text-secondary [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}
