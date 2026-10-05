import Link from "next/link";
import { ArrowRight, Check, Mic, ReceiptText } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f3f5f2] text-[#17201a]">
      <header className="border-b border-[#d7ddd7] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <p className="text-xl font-semibold">FieldNote</p>
          <Link
            href="/login"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-[#aeb8af] px-4 text-sm font-semibold hover:bg-[#f1f4f0]"
          >
            Sign in <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-12 pt-14 sm:px-8 sm:pt-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-[#377348]">Field notes to PayPal invoices</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">
            Speak the job. Send the invoice. Get paid.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#58625b]">
            FieldNote turns a contractor&apos;s rough job notes into reviewed line items and a PayPal invoice draft.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-[#176b3a] px-5 font-semibold text-white hover:bg-[#11562e]"
          >
            Open your workspace <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="border-y border-[#d7ddd7] bg-white">
        <div className="mx-auto grid max-w-6xl gap-px bg-[#d7ddd7] sm:grid-cols-3">
          {[
            { icon: Mic, title: "Capture", body: "Record or type the work while it is fresh." },
            { icon: Check, title: "Review", body: "Confirm services, quantities, and prices." },
            { icon: ReceiptText, title: "Invoice", body: "Create a PayPal draft only after approval." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white px-6 py-8 sm:px-8">
              <Icon className="text-[#176b3a]" size={23} aria-hidden="true" />
              <h2 className="mt-5 font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#657068]">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
