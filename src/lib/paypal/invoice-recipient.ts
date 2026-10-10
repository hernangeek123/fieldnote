import type { Json } from "@/lib/database.types";

export function invoiceRecipientEmail(payload: Json | null): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const recipients = payload.primary_recipients;
  if (!Array.isArray(recipients)) return null;
  const first = recipients[0];
  if (!first || typeof first !== "object" || Array.isArray(first)) return null;
  const billing = first.billing_info;
  if (!billing || typeof billing !== "object" || Array.isArray(billing)) return null;
  return typeof billing.email_address === "string" && billing.email_address ? billing.email_address : null;
}
