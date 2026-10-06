"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getVercelOidcToken } from "@vercel/oidc";
import { z } from "zod";
import { extractFieldNote } from "@/lib/ai/extract-field-note";
import { transcribeFieldNote } from "@/lib/ai/transcribe-field-note";
import {
  createPayPalDraftInvoice,
  getPayPalInvoice,
  isPayPalConfigured,
  payPalDebugId,
  payPalErrorMessage,
  sendPayPalInvoice,
} from "@/lib/paypal/client";
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

async function isAIGatewayConfigured() {
  if (process.env.AI_GATEWAY_API_KEY) return true;

  try {
    return Boolean(await getVercelOidcToken());
  } catch {
    return false;
  }
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

const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
const SUPPORTED_AUDIO_TYPES = new Set([
  "audio/flac",
  "audio/m4a",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/x-m4a",
  "audio/x-wav",
  "video/mp4",
  "video/webm",
]);

export type AudioTranscriptionResult =
  | { ok: true; transcript: string }
  | { ok: false; error: string };

export async function transcribeFieldNoteAudio(
  formData: FormData,
): Promise<AudioTranscriptionResult> {
  await authenticatedClient();

  if (!(await isAIGatewayConfigured())) {
    return { ok: false, error: "Audio transcription is not configured for this environment yet." };
  }

  const audio = formData.get("audio");
  if (!(audio instanceof File) || audio.size === 0) {
    return { ok: false, error: "Record or choose an audio file first." };
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return { ok: false, error: "The recording is too large. Keep it under 4 MB." };
  }

  const mediaType = audio.type.toLowerCase().split(";", 1)[0];
  if (!SUPPORTED_AUDIO_TYPES.has(mediaType)) {
    return { ok: false, error: "Use a WebM, MP4, M4A, MP3, WAV, OGG, or FLAC recording." };
  }

  try {
    const transcript = await transcribeFieldNote(new Uint8Array(await audio.arrayBuffer()));
    if (!transcript) return { ok: false, error: "No speech was detected. Try recording again." };
    if (transcript.length > 10_000) {
      return { ok: false, error: "The transcript is too long for one field note." };
    }
    return { ok: true, transcript };
  } catch (error) {
    console.error("Field-note transcription failed:", error instanceof Error ? error.message : "Unknown error");
    return { ok: false, error: "The recording could not be transcribed. Your audio is still available to retry." };
  }
}

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
  if (!(await isAIGatewayConfigured())) {
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

const paypalInvoiceColumns = "id, paypal_invoice_id, status, create_request_id, send_request_id";

function paypalInvoiceUpdate(invoice: Awaited<ReturnType<typeof getPayPalInvoice>>) {
  return {
    paypal_invoice_id: invoice.id,
    invoice_number: invoice.detail?.invoice_number ?? null,
    status: invoice.status.toUpperCase(),
    recipient_view_url: invoice.detail?.metadata?.recipient_view_url ?? null,
    invoicer_view_url: invoice.detail?.metadata?.invoicer_view_url ?? null,
    last_error: null,
    updated_at: new Date().toISOString(),
  };
}

export async function createPayPalInvoice(noteId: string) {
  const path = `/app/notes/${noteId}`;
  if (!isPayPalConfigured()) {
    redirect(messageUrl(path, "error", "PayPal Sandbox is not configured yet."));
  }

  const supabase = await authenticatedClient();
  const { data: note, error: noteError } = await supabase
    .from("field_notes")
    .select("id, customer_id, status")
    .eq("id", noteId)
    .maybeSingle();

  if (noteError || !note) redirect(messageUrl("/app/notes", "error", "Field note not found."));
  if (note.status !== "reviewed") {
    redirect(messageUrl(path, "error", "Approve the field note before creating an invoice."));
  }
  if (!note.customer_id) {
    redirect(messageUrl(path, "error", "Choose a customer before creating an invoice."));
  }

  const [customerResult, itemsResult, invoiceResult] = await Promise.all([
    supabase.from("customers").select("name, email").eq("id", note.customer_id).maybeSingle(),
    supabase
      .from("note_line_items")
      .select("description, quantity, unit_price_cents")
      .eq("field_note_id", noteId)
      .order("created_at"),
    supabase.from("paypal_invoices").select(paypalInvoiceColumns).eq("field_note_id", noteId).maybeSingle(),
  ]);

  if (customerResult.error || !customerResult.data) {
    redirect(messageUrl(path, "error", "The invoice customer could not be loaded."));
  }
  if (!customerResult.data.email || !z.email().safeParse(customerResult.data.email).success) {
    redirect(messageUrl(path, "error", "Add a valid customer email before creating an invoice."));
  }
  if (itemsResult.error || !itemsResult.data.length) {
    redirect(messageUrl(path, "error", "Add at least one line item before creating an invoice."));
  }
  if (itemsResult.data.some((item) => item.unit_price_cents <= 0)) {
    redirect(messageUrl(path, "error", "Every invoice item needs a price greater than zero."));
  }
  if (invoiceResult.error) redirect(messageUrl(path, "error", invoiceResult.error.message));
  if (invoiceResult.data?.paypal_invoice_id) {
    redirect(messageUrl(path, "created", "A PayPal invoice already exists for this note."));
  }

  let invoiceRecord = invoiceResult.data;
  if (!invoiceRecord) {
    const { data, error } = await supabase
      .from("paypal_invoices")
      .insert({ field_note_id: noteId })
      .select(paypalInvoiceColumns)
      .single();
    if (error || !data) redirect(messageUrl(path, "error", error?.message ?? "Invoice setup failed."));
    invoiceRecord = data;
  } else {
    const { error } = await supabase
      .from("paypal_invoices")
      .update({ status: "CREATING", last_error: null, updated_at: new Date().toISOString() })
      .eq("id", invoiceRecord.id);
    if (error) redirect(messageUrl(path, "error", error.message));
  }

  let paypalInvoice: Awaited<ReturnType<typeof createPayPalDraftInvoice>>;
  try {
    paypalInvoice = await createPayPalDraftInvoice({
      requestId: invoiceRecord.create_request_id,
      fieldNoteId: noteId,
      customer: {
        name: customerResult.data.name,
        email: customerResult.data.email,
      },
      items: itemsResult.data.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPriceCents: item.unit_price_cents,
      })),
    });
  } catch (error) {
    const message = payPalErrorMessage(error);
    console.error("PayPal invoice creation failed", { debugId: payPalDebugId(error) });
    await supabase
      .from("paypal_invoices")
      .update({ status: "FAILED", last_error: message, updated_at: new Date().toISOString() })
      .eq("id", invoiceRecord.id);
    redirect(messageUrl(path, "error", message));
  }

  const { error: saveError } = await supabase
    .from("paypal_invoices")
    .update(paypalInvoiceUpdate(paypalInvoice))
    .eq("id", invoiceRecord.id);
  if (saveError) {
    redirect(messageUrl(path, "error", "The PayPal draft was created, but FieldNote could not save it. Retry safely."));
  }

  revalidatePath("/app");
  revalidatePath("/app/notes");
  revalidatePath(path);
  redirect(messageUrl(path, "created", "PayPal draft created. Review it before sending."));
}

export async function sendFieldNoteInvoice(noteId: string) {
  const path = `/app/notes/${noteId}`;
  if (!isPayPalConfigured()) {
    redirect(messageUrl(path, "error", "PayPal Sandbox is not configured yet."));
  }

  const supabase = await authenticatedClient();
  const [{ data: note, error: noteError }, { data: invoiceRecord, error: invoiceError }] = await Promise.all([
    supabase.from("field_notes").select("id, status").eq("id", noteId).maybeSingle(),
    supabase.from("paypal_invoices").select(paypalInvoiceColumns).eq("field_note_id", noteId).maybeSingle(),
  ]);

  if (noteError || !note) redirect(messageUrl("/app/notes", "error", "Field note not found."));
  if (invoiceError || !invoiceRecord?.paypal_invoice_id) {
    redirect(messageUrl(path, "error", "Create the PayPal draft before sending it."));
  }

  if (invoiceRecord.status !== "DRAFT") {
    if (note.status !== "invoiced") {
      const { error } = await supabase
        .from("field_notes")
        .update({ status: "invoiced", updated_at: new Date().toISOString() })
        .eq("id", noteId);
      if (error) redirect(messageUrl(path, "error", error.message));
    }
    redirect(messageUrl(path, "created", "This PayPal invoice has already been sent."));
  }

  let invoiceDetails: Awaited<ReturnType<typeof getPayPalInvoice>> | null = null;
  let sendError: unknown;
  try {
    await sendPayPalInvoice(invoiceRecord.paypal_invoice_id, invoiceRecord.send_request_id);
    invoiceDetails = await getPayPalInvoice(invoiceRecord.paypal_invoice_id);
  } catch (error) {
    sendError = error;
    try {
      const current = await getPayPalInvoice(invoiceRecord.paypal_invoice_id);
      if (current.status !== "DRAFT") invoiceDetails = current;
    } catch {
      // The original PayPal error is more useful than a follow-up status error.
    }
  }

  if (!invoiceDetails) {
    const message = payPalErrorMessage(sendError);
    console.error("PayPal invoice send failed", { debugId: payPalDebugId(sendError) });
    await supabase
      .from("paypal_invoices")
      .update({ last_error: message, updated_at: new Date().toISOString() })
      .eq("id", invoiceRecord.id);
    redirect(messageUrl(path, "error", message));
  }

  const { error: invoiceUpdateError } = await supabase
    .from("paypal_invoices")
    .update(paypalInvoiceUpdate(invoiceDetails))
    .eq("id", invoiceRecord.id);
  if (invoiceUpdateError) redirect(messageUrl(path, "error", invoiceUpdateError.message));

  const { error: noteUpdateError } = await supabase
    .from("field_notes")
    .update({ status: "invoiced", updated_at: new Date().toISOString() })
    .eq("id", noteId);
  if (noteUpdateError) redirect(messageUrl(path, "error", noteUpdateError.message));

  revalidatePath("/app");
  revalidatePath("/app/notes");
  revalidatePath(path);
  redirect(messageUrl(path, "created", "Invoice sent through PayPal Sandbox."));
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
