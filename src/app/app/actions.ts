"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

function messageUrl(path: string, type: "created" | "error", message: string) {
  return `${path}?${type}=${encodeURIComponent(message)}`;
}

async function authenticatedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  return supabase;
}

const optionalText = z
  .string()
  .trim()
  .max(240)
  .transform((value) => value || null);

const customerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.union([z.literal(""), z.email()]).transform((value) => value || null),
  phone: optionalText,
  address: optionalText,
});

export async function createCustomer(formData: FormData) {
  const parsed = customerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(messageUrl("/app/customers", "error", "Check the customer details and try again."));
  }

  const supabase = await authenticatedClient();
  const { error } = await supabase.from("customers").insert(parsed.data);
  if (error) redirect(messageUrl("/app/customers", "error", error.message));

  revalidatePath("/app");
  revalidatePath("/app/customers");
  redirect(messageUrl("/app/customers", "created", `${parsed.data.name} was added.`));
}

const catalogItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: optionalText,
  unit: z.string().trim().min(1).max(40),
  price: z.coerce.number().min(0).max(1000000),
});

export async function createCatalogItem(formData: FormData) {
  const parsed = catalogItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(messageUrl("/app/catalog", "error", "Check the service details and try again."));
  }

  const supabase = await authenticatedClient();
  const { price, ...item } = parsed.data;
  const { error } = await supabase
    .from("catalog_items")
    .insert({ ...item, unit_price_cents: Math.round(price * 100) });
  if (error) redirect(messageUrl("/app/catalog", "error", error.message));

  revalidatePath("/app");
  revalidatePath("/app/catalog");
  redirect(messageUrl("/app/catalog", "created", `${parsed.data.name} was added.`));
}

const fieldNoteSchema = z.object({
  customer_id: z.union([z.literal(""), z.uuid()]).transform((value) => value || null),
  occurred_on: z.iso.date(),
  raw_note: z.string().trim().min(1).max(10000),
});

export async function createFieldNote(formData: FormData) {
  const parsed = fieldNoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(messageUrl("/app/notes/new", "error", "Add a note before saving."));
  }

  const supabase = await authenticatedClient();
  const { error } = await supabase.from("field_notes").insert(parsed.data);
  if (error) redirect(messageUrl("/app/notes/new", "error", error.message));

  revalidatePath("/app");
  redirect(messageUrl("/app/notes/new", "created", "Field note saved as a draft."));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
