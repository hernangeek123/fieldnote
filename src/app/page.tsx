import Link from "next/link";
import { ArrowRight, Check, Mic, ReceiptText } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { PublicHeader } from "@/components/public-header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1">
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-14 sm:px-8 sm:pt-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent">Field notes to PayPal invoices</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">
            Speak the job. Send the invoice. Get paid.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            FieldNote turns a contractor&apos;s rough job notes into reviewed line items and a PayPal invoice draft.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-primary px-5 font-semibold text-white hover:bg-primary-hover"
          >
            Open your workspace <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-px bg-line sm:grid-cols-3">
          {[
            { icon: Mic, title: "Capture", body: "Record or type the work while it is fresh." },
            { icon: Check, title: "Review", body: "Confirm services, quantities, and prices." },
            { icon: ReceiptText, title: "Invoice", body: "Create a PayPal draft only after approval." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-surface px-6 py-8 sm:px-8">
              <Icon className="text-accent" size={23} aria-hidden="true" />
              <h2 className="mt-5 font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>
      </main>
      <SiteFooter />
    </div>
  );
}
