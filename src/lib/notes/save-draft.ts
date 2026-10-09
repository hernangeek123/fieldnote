import "server-only";
import { z } from "zod";

const fieldNoteSchema = z.object({
  customer_id: z.union([z.literal(""), z.uuid()]).transform((value) => value || null),
  occurred_on: z.iso.date(),
  raw_note: z.string().trim().min(1).max(10000),
});

export type DraftSaveResult =
  | { ok: true; noteId: string }
  | { ok: false; error: string };

export async function saveFieldNoteDraft(
  formData: FormData,
  insert: (draft: z.infer<typeof fieldNoteSchema>) => Promise<{ noteId: string | null; error: string | null }>,
): Promise<DraftSaveResult> {
  const parsed = fieldNoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Check the customer, job date, and note before saving." };
  }

  const result = await insert(parsed.data);
  if (result.error || !result.noteId) {
    return { ok: false, error: result.error ?? "The draft could not be saved. Try again." };
  }
  return { ok: true, noteId: result.noteId };
}
