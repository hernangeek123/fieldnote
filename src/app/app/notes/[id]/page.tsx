import Link from "next/link";
import { ArrowLeft, CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { AiGenerateButton } from "@/components/ai-generate-button";
import { Notice } from "@/components/notice";
import { PayPalInvoicePanel } from "@/components/paypal-invoice-panel";
import { ReviewEditor } from "@/components/review-editor";
import { StatusBadge } from "@/components/status-badge";
import { isPayPalConfigured } from "@/lib/paypal/client";
import { invoiceRecipientEmail } from "@/lib/paypal/invoice-recipient";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const date = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

export default async function NoteReviewPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data: note } = await supabase
    .from("field_notes")
    .select("id, customer_id, raw_note, occurred_on, status")
    .eq("id", id)
    .maybeSingle();
  if (!note) notFound();

  const [customerResult, lineItemsResult, catalogResult, paypalInvoiceResult] = await Promise.all([
    note.customer_id
      ? supabase.from("customers").select("id, name, email, phone, address").eq("id", note.customer_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("note_line_items")
      .select("id, catalog_item_id, description, quantity, unit_price_cents")
      .eq("field_note_id", id)
      .order("created_at"),
    supabase
      .from("catalog_items")
      .select("id, name, unit, unit_price_cents, active")
      .order("name"),
    supabase
      .from("paypal_invoices")
      .select("paypal_invoice_id, invoice_number, status, recipient_view_url, invoicer_view_url, last_error, last_synced_at, draft_payload")
      .eq("field_note_id", id)
      .maybeSingle(),
  ]);
  const customer = customerResult.data;
  const paypalInvoice = paypalInvoiceResult.data;

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/app/notes" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-accent">
        <ArrowLeft size={16} aria-hidden="true" />
        Field notes
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-accent">Review field note</p>
            <StatusBadge status={note.status} />
          </div>
          <h1 className="mt-2 text-3xl font-semibold">{customer?.name ?? "Unassigned job"}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <CalendarDays size={16} aria-hidden="true" />
            {date.format(new Date(`${note.occurred_on}T00:00:00`))}
          </p>
        </div>
        {note.status === "draft" ? (
          <AiGenerateButton noteId={note.id} hasItems={Boolean(lineItemsResult.data?.length)} />
        ) : null}
      </div>

      <Notice error={first(query.error)} success={first(query.created)} />

      <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-7">
          <ReviewEditor
            noteId={note.id}
            status={note.status}
            catalog={catalogResult.data ?? []}
            initialItems={lineItemsResult.data ?? []}
            paypalInvoiceCreated={Boolean(paypalInvoice)}
          />

          <section className="rounded-md border border-line bg-surface p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Original field note</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-secondary">{note.raw_note}</p>
          </section>
        </div>

        <aside>
          <section className="border-t border-line pt-5 lg:border-t-0 lg:pt-0">
            <h2 className="text-sm font-semibold uppercase text-muted">Customer</h2>
            {customer ? (
              <div className="mt-4 space-y-3 text-sm text-secondary">
                <p className="font-semibold text-foreground">{customer.name}</p>
                {customer.email ? <p className="flex items-center gap-2"><Mail size={15} />{customer.email}</p> : null}
                {customer.phone ? <p className="flex items-center gap-2"><Phone size={15} />{customer.phone}</p> : null}
                {customer.address ? <p className="flex items-start gap-2"><MapPin className="mt-0.5 shrink-0" size={15} />{customer.address}</p> : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">No customer selected.</p>
            )}
          </section>
          <PayPalInvoicePanel
            noteId={note.id}
            noteStatus={note.status}
            customerEmail={paypalInvoice ? invoiceRecipientEmail(paypalInvoice.draft_payload) : customer?.email ?? null}
            configured={isPayPalConfigured()}
            invoice={paypalInvoice}
          />
        </aside>
      </div>
    </div>
  );
}
