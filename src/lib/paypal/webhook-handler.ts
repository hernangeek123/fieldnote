import { z } from "zod";
import type { PayPalInvoice } from "./client";

const MAX_WEBHOOK_BYTES = 256 * 1024;
const eventSchema = z.object({
  id: z.string().min(1).max(200),
  event_type: z.string().min(1).max(100),
  resource: z.object({ id: z.string().min(1).max(100) }).passthrough(),
}).passthrough();

type Dependencies = {
  configured: boolean;
  verify: (headers: Headers, event: unknown) => Promise<boolean>;
  findInvoice: (paypalId: string) => Promise<{ id: string } | null>;
  getInvoice: (paypalId: string) => Promise<PayPalInvoice>;
  syncInvoice: (id: string, invoice: PayPalInvoice, observedAt: string, eventId: string, eventType: string) => Promise<void>;
};

export async function handlePayPalWebhook(request: Request, dependencies: Dependencies) {
  if (!dependencies.configured) return Response.json({ error: "Webhook unavailable." }, { status: 503 });
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return Response.json({ error: "JSON required." }, { status: 415 });
  }
  if (Number(request.headers.get("content-length")) > MAX_WEBHOOK_BYTES) {
    return Response.json({ error: "Payload too large." }, { status: 413 });
  }
  let payload: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ error: "Missing payload." }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_WEBHOOK_BYTES) {
        await reader.cancel();
        return Response.json({ error: "Payload too large." }, { status: 413 });
      }
      chunks.push(value);
    }
    const body = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    payload = JSON.parse(new TextDecoder().decode(body));
  } catch {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }
  const parsed = eventSchema.safeParse(payload);
  if (!parsed.success) return Response.json({ error: "Invalid event." }, { status: 400 });
  try {
    // Forward the complete original object to PayPal, not the schema's stripped projection.
    if (!(await dependencies.verify(request.headers, payload))) {
      return Response.json({ error: "Invalid signature." }, { status: 401 });
    }
    const event = parsed.data;
    if (!event.event_type.startsWith("INVOICING.INVOICE.")) return Response.json({ received: true });
    const record = await dependencies.findInvoice(event.resource.id);
    if (!record) return Response.json({ received: true });
    const observedAt = new Date().toISOString();
    const current = await dependencies.getInvoice(event.resource.id);
    if (current.id !== event.resource.id) throw new Error("Invoice ID mismatch.");
    await dependencies.syncInvoice(record.id, current, observedAt, event.id, event.event_type);
    return Response.json({ received: true });
  } catch {
    // Acknowledge only after the transaction commits so PayPal can retry failures.
    console.error("PayPal webhook processing failed.");
    return Response.json({ error: "Please retry delivery." }, { status: 503 });
  }
}
