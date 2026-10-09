import assert from "node:assert/strict";
import test from "node:test";
import { saveFieldNoteDraft } from "../src/lib/notes/save-draft";

const customerId = "ae644b82-7975-4938-8599-a29c394f628c";
function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    customer_id: customerId, occurred_on: "2026-10-09", raw_note: "  Replaced the faucet.  ", ...overrides,
  })) data.set(key, value);
  return data;
}

test("draft save trims the note and inserts once before returning its ID", async () => {
  let calls = 0;
  const result = await saveFieldNoteDraft(form(), async (draft) => {
    calls++;
    assert.deepEqual(draft, { customer_id: customerId, occurred_on: "2026-10-09", raw_note: "Replaced the faucet." });
    return { noteId: "saved-note", error: null };
  });
  assert.equal(calls, 1);
  assert.deepEqual(result, { ok: true, noteId: "saved-note" });
});

test("draft save supports no customer selected", async () => {
  await saveFieldNoteDraft(form({ customer_id: "" }), async (draft) => {
    assert.equal(draft.customer_id, null);
    return { noteId: "saved-note", error: null };
  });
});

test("invalid draft fields never reach the database", async () => {
  const invalidDrafts: Record<string, string>[] = [{ raw_note: "  " }, { raw_note: "x".repeat(10001) },
    { customer_id: "invalid" }, { occurred_on: "2026-02-30" }];
  for (const invalid of invalidDrafts) {
    const result = await saveFieldNoteDraft(form(invalid), async () => {
      assert.fail("Invalid draft must not be inserted");
    });
    assert.equal(result.ok, false);
  }
});

test("database errors and missing IDs cannot report a successful save", async () => {
  for (const response of [{ noteId: null, error: "Could not save" }, { noteId: null, error: null },
    { noteId: "saved-note", error: "Could not save" }]) {
    const result = await saveFieldNoteDraft(form(), async () => response);
    assert.equal(result.ok, false);
  }
});

test("network exceptions propagate to the form's draft-preserving error handler", async () => {
  await assert.rejects(saveFieldNoteDraft(form(), async () => { throw new Error("fetch failed"); }), /fetch failed/);
});
