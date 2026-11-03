"use client";

import { ExternalLink, ReceiptText, RefreshCw, Send } from "lucide-react";
import { useFormStatus } from "react-dom";
import { createPayPalInvoice, refreshFieldNoteInvoice, sendFieldNoteInvoice } from "@/app/app/actions";
import { canSendInvoice } from "@/lib/paypal/invoice-state";
import { InvoiceStatusBadge } from "@/components/status-badge";

type Invoice = {
  paypal_invoice_id: string | null;
  invoice_number: string | null;
  status: string;
  recipient_view_url: string | null;
  invoicer_view_url: string | null;
  last_error: string | null;
  last_synced_at: string | null;
};

function ActionButton({ kind, retry = false }: { kind: "create" | "send" | "refresh"; retry?: boolean }) {
  const { pending } = useFormStatus();
  const Icon = kind === "create" ? ReceiptText : kind === "refresh" ? RefreshCw : Send;
  const label = kind === "create"
    ? retry ? "Retry PayPal draft" : "Create PayPal draft"
    : kind === "refresh" ? "Refresh status" : "Send invoice";

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-wait disabled:bg-disabled-action"
    >
      <Icon size={16} aria-hidden="true" />
      {pending ? kind === "create" ? "Creating..." : kind === "refresh" ? "Refreshing..." : "Sending..." : label}
    </button>
  );
}

export function PayPalInvoicePanel({
  noteId,
  noteStatus,
  customerEmail,
  configured,
  invoice,
}: {
  noteId: string;
  noteStatus: string;
  customerEmail: string | null;
  configured: boolean;
  invoice: Invoice | null;
}) {
  const createAction = createPayPalInvoice.bind(null, noteId);
  const sendAction = sendFieldNoteInvoice.bind(null, noteId);
  const refreshAction = refreshFieldNoteInvoice.bind(null, noteId);
  const canCreate = noteStatus === "reviewed" && !invoice?.paypal_invoice_id;
  const canSend = invoice && canSendInvoice(invoice.status) && Boolean(invoice.paypal_invoice_id);

  return (
    <section className="mt-6 border-t border-line pt-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase text-muted">PayPal invoice</h2>
        {invoice ? (
          <InvoiceStatusBadge status={invoice.status} />
        ) : null}
      </div>

      {invoice?.invoice_number ? (
        <p className="mt-3 text-sm font-semibold text-foreground">{invoice.invoice_number}</p>
      ) : null}
      {customerEmail ? <p className="mt-2 break-all text-sm text-muted">{customerEmail}</p> : null}
      {invoice?.last_error ? <p className="mt-3 text-sm leading-6 text-danger">{invoice.last_error}</p> : null}
      {invoice?.last_synced_at ? <p className="mt-2 text-xs text-muted">Updated {new Date(invoice.last_synced_at).toLocaleString("en-US", { timeZone: "UTC" })} UTC</p> : null}

      {!configured ? (
        <p className="mt-3 text-sm leading-6 text-muted">PayPal Sandbox credentials are not configured.</p>
      ) : null}
      {noteStatus === "draft" ? (
        <p className="mt-3 text-sm leading-6 text-muted">Approve the note to create a PayPal draft.</p>
      ) : null}

      <div className="mt-4 space-y-2">
        {configured && invoice?.paypal_invoice_id ? (
          <form action={refreshAction}><ActionButton kind="refresh" /></form>
        ) : null}
        {configured && canCreate ? (
          <form action={createAction}>
            <ActionButton kind="create" retry={Boolean(invoice)} />
          </form>
        ) : null}

        {configured && canSend ? (
          <form
            action={sendAction}
            onSubmit={(event) => {
              if (!window.confirm(`PayPal will email this invoice to ${customerEmail ?? "the customer"}. Continue?`)) {
                event.preventDefault();
              }
            }}
          >
            <ActionButton kind="send" />
          </form>
        ) : null}

        {invoice?.invoicer_view_url ? (
          <a
            href={invoice.invoicer_view_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-control bg-surface px-3 text-sm font-semibold text-secondary hover:bg-surface-hover"
          >
            <ExternalLink size={16} aria-hidden="true" />
            Open in PayPal
          </a>
        ) : null}

        {invoice?.status !== "DRAFT" && invoice?.recipient_view_url ? (
          <a
            href={invoice.recipient_view_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-control bg-surface px-3 text-sm font-semibold text-secondary hover:bg-surface-hover"
          >
            <ExternalLink size={16} aria-hidden="true" />
            View payment page
          </a>
        ) : null}
      </div>
    </section>
  );
}
