import "server-only";

import { z } from "zod";

const tokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
});

const invoiceSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
  detail: z
    .object({
      invoice_number: z.string().optional(),
      metadata: z
        .object({
          recipient_view_url: z.url().optional(),
          invoicer_view_url: z.url().optional(),
        })
        .optional(),
    })
    .optional(),
});

const invoiceReferenceSchema = z.object({ href: z.url() });

export type PayPalInvoice = z.infer<typeof invoiceSchema>;

type DraftInvoiceInput = {
  requestId: string;
  fieldNoteId: string;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
  }>;
};

type CachedToken = {
  value: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;

class PayPalApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly debugId?: string,
  ) {
    super(message);
    this.name = "PayPalApiError";
  }
}

function config() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  const apiBase = (process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com").replace(/\/$/, "");

  if (!clientId || !clientSecret) {
    throw new PayPalApiError("PayPal Sandbox credentials are not configured.", 503);
  }

  return { clientId, clientSecret, apiBase };
}

export function isPayPalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim());
}

async function errorFromResponse(response: Response) {
  const payload = await response.json().catch(() => null) as {
    message?: string;
    debug_id?: string;
    details?: Array<{ description?: string }>;
  } | null;
  const message = payload?.details?.[0]?.description || payload?.message || `PayPal returned ${response.status}.`;
  return new PayPalApiError(message.slice(0, 500), response.status, payload?.debug_id);
}

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const { clientId, clientSecret, apiBase } = config();
  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    cache: "no-store",
  });

  if (!response.ok) throw await errorFromResponse(response);
  const token = tokenSchema.parse(await response.json());
  cachedToken = {
    value: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000,
  };
  return cachedToken.value;
}

async function paypalFetch(path: string, init: RequestInit, requestId?: string) {
  const { apiBase } = config();
  const token = await accessToken();
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(requestId ? { "PayPal-Request-Id": requestId } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) throw await errorFromResponse(response);
  return response;
}

function decimalQuantity(quantity: number) {
  return quantity.toFixed(5).replace(/\.?0+$/, "");
}

export async function createPayPalDraftInvoice(input: DraftInvoiceInput) {
  const response = await paypalFetch(
    "/v2/invoicing/invoices",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        detail: {
          currency_code: "USD",
          invoice_date: new Date().toISOString().slice(0, 10),
          reference: `FieldNote ${input.fieldNoteId.slice(0, 8)}`,
          note: "Thank you for your business.",
          payment_term: { term_type: "DUE_ON_RECEIPT" },
        },
        invoicer: {
          business_name: process.env.PAYPAL_BUSINESS_NAME?.trim() || "FieldNote Services",
        },
        primary_recipients: [
          {
            billing_info: {
              business_name: input.customer.name,
              email_address: input.customer.email,
            },
          },
        ],
        items: input.items.map((item) => ({
          name: item.description.slice(0, 200),
          quantity: decimalQuantity(item.quantity),
          unit_amount: {
            currency_code: "USD",
            value: (item.unitPriceCents / 100).toFixed(2),
          },
          unit_of_measure: "QUANTITY",
        })),
      }),
    },
    input.requestId,
  );

  const payload: unknown = await response.json();
  const invoice = invoiceSchema.safeParse(payload);
  if (invoice.success) return invoice.data;

  const reference = invoiceReferenceSchema.parse(payload);
  const invoiceId = new URL(reference.href).pathname.split("/").filter(Boolean).at(-1);
  if (!invoiceId) throw new PayPalApiError("PayPal did not return an invoice ID.", 502);
  return getPayPalInvoice(invoiceId);
}

export async function sendPayPalInvoice(invoiceId: string, requestId: string) {
  await paypalFetch(
    `/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}/send`,
    {
      method: "POST",
      body: JSON.stringify({ send_to_invoicer: false, send_to_recipient: true }),
    },
    requestId,
  );
}

export async function getPayPalInvoice(invoiceId: string) {
  const response = await paypalFetch(
    `/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}`,
    { method: "GET" },
  );
  return invoiceSchema.parse(await response.json());
}

export function payPalErrorMessage(error: unknown) {
  if (error instanceof PayPalApiError) {
    if (error.status === 401 || error.status === 403) {
      return "PayPal rejected the configured Sandbox credentials.";
    }
    if (error.status >= 500) return "PayPal is temporarily unavailable. Try again shortly.";
    return error.message;
  }
  if (error instanceof z.ZodError) return "PayPal returned an unexpected response.";
  return "PayPal could not complete the request.";
}

export function payPalDebugId(error: unknown) {
  return error instanceof PayPalApiError ? error.debugId : undefined;
}
