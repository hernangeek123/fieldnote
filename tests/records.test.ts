import assert from "node:assert/strict";
import test from "node:test";
import { catalogUpdateSchema, customerSchema, saveRecordUpdate } from "../src/lib/records";
import { invoiceRecipientEmail } from "../src/lib/paypal/invoice-recipient";

const id = "ae644b82-7975-4938-8599-a29c394f628c";
const updatedAt = "2026-10-09T18:07:47.362196+00:00";
function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}
const customer = { name: "  Demo Customer  ", email: "  demo@example.com  ", phone: " ", address: " Updated address " };
const service = { name: "Labor", description: " ", unit: "hour", price: "85.15", active: "on" };

test("customer updates normalize fields and strip ownership and identity changes", async () => {
  const result = await saveRecordUpdate(id, updatedAt, form({ ...customer, owner_id: "other", id: "other" }), customerSchema,
    async (recordId, version, values) => {
      assert.equal(recordId, id);
      assert.equal(version, updatedAt);
      assert.deepEqual(values, { name: "Demo Customer", email: "demo@example.com", phone: null, address: "Updated address" });
      return { id, error: null };
    });
  assert.deepEqual(result, { ok: true });
});

test("catalog edits support exact cent prices, deactivation and reactivation", async () => {
  for (const active of [true, false]) {
    const data = form(service);
    if (!active) data.delete("active");
    const result = await saveRecordUpdate(id, updatedAt, data, catalogUpdateSchema, async (_id, _version, values) => {
      assert.deepEqual(values, { name: "Labor", description: null, unit: "hour", price: 85.15, active });
      assert.equal(Math.round(values.price * 100), 8515);
      return { id, error: null };
    });
    assert.deepEqual(result, { ok: true });
  }
});

test("invalid catalog prices and flags never reach an update", async () => {
  for (const overrides of [{ price: "" }, { price: "-1" }, { price: "1.234" }, { price: "NaN" },
    { price: "1000000.01" }, { active: "true" }, { unit: " " }]) {
    const result = await saveRecordUpdate(id, updatedAt, form({ ...service, ...overrides }), catalogUpdateSchema,
      async () => { assert.fail("Invalid fields must not be updated"); });
    assert.equal(result.ok, false);
  }
});

test("invalid customer fields, IDs and versions cannot reach the database", async () => {
  for (const [recordId, version, values] of [["bad", updatedAt, customer], [id, "bad", customer],
    [id, updatedAt, { ...customer, email: "bad" }], [id, updatedAt, { ...customer, name: " " }]] as const) {
    const result = await saveRecordUpdate(recordId, version, form(values), customerSchema,
      async () => { assert.fail("Invalid update must not reach the database"); });
    assert.equal(result.ok, false);
  }
});

test("missing, stale or inaccessible rows, database errors and network errors cannot report success", async () => {
  for (const response of [{ id: null, error: null }, { id: null, error: "denied" }, { id, error: "denied" }]) {
    assert.equal((await saveRecordUpdate(id, updatedAt, form(customer), customerSchema, async () => response)).ok, false);
  }
  assert.equal((await saveRecordUpdate(id, updatedAt, form(customer), customerSchema, async () => {
    throw new Error("fetch failed");
  })).ok, false);
});

test("invoice display uses the frozen recipient and handles absent legacy snapshots safely", () => {
  assert.equal(invoiceRecipientEmail({ primary_recipients: [{ billing_info: { email_address: "original@example.com" } }] }), "original@example.com");
  for (const payload of [null, {}, [], "bad", { primary_recipients: [] }, { primary_recipients: [{ billing_info: {} }] }]) {
    assert.equal(invoiceRecipientEmail(payload), null);
  }
});
