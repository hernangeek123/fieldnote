"use client";

import Image from "next/image";
import { LoaderCircle, Mail } from "lucide-react";
import { useFormStatus } from "react-dom";

export function LoginSubmitButton({ provider, disabled }: { provider: "google" | "email"; disabled: boolean }) {
  const { pending } = useFormStatus();
  const google = provider === "google";
  return (
    <button type="submit" disabled={disabled || pending} aria-busy={pending}
      className={`relative flex h-12 w-full items-center justify-center gap-3 rounded-md border px-5 font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${google
        ? "border-[#747775] bg-white text-[#1f1f1f] hover:bg-[#f6f8fa]"
        : "border-transparent bg-primary text-white hover:bg-primary-hover"}`}>
      {pending ? <LoaderCircle size={20} className="shrink-0 animate-spin" aria-hidden="true" />
        : google ? <span className="relative size-5 shrink-0 overflow-hidden" aria-hidden="true">
          <Image src="/google-sign-in-icon.png" alt="" width={40} height={40}
            className="absolute -left-2.5 -top-2.5 max-w-none" />
        </span> : <Mail size={18} className="shrink-0" aria-hidden="true" />}
      <span>{pending ? google ? "Connecting..." : "Sending link..."
        : google ? "Continue with Google" : "Email me a sign-in link"}</span>
    </button>
  );
}
