"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { extractFieldNote } from "@/lib/ai/extract-field-note";
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

export async function generateFieldNoteLineItems(noteId: string, formData: FormData) {
  const path = `/app/notes/${noteId}`;
  const supabase = await authenticatedClient();
  const [{ data: note, error: noteError }, { data: catalog, error: catalogError }, { data: existingItems, error: itemsError }] =
    await Promise.all([
      supabase
        .from("field_notes")
        .select("id, raw_note, status")
        .eq("id", noteId)
        .maybeSingle(),
      supabase
        .from("catalog_items")
        .select("id, name, description, unit, unit_price_cents")
        .eq("active", true)
        .order("name"),
      supabase.from("note_line_items").select("id").eq("field_note_id", noteId),
    ]);

  if (noteError || !note) redirect(messageUrl("/app/notes", "error", "Field note not found."));
  if (catalogError || itemsError) {
    redirect(messageUrl(path, "error", catalogError?.message ?? itemsError?.message ?? "Data could not be loaded."));
  }
  if (note.status !== "draft") {
    redirect(messageUrl(path, "error", "Only draft notes can generate AI suggestions."));
  }
  if (!catalog.length) {
    redirect(messageUrl(path, "error", "Add at least one price-book item before using AI."));
  }
  if (existingItems.length && formData.get("replace_existing") !== "true") {
    redirect(messageUrl(path, "error", "Confirm replacement before regenerating line items."));
  }
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    redirect(messageUrl(path, "error", "AI Gateway is not configured for this environment yet."));
  }

  let extraction: Awaited<ReturnType<typeof extractFieldNote>>;
  try {
    extraction = await extractFieldNote({ rawNote: note.raw_note, catalog });
  } catch (error) {
    console.error("Field-note extraction failed:", error instanceof Error ? error.message : "Unknown error");
    redirect(messageUrl(path, "error", "AI could not generate suggestions. Your current line items were not changed."));
  }

  const catalogById = new Map(catalog.map((item) => [item.id, item]));
  let reviewCount = 0;
  const generatedItems = extraction.line_items.map((item) => {
    const match = item.catalog_item_id ? catalogById.get(item.catalog_item_id) : undefined;
    const confirmedMatch = item.needs_review ? undefined : match;
    if (item.needs_review || !match) reviewCount += 1;

    return {
      id: crypto.randomUUID(),
      field_note_id: noteId,
      catalog_item_id: confirmedMatch?.id ?? null,
      description: match?.name ?? item.description,
      quantity: item.quantity,
      unit_price_cents: confirmedMatch?.unit_price_cents ?? 0,
    };
  });

  const { error: insertError } = await supabase.from("note_line_items").insert(generatedItems);
  if (insertError) redirect(messageUrl(path, "error", insertError.message));

  if (existingItems.length) {
    const { error: deleteError } = await supabase
      .from("note_line_items")
      .delete()
      .in("id", existingItems.map((item) => item.id));
    if (deleteError) {
      await supabase.from("note_line_items").delete().in("id", generatedItems.map((item) => item.id));
      redirect(messageUrl(path, "error", deleteError.message));
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/notes");
  revalidatePath(path);
  const reviewMessage = reviewCount
    ? `Generated ${generatedItems.length} suggestions. Check ${reviewCount} flagged ${reviewCount === 1 ? "item" : "items"}.`
    : `Generated ${generatedItems.length} price-book suggestions.`;
  redirect(messageUrl(path, "created", reviewMessage));
}

const reviewLineItemSchema = z.object({
  line_item_id: z.union([z.literal(""), z.uuid()]).transform((value) => value || null),
  catalog_item_id: z.union([z.literal(""), z.uuid()]).transform((value) => value || null),
  description: z.string().trim().min(1).max(240),
  quantity: z.coerce.number().positive().max(1000000),
  unit_price: z.coerce.number().min(0).max(1000000),
});

const reviewSchema = z.object({
  intent: z.enum(["save", "review"]),
  lineItems: z.array(reviewLineItemSchema).min(1).max(100),
});

export async function saveFieldNoteReview(noteId: string, formData: FormData) {
  const path = `/app/notes/${noteId}`;
  const lineItemIds = formData.getAll("line_item_id");
  const descriptions = formData.getAll("description");
  const quantities = formData.getAll("quantity");
  const prices = formData.getAll("unit_price");
  const catalogIds = formData.getAll("catalog_item_id");

  if (
    descriptions.length !== lineItemIds.length ||
    descriptions.length !== quantities.length ||
    descriptions.length !== prices.length ||
    descriptions.length !== catalogIds.length
  ) {
    redirect(messageUrl(path, "error", "The line items could not be read. Try again."));
  }

  const parsed = reviewSchema.safeParse({
    intent: formData.get("intent"),
    lineItems: descriptions.map((description, index) => ({
      line_item_id: lineItemIds[index],
      description,
      quantity: quantities[index],
      unit_price: prices[index],
      catalog_item_id: catalogIds[index],
    })),
  });
  if (!parsed.success) {
    redirect(messageUrl(path, "error", "Check every description, quantity, and price."));
  }

  const supabase = await authenticatedClient();
  const { data: note, error: noteError } = await supabase
    .from("field_notes")
    .select("id, status")
    .eq("id", noteId)
    .maybeSingle();

  if (noteError || !note) redirect(messageUrl("/app/notes", "error", "Field note not found."));
  if (note.status === "invoiced") {
    redirect(messageUrl(path, "error", "Invoiced notes cannot be changed."));
  }

  const selectedCatalogIds = [
    ...new Set(
      parsed.data.lineItems
        .map((item) => item.catalog_item_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  if (selectedCatalogIds.length) {
    const { data: catalogItems, error: catalogError } = await supabase
      .from("catalog_items")
      .select("id")
      .in("id", selectedCatalogIds);
    if (catalogError || catalogItems.length !== selectedCatalogIds.length) {
      redirect(messageUrl(path, "error", "One of the selected price-book items is unavailable."));
    }
  }

  const { data: existingItems, error: existingError } = await supabase
    .from("note_line_items")
    .select("id")
    .eq("field_note_id", noteId);
  if (existingError) redirect(messageUrl(path, "error", existingError.message));

  const existingIdSet = new Set(existingItems.map((item) => item.id));
  const submittedExistingIds = parsed.data.lineItems
    .map((item) => item.line_item_id)
    .filter((id): id is string => Boolean(id));
  if (
    new Set(submittedExistingIds).size !== submittedExistingIds.length ||
    submittedExistingIds.some((id) => !existingIdSet.has(id))
  ) {
    redirect(messageUrl(path, "error", "One of the line items is unavailable."));
  }

  const updateResults = await Promise.all(
    parsed.data.lineItems
      .filter((item): item is typeof item & { line_item_id: string } => Boolean(item.line_item_id))
      .map((item) =>
        supabase
          .from("note_line_items")
          .update({
            catalog_item_id: item.catalog_item_id,
            description: item.description,
            quantity: item.quantity,
            unit_price_cents: Math.round(item.unit_price * 100),
          })
          .eq("id", item.line_item_id)
          .eq("field_note_id", noteId),
      ),
  );
  const updateError = updateResults.find((result) => result.error)?.error;
  if (updateError) redirect(messageUrl(path, "error", updateError.message));

  const newItems = parsed.data.lineItems
    .filter((item) => !item.line_item_id)
    .map((item) => ({
      id: crypto.randomUUID(),
      field_note_id: noteId,
      catalog_item_id: item.catalog_item_id,
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: Math.round(item.unit_price * 100),
    }));
  if (newItems.length) {
    const { error: insertError } = await supabase.from("note_line_items").insert(newItems);
    if (insertError) redirect(messageUrl(path, "error", insertError.message));
  }

  const removedIds = existingItems
    .map((item) => item.id)
    .filter((id) => !submittedExistingIds.includes(id));
  if (removedIds.length) {
    const { error: deleteError } = await supabase.from("note_line_items").delete().in("id", removedIds);
    if (deleteError) {
      if (newItems.length) {
        await supabase.from("note_line_items").delete().in("id", newItems.map((item) => item.id));
      }
      redirect(messageUrl(path, "error", deleteError.message));
    }
  }

  const nextStatus = parsed.data.intent === "review" ? "reviewed" : note.status;
  const { error: noteUpdateError } = await supabase
    .from("field_notes")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", noteId);
  if (noteUpdateError) redirect(messageUrl(path, "error", noteUpdateError.message));

  revalidatePath("/app");
  revalidatePath("/app/notes");
  revalidatePath(path);
  redirect(
    messageUrl(
      path,
      "created",
      parsed.data.intent === "review" ? "Field note approved." : "Line items saved.",
    ),
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
