import "server-only";
import { z } from "zod";

const optionalText = z.string().trim().max(240).transform((value) => value || null);

export const customerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().max(254).pipe(z.union([z.literal(""), z.email()])).transform((value) => value || null),
  phone: optionalText,
  address: optionalText,
});

export const catalogItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: optionalText,
  unit: z.string().trim().min(1).max(40),
  price: z.string().trim().regex(/^\d+(?:\.\d{1,2})?$/).transform(Number).pipe(z.number().max(1000000)),
});

export const catalogUpdateSchema = catalogItemSchema.extend({
  active: z.preprocess((value) => value ?? "off", z.enum(["on", "off"]).transform((value) => value === "on")),
});

export type RecordUpdateResult = { ok: true } | { ok: false; error: string };

export async function saveRecordUpdate<T>(
  id: string,
  updatedAt: string,
  formData: FormData,
  schema: z.ZodType<T>,
  update: (id: string, updatedAt: string, values: T) => Promise<{ id: string | null; error: string | null }>,
): Promise<RecordUpdateResult> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!z.uuid().safeParse(id).success || !z.iso.datetime({ offset: true }).safeParse(updatedAt).success || !parsed.success) {
    return { ok: false, error: "Check the details and try again." };
  }
  try {
    const result = await update(id, updatedAt, parsed.data);
    if (result.error) return { ok: false, error: "Changes could not be saved. Try again." };
    if (!result.id) return { ok: false, error: "This record changed or is no longer available. Reload the page before editing again." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not connect. Your edits are still here; try saving again." };
  }
}
