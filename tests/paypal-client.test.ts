import assert from "node:assert/strict";
import test from "node:test";
import { createPayPalDraftInvoice, verifyPayPalWebhook } from "../src/lib/paypal/client";

const payload = {
  detail: { currency_code: "USD", invoice_date: "2026-10-07", invoice_number: "FN-test-invoice",
    reference: "FieldNote test", note: "Test", payment_term: { term_type: "DUE_ON_RECEIPT" } },
  invoicer: { business_name: "Test business" },
  primary_recipients: [{ billing_info: { business_name: "Demo", email_address: "buyer@example.com" } }],
  items: [{ name: "Plumbing labor", quantity: "2.00", unit_amount: { currency_code: "USD", value: "85.00" }, unit_of_measure: "QUANTITY" }],
};
process.env.PAYPAL_CLIENT_ID = "test-client";
process.env.PAYPAL_CLIENT_SECRET = "test-secret";
process.env.PAYPAL_WEBHOOK_ID = "test-webhook";

test("repeated draft requests preserve the exact payload and request ID", async (t) => {
  const requests: RequestInit[] = [];
  t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    if (String(url).endsWith("/oauth2/token")) return Response.json({ access_token: "test", expires_in: 3600 });
    requests.push(init);
    return Response.json({ id: "INV2-TEST", status: "DRAFT" });
  });
  await createPayPalDraftInvoice({ requestId: "stable-id", payload });
  process.env.PAYPAL_BUSINESS_NAME = "Changed later";
  await createPayPalDraftInvoice({ requestId: "stable-id", payload });
  assert.equal(requests.length, 2);
  assert.equal(requests[0].body, requests[1].body);
  assert.equal(JSON.parse(String(requests[1].body)).detail.invoice_date, "2026-10-07");
  assert.equal((requests[1].headers as Record<string, string>)["PayPal-Request-Id"], "stable-id");
  assert.ok(requests[1].signal);
});

test("a duplicate invoice number reconciles the existing invoice", async (t) => {
  t.mock.method(globalThis, "fetch", async (url: string) => {
    if (String(url).endsWith("/search-invoices")) return Response.json({ items: [{ id: "INV2-EXISTING", status: "DRAFT", detail: { invoice_number: payload.detail.invoice_number } }] });
    if (String(url).endsWith("/INV2-EXISTING")) return Response.json({ id: "INV2-EXISTING", status: "DRAFT" });
    if (String(url).endsWith("/oauth2/token")) return Response.json({ access_token: "test", expires_in: 3600 });
    return Response.json({ message: "Duplicate invoice number" }, { status: 422 });
  });
  assert.equal((await createPayPalDraftInvoice({ requestId: "stable-id", payload })).id, "INV2-EXISTING");
});

test("missing signature headers and untrusted certificate URLs are rejected before network access", async (t) => {
  t.mock.method(globalThis, "fetch", async () => { assert.fail("Must not fetch"); });
  assert.equal(await verifyPayPalWebhook(new Headers(), {}), false);
  const headers = new Headers({ "paypal-transmission-id": "id", "paypal-transmission-time": "time",
    "paypal-transmission-sig": "sig", "paypal-auth-algo": "SHA256withRSA", "paypal-cert-url": "https://attacker.example/cert" });
  assert.equal(await verifyPayPalWebhook(headers, {}), false);
});

test("postback verification forwards the complete event with the registered webhook ID", async (t) => {
  const event = { id: "WH-1", resource: { id: "INV2-TEST", extra: "preserve" }, extra: [1, 2] };
  t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    if (String(url).endsWith("/oauth2/token")) return Response.json({ access_token: "test", expires_in: 3600 });
    const body = JSON.parse(String(init.body));
    assert.deepEqual(body.webhook_event, event);
    assert.equal(body.webhook_id, "test-webhook");
    return Response.json({ verification_status: "SUCCESS" });
  });
  const headers = new Headers({ "paypal-transmission-id": "id", "paypal-transmission-time": "time",
    "paypal-transmission-sig": "sig", "paypal-auth-algo": "SHA256withRSA",
    "paypal-cert-url": "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-TEST" });
  assert.equal(await verifyPayPalWebhook(headers, event), true);
});
