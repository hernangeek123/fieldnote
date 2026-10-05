import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { signIn } from "./actions";
import { hasSupabaseEnv } from "@/lib/supabase/config";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = getParam(params.error);
  const sent = getParam(params.sent);
  const next = getParam(params.next) ?? "/app";
  const needsSetup = getParam(params.setup) === "missing" || !hasSupabaseEnv();

  return (
    <main className="min-h-screen bg-[#f3f5f2] px-5 py-8 text-[#17201a] sm:px-8">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4f5b52] hover:text-[#17201a]"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to FieldNote
        </Link>

        <section className="mt-16">
          <div className="flex size-11 items-center justify-center rounded-md bg-[#176b3a] text-white">
            <Mail size={21} aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold">Sign in to your workspace</h1>
          <p className="mt-3 leading-7 text-[#5d685f]">
            We will email you a secure sign-in link. No password to remember.
          </p>

          {needsSetup ? (
            <div className="mt-8 rounded-md border border-[#e5bd73] bg-[#fff8e9] p-4 text-sm leading-6 text-[#6e4b12]">
              Supabase is not connected yet. The application is ready, but a new
              project must be available before sign-in can send emails.
            </div>
          ) : null}

          {sent ? (
            <div className="mt-8 rounded-md border border-[#9bc7a7] bg-[#edf8ef] p-4 text-sm leading-6 text-[#245b31]">
              Check <strong>{sent}</strong> for your FieldNote sign-in link.
            </div>
          ) : null}

          {error ? (
            <div className="mt-8 rounded-md border border-[#e3a6a0] bg-[#fff0ee] p-4 text-sm text-[#8a2e25]">
              {error}
            </div>
          ) : null}

          <form action={signIn} className="mt-8 space-y-5">
            <input type="hidden" name="next" value={next} />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Email address</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={needsSetup}
                placeholder="you@business.com"
                className="h-12 w-full rounded-md border border-[#bdc6be] bg-white px-4 outline-none transition focus:border-[#176b3a] focus:ring-2 focus:ring-[#cce5d2] disabled:bg-[#e8ebe7]"
              />
            </label>
            <button
              type="submit"
              disabled={needsSetup}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#176b3a] px-5 font-semibold text-white transition hover:bg-[#11562e] disabled:cursor-not-allowed disabled:bg-[#8fa197]"
            >
              <Mail size={18} aria-hidden="true" />
              Email me a sign-in link
            </button>
          </form>

          <p className="mt-6 flex items-start gap-2 text-sm leading-6 text-[#69736b]">
            <ShieldCheck className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
            Your customers and notes are isolated to your account.
          </p>
        </section>
      </div>
    </main>
  );
}
