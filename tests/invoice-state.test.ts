import assert from "node:assert/strict";
import test from "node:test";
import { canSendInvoice, isInvoiceLocked, isSentInvoice } from "../src/lib/paypal/invoice-state";
import { InvoiceNotSendableError, sendInvoiceSafely } from "../src/lib/paypal/send-invoice";

test("cancelled, failed, scheduled, unknown, and draft invoices are not already sent", () => {
  for (const status of ["CANCELLED", "FAILED", "CREATING", "SCHEDULED", "UNKNOWN", "DRAFT"]) {
    assert.equal(isSentInvoice(status), false, status);
  }
  for (const status of ["SENT", "UNPAID", "PARTIALLY_PAID", "PAYMENT_PENDING", "PAID", "MARKED_AS_PAID", "REFUNDED"]) {
    assert.equal(isSentInvoice(status), true, status);
  }
});

test("only drafts can be sent and any invoice reservation locks review", () => {
  assert.equal(canSendInvoice("DRAFT"), true);
  assert.equal(canSendInvoice("CANCELLED"), false);
  assert.equal(isInvoiceLocked("reviewed", true), true);
  assert.equal(isInvoiceLocked("invoiced", false), true);
  assert.equal(isInvoiceLocked("draft", false), false);
});

test("sending reconciles an already-paid invoice without sending it again", async () => {
  let sends = 0;
  const result = await sendInvoiceSafely("INV2-TEST", "request-1", {
    getInvoice: async () => ({ id: "INV2-TEST", status: "PAID" }),
    sendInvoice: async () => { sends++; },
  });
  assert.equal(result.alreadySent, true);
  assert.equal(sends, 0);
});

test("cancelled and scheduled invoices do not invoke sending", async () => {
  for (const status of ["CANCELLED", "SCHEDULED", "UNKNOWN"]) {
    await assert.rejects(sendInvoiceSafely("INV2-TEST", "request-1", {
      getInvoice: async () => ({ id: "INV2-TEST", status }),
      sendInvoice: async () => { assert.fail("Must not send"); },
    }), InvoiceNotSendableError);
  }
});

test("an ambiguous send timeout is reconciled with the same invoice", async () => {
  let reads = 0;
  const result = await sendInvoiceSafely("INV2-TEST", "stable-request", {
    getInvoice: async () => ({ id: "INV2-TEST", status: ++reads === 1 ? "DRAFT" : "SENT" }),
    sendInvoice: async (id, requestId) => {
      assert.equal(id, "INV2-TEST"); assert.equal(requestId, "stable-request");
      throw new Error("timeout after PayPal accepted the request");
    },
  });
  assert.equal(result.invoice.status, "SENT");
});

test("an unconfirmed send never reports success", async () => {
  await assert.rejects(sendInvoiceSafely("INV2-TEST", "request-1", {
    getInvoice: async () => ({ id: "INV2-TEST", status: "DRAFT" }),
    sendInvoice: async () => {},
  }), InvoiceNotSendableError);
});
