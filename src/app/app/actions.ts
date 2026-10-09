"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getVercelOidcToken } from "@vercel/oidc";
import { z } from "zod";
import { extractFieldNote } from "@/lib/ai/extract-field-note";
import { transcribeFieldNote } from "@/lib/ai/transcribe-field-note";
import { DraftSaveResult, saveFieldNoteDraft } from "@/lib/notes/save-draft";
import {
  createPayPalDraftInvoice,
  getPayPalInvoice,
  isPayPalConfigured,
  payPalDebugId,
  payPalErrorMessage,
} from "@/lib/paypal/client";
import { InvoiceNotSendableError, sendInvoiceSafely } from "@/lib/paypal/send-invoice";
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

export async function createFieldNote(formData: FormData): Promise<DraftSaveResult> {
  const supabase = await authenticatedClient();
  const result = await saveFieldNoteDraft(formData, async (draft) => {
    const { data, error } = await supabase.from("field_notes").insert(draft).select("id").single();
    return { noteId: data?.id ?? null, error: error?.message ?? null };
  });
  if (!result.ok) return result;

  revalidatePath("/app");
  revalidatePath("/app/notes");
  return result;
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

async function claimInvoiceOperation(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const token = crypto.randomUUID();
  const { data, error } = await supabase.from("paypal_invoices")
    .update({ operation_token: token, operation_started_at: new Date().toISOString() })
    .eq("id", id)
    .or(`operation_started_at.is.null,operation_started_at.lt.${new Date(Date.now() - 120_000).toISOString()}`)
    .select("id").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("An invoice request is already in progress. Wait a moment, then refresh.");
  return token;
}

async function releaseInvoiceOperation(supabase: Awaited<ReturnType<typeof createClient>>, id: string, token: string) {
  const { error } = await supabase.from("paypal_invoices")
    .update({ operation_token: null, operation_started_at: null })
    .eq("id", id).eq("operation_token", token);
  if (error) console.error("Invoice operation release failed", { code: error.code });
}

function refreshInvoicePaths(noteId: string) {
  revalidatePath("/app");
  revalidatePath("/app/notes");
  revalidatePath(`/app/notes/${noteId}`);
}

export async function createPayPalInvoice(noteId: string) {
  const path = `/app/notes/${noteId}`;
  if (!isPayPalConfigured()) redirect(messageUrl(path, "error", "PayPal Sandbox is not configured yet."));
  const supabase = await authenticatedClient();
  const { data: invoiceRecord, error: reserveError } = await supabase.rpc("reserve_paypal_invoice", {
    p_note_id: noteId,
    p_business_name: process.env.PAYPAL_BUSINESS_NAME?.trim() || "FieldNote Services",
  });
  if (reserveError || !invoiceRecord) redirect(messageUrl(path, "error", reserveError?.message ?? "Invoice setup failed."));
  if (invoiceRecord.paypal_invoice_id) redirect(messageUrl(path, "created", "A PayPal invoice already exists for this note."));

  let token: string;
  try {
    token = await claimInvoiceOperation(supabase, invoiceRecord.id);
  } catch (error) {
    redirect(messageUrl(path, "error", error instanceof Error ? error.message : "Invoice request could not start."));
  }

  let failure: string | null = null;
  try {
    const observedAt = new Date().toISOString();
    const invoice = await createPayPalDraftInvoice({
      requestId: invoiceRecord.create_request_id, payload: invoiceRecord.draft_payload,
    });
    const { error } = await supabase.rpc("sync_paypal_invoice", {
      p_invoice_id: invoiceRecord.id, p_details: invoice, p_observed_at: observedAt,
    });
    if (error) {
      failure = "The PayPal draft was created, but FieldNote could not save it. Retry the same draft safely.";
      console.error("PayPal draft save failed", { code: error.code });
    }
  } catch (error) {
    failure = payPalErrorMessage(error);
    console.error("PayPal invoice creation failed", { debugId: payPalDebugId(error) });
    await supabase.from("paypal_invoices").update({ status: "FAILED", last_error: failure })
      .eq("id", invoiceRecord.id).eq("operation_token", token).is("paypal_invoice_id", null);
  } finally {
    await releaseInvoiceOperation(supabase, invoiceRecord.id, token);
  }
  refreshInvoicePaths(noteId);
  redirect(messageUrl(path, failure ? "error" : "created", failure ?? "PayPal draft created. Review it before sending."));
}

export async function sendFieldNoteInvoice(noteId: string) {
  const path = `/app/notes/${noteId}`;
  if (!isPayPalConfigured()) redirect(messageUrl(path, "error", "PayPal Sandbox is not configured yet."));
  const supabase = await authenticatedClient();
  const { data: invoiceRecord, error } = await supabase.from("paypal_invoices")
    .select("id, paypal_invoice_id, send_request_id").eq("field_note_id", noteId).maybeSingle();
  if (error || !invoiceRecord?.paypal_invoice_id) redirect(messageUrl(path, "error", "Create the PayPal draft before sending it."));
  let token: string;
  try {
    token = await claimInvoiceOperation(supabase, invoiceRecord.id);
  } catch (error) {
    redirect(messageUrl(path, "error", error instanceof Error ? error.message : "Invoice request could not start."));
  }
  let failure: string | null = null;
  let alreadySent = false;
  try {
    const result = await sendInvoiceSafely(invoiceRecord.paypal_invoice_id, invoiceRecord.send_request_id);
    alreadySent = result.alreadySent;
    const { error: syncError } = await supabase.rpc("sync_paypal_invoice", {
      p_invoice_id: invoiceRecord.id, p_details: result.invoice, p_observed_at: result.observedAt,
    });
    if (syncError) failure = "PayPal confirmed the invoice, but FieldNote could not save its status. Refresh to reconcile it.";
  } catch (error) {
    failure = error instanceof InvoiceNotSendableError ? error.message : payPalErrorMessage(error);
    console.error("PayPal invoice send failed", { debugId: payPalDebugId(error) });
    await supabase.from("paypal_invoices").update({ last_error: failure })
      .eq("id", invoiceRecord.id).eq("operation_token", token);
  } finally {
    await releaseInvoiceOperation(supabase, invoiceRecord.id, token);
  }
  refreshInvoicePaths(noteId);
  redirect(messageUrl(path, failure ? "error" : "created", failure ?? (alreadySent ? "This PayPal invoice has already been sent." : "Invoice sent through PayPal Sandbox.")));
}

export async function refreshFieldNoteInvoice(noteId: string) {
  const path = `/app/notes/${noteId}`;
  const supabase = await authenticatedClient();
  const { data: record, error } = await supabase.from("paypal_invoices")
    .select("id, paypal_invoice_id").eq("field_note_id", noteId).maybeSingle();
  if (error || !record?.paypal_invoice_id) redirect(messageUrl(path, "error", "No PayPal invoice is available to refresh."));
  let failure: string | null = null;
  try {
    const observedAt = new Date().toISOString();
    const invoice = await getPayPalInvoice(record.paypal_invoice_id);
    const { error: syncError } = await supabase.rpc("sync_paypal_invoice", {
      p_invoice_id: record.id, p_details: invoice, p_observed_at: observedAt,
    });
    if (syncError) failure = "The invoice status could not be saved. Try again.";
  } catch (error) {
    failure = payPalErrorMessage(error);
  }
  refreshInvoicePaths(noteId);
  redirect(messageUrl(path, failure ? "error" : "created", failure ?? "Invoice status updated from PayPal."));
}

const reviewLineItemSchema = z.object({
  line_item_id: z.union([z.literal(""), z.uuid()]).transform((value) => value || null),
  catalog_item_id: z.union([z.literal(""), z.uuid()]).transform((value) => value || null),
  description: z.string().trim().min(1).max(240),
  quantity: z.coerce.number().positive().max(1000000).multipleOf(0.01),
  unit_price: z.coerce.number().min(0).max(1000000).multipleOf(0.01),
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
  const { error } = await supabase.rpc("save_note_review", {
    p_note_id: noteId,
    p_approve: parsed.data.intent === "review",
    p_items: parsed.data.lineItems.map((item) => ({
      id: item.line_item_id,
      catalog_item_id: item.catalog_item_id,
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: Math.round(item.unit_price * 100),
    })),
  });
  if (error) redirect(messageUrl(path, "error", error.message));

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
