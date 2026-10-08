import "server-only";

import { getPayPalInvoice, sendPayPalInvoice } from "./client";
import { canSendInvoice, isSentInvoice } from "./invoice-state";

export class InvoiceNotSendableError extends Error {}

export async function sendInvoiceSafely(
  invoiceId: string,
  requestId: string,
  dependencies = { getInvoice: getPayPalInvoice, sendInvoice: sendPayPalInvoice },
) {
  let observedAt = new Date().toISOString();
  const current = await dependencies.getInvoice(invoiceId);
  if (isSentInvoice(current.status)) return { invoice: current, observedAt, alreadySent: true };
  if (!canSendInvoice(current.status)) {
    throw new InvoiceNotSendableError("This invoice cannot be sent in its current PayPal status.");
  }
  let originalError: unknown;
  try {
    await dependencies.sendInvoice(invoiceId, requestId);
  } catch (error) {
    originalError = error;
  }
  observedAt = new Date().toISOString();
  let invoice;
  try {
    invoice = await dependencies.getInvoice(invoiceId);
  } catch (error) {
    throw originalError ?? error;
  }
  if (!isSentInvoice(invoice.status)) {
    throw originalError ?? new InvoiceNotSendableError("PayPal has not confirmed sending this invoice. Refresh its status before retrying.");
  }
  return { invoice, observedAt, alreadySent: false };
}
