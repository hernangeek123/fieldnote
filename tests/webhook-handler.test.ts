import assert from "node:assert/strict";
import test from "node:test";
import { handlePayPalWebhook } from "../src/lib/paypal/webhook-handler";

const event = { id: "WH-1", event_type: "INVOICING.INVOICE.PAID", resource: { id: "INV2-TEST", status: "PAID" }, extra: "preserved" };
function request(body: unknown = event) {
  return new Request("https://fieldnote.test/api/paypal/webhook", { method: "POST",
    headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}
function dependencies() {
  return { configured: true, verify: async () => true, findInvoice: async () => ({ id: "local-id" }),
    getInvoice: async () => ({ id: "INV2-TEST", status: "PARTIALLY_PAID" }), syncInvoice: async () => {} };
}

test("unconfigured webhook fails closed", async () => {
  assert.equal((await handlePayPalWebhook(request(), { ...dependencies(), configured: false })).status, 503);
});

test("invalid signatures cannot query or mutate the database", async () => {
  const response = await handlePayPalWebhook(request(), { ...dependencies(), verify: async () => false,
    findInvoice: async () => { assert.fail("Must not query"); }, syncInvoice: async () => { assert.fail("Must not mutate"); } });
  assert.equal(response.status, 401);
});

test("invalid and oversized bodies are rejected", async () => {
  assert.equal((await handlePayPalWebhook(request({}), dependencies())).status, 400);
  assert.equal((await handlePayPalWebhook(request({ ...event, padding: "x".repeat(256 * 1024) }), dependencies())).status, 413);
});

test("payment events use current PayPal status rather than claiming a full payment", async () => {
  let synced = false;
  const response = await handlePayPalWebhook(request(), { ...dependencies(),
    verify: async (_headers, original) => { assert.deepEqual(original, event); return true; },
    syncInvoice: async (id, invoice, observedAt, eventId, eventType) => {
      assert.equal(id, "local-id"); assert.equal(invoice.status, "PARTIALLY_PAID");
      assert.equal(eventId, "WH-1"); assert.equal(eventType, event.event_type);
      assert.ok(Date.parse(observedAt)); synced = true;
    } });
  assert.equal(response.status, 200); assert.equal(synced, true);
});

test("unrelated and unknown invoices are acknowledged without writes", async () => {
  for (const body of [{ ...event, event_type: "PAYMENT.CAPTURE.COMPLETED" }, event]) {
    const response = await handlePayPalWebhook(request(body), { ...dependencies(), findInvoice: async () => null,
      syncInvoice: async () => { assert.fail("Must not mutate"); } });
    assert.equal(response.status, 200);
  }
});

test("database failures return a retryable error instead of acknowledging lost updates", async () => {
  const response = await handlePayPalWebhook(request(), { ...dependencies(), syncInvoice: async () => { throw new Error("database unavailable"); } });
  assert.equal(response.status, 503);
});
