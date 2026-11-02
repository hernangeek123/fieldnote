"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/auth/redirect-path";
import { googleSignInError, startGoogleSignIn } from "@/lib/auth/google-sign-in";

const emailSchema = z.email();

export async function signInWithGoogle(formData: FormData) {
  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  const result = await startGoogleSignIn(origin, formData.get("next"),
    async (options) => (await createClient()).auth.signInWithOAuth(options));
  if (!result.url) redirect(`/login?${new URLSearchParams({
    error: result.error ?? googleSignInError,
    next: safeRedirectPath(formData.get("next")),
  })}`);
  redirect(result.url);
}

export async function signIn(formData: FormData) {
  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  const next = safeRedirectPath(formData.get("next"));

  if (!parsedEmail.success) {
    redirect(`/login?error=${encodeURIComponent("Enter a valid email address.")}`);
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;

  if (!origin) {
    redirect(`/login?error=${encodeURIComponent("The app URL is not configured.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsedEmail.data,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/login?sent=${encodeURIComponent(parsedEmail.data)}`);
}
