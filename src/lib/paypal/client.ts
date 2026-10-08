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

export const draftPayloadSchema = z.object({
  detail: z.object({
    currency_code: z.literal("USD"), invoice_date: z.iso.date().optional(),
    invoice_number: z.string().min(1).max(25), reference: z.string(), note: z.string(),
    payment_term: z.object({ term_type: z.literal("DUE_ON_RECEIPT") }),
  }),
  invoicer: z.object({ business_name: z.string().min(1).max(100) }),
  primary_recipients: z.array(z.object({ billing_info: z.object({
    business_name: z.string(), email_address: z.email(),
  }) })).length(1),
  items: z.array(z.object({
    name: z.string().min(1).max(200), quantity: z.string().regex(/^\d+(\.\d{1,5})?$/),
    unit_amount: z.object({ currency_code: z.literal("USD"), value: z.string().regex(/^\d+\.\d{2}$/) }),
    unit_of_measure: z.literal("QUANTITY"),
  })).min(1).max(100),
});

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
    signal: AbortSignal.timeout(10_000),
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
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) throw await errorFromResponse(response);
  return response;
}

export async function createPayPalDraftInvoice(input: { requestId: string; payload: unknown }) {
  const draft = draftPayloadSchema.parse(input.payload);
  let response: Response;
  try {
    response = await paypalFetch(
      "/v2/invoicing/invoices",
      {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(draft),
      },
      input.requestId,
    );
  } catch (error) {
    // Invoice numbers also protect retries after PayPal's request-ID retention expires.
    if (error instanceof PayPalApiError && error.status === 422) {
      const search = await paypalFetch("/v2/invoicing/search-invoices", {
        method: "POST", body: JSON.stringify({ invoice_number: draft.detail.invoice_number }),
      });
      const result = z.object({ items: z.array(invoiceSchema).optional() }).parse(await search.json());
      const existing = result.items?.find((invoice) => invoice.detail?.invoice_number === draft.detail.invoice_number);
      if (existing) return getPayPalInvoice(existing.id);
    }
    throw error;
  }

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

export async function verifyPayPalWebhook(headers: Headers, event: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (!webhookId) throw new Error("PayPal webhook is not configured.");
  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const transmissionSig = headers.get("paypal-transmission-sig");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");
  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) return false;
  const cert = URL.canParse(certUrl) ? new URL(certUrl) : null;
  if (!cert || cert.protocol !== "https:" || cert.username || cert.password || cert.port
    || !["api.paypal.com", "api.sandbox.paypal.com", "api-m.paypal.com", "api-m.sandbox.paypal.com"].includes(cert.hostname)
    || !cert.pathname.startsWith("/v1/notifications/certs/")) return false;
  const response = await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST", body: JSON.stringify({ transmission_id: transmissionId,
      transmission_time: transmissionTime, transmission_sig: transmissionSig,
      cert_url: certUrl, auth_algo: authAlgo, webhook_id: webhookId, webhook_event: event }),
  });
  const result = z.object({ verification_status: z.enum(["SUCCESS", "FAILURE"]) }).parse(await response.json());
  return result.verification_status === "SUCCESS";
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
