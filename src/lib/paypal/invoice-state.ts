const sentStatuses = new Set([
  "SENT", "UNPAID", "PAYMENT_PENDING", "PARTIALLY_PAID", "PAID",
  "MARKED_AS_PAID", "PARTIALLY_REFUNDED", "REFUNDED", "MARKED_AS_REFUNDED",
]);

export function isSentInvoice(status: string) {
  return sentStatuses.has(status.toUpperCase());
}

export function isInvoiceLocked(noteStatus: string, invoiceReserved: boolean) {
  return noteStatus === "invoiced" || invoiceReserved;
}

export function canSendInvoice(status: string) {
  return status.toUpperCase() === "DRAFT";
}
