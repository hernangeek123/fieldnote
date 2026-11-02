import { Mail, ShieldCheck } from "lucide-react";
import { signIn, signInWithGoogle } from "./actions";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { LoginSubmitButton } from "@/components/login-submit-button";
import { safeRedirectPath } from "@/lib/auth/redirect-path";
import { SiteFooter } from "@/components/site-footer";

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
  const next = safeRedirectPath(getParam(params.next));
  const needsSetup = getParam(params.setup) === "missing" || !hasSupabaseEnv();

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f5f2] text-[#17201a]">
    <main className="flex-1 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-md">
        <section className="mt-16">
          <div className="flex size-11 items-center justify-center rounded-md bg-[#176b3a] text-white">
            <Mail size={21} aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold">Sign in to your workspace</h1>
          <p className="mt-3 leading-7 text-[#5d685f]">
            Continue with Google or request a secure email link.
          </p>

          {needsSetup ? (
            <div className="mt-8 rounded-md border border-[#e5bd73] bg-[#fff8e9] p-4 text-sm leading-6 text-[#6e4b12]">
              Supabase is not connected yet. The application is ready, but a new
              project must be available before sign-in can send emails.
            </div>
          ) : null}

          {sent ? (
            <div role="status" className="mt-8 rounded-md border border-[#9bc7a7] bg-[#edf8ef] p-4 text-sm leading-6 text-[#245b31]">
              Check <strong>{sent}</strong> for your FieldNote sign-in link.
            </div>
          ) : null}

          {error ? (
            <div role="alert" className="mt-8 rounded-md border border-[#e3a6a0] bg-[#fff0ee] p-4 text-sm text-[#8a2e25]">
              {error}
            </div>
          ) : null}

          <form action={signInWithGoogle} className="mt-8">
            <input type="hidden" name="next" value={next} />
            <LoginSubmitButton provider="google" disabled={needsSetup} />
          </form>

          <div className="my-6 flex items-center gap-4" aria-hidden="true">
            <div className="h-px flex-1 bg-[#d7ddd7]" />
            <span className="text-sm text-[#657068]">or</span>
            <div className="h-px flex-1 bg-[#d7ddd7]" />
          </div>

          <form action={signIn} className="space-y-5">
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
            <LoginSubmitButton provider="email" disabled={needsSetup} />
          </form>

          <p className="mt-6 flex items-start gap-2 text-sm leading-6 text-[#69736b]">
            <ShieldCheck className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
            Your customers and notes are isolated to your account.
          </p>
        </section>
      </div>
    </main>
    <SiteFooter />
    </div>
  );
}
