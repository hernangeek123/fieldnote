"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.email();

export async function signIn(formData: FormData) {
  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  const requestedNext = String(formData.get("next") ?? "/app");
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/app";

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
