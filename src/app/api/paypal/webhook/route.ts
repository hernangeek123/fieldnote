import { revalidatePath } from "next/cache";
import { getPayPalInvoice, isPayPalConfigured, verifyPayPalWebhook } from "@/lib/paypal/client";
import { handlePayPalWebhook } from "@/lib/paypal/webhook-handler";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handlePayPalWebhook(request, {
    configured: isPayPalConfigured() && Boolean(process.env.PAYPAL_WEBHOOK_ID?.trim() && process.env.SUPABASE_SECRET_KEY?.trim()),
    verify: verifyPayPalWebhook,
    getInvoice: getPayPalInvoice,
    async findInvoice(paypalId) {
      const { data, error } = await createAdminClient().from("paypal_invoices")
        .select("id").eq("paypal_invoice_id", paypalId).maybeSingle();
      if (error) throw error;
      return data;
    },
    async syncInvoice(id, invoice, observedAt, eventId, eventType) {
      const { data: noteId, error } = await createAdminClient().rpc("sync_paypal_invoice", {
        p_invoice_id: id, p_details: invoice, p_observed_at: observedAt,
        p_event_id: eventId, p_event_type: eventType,
      });
      if (error) throw error;
      revalidatePath("/app");
      revalidatePath("/app/notes");
      if (noteId) revalidatePath(`/app/notes/${noteId}`);
    },
  });
}
