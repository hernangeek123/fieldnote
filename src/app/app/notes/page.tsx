import Link from "next/link";
import { ArrowRight, BookOpenText, Plus } from "lucide-react";
import { Notice } from "@/components/notice";
import { InvoiceStatusBadge, StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function NotesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: notes } = await supabase
    .from("field_notes")
    .select("id, customer_id, raw_note, occurred_on, status, created_at")
    .order("occurred_on", { ascending: false });

  const customerIds = [...new Set((notes ?? []).map((note) => note.customer_id).filter(Boolean))] as string[];
  const noteIds = (notes ?? []).map((note) => note.id);
  const [customersResult, lineItemsResult, invoicesResult] = await Promise.all([
    customerIds.length
      ? supabase.from("customers").select("id, name").in("id", customerIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
    noteIds.length
      ? supabase.from("note_line_items").select("field_note_id, quantity, unit_price_cents").in("field_note_id", noteIds)
      : Promise.resolve({ data: [] as Array<{ field_note_id: string; quantity: number; unit_price_cents: number }> }),
    noteIds.length
      ? supabase.from("paypal_invoices").select("field_note_id, status").in("field_note_id", noteIds)
      : Promise.resolve({ data: [] as Array<{ field_note_id: string; status: string }> }),
  ]);
  const invoiceStatuses = new Map(invoicesResult.data?.map((invoice) => [invoice.field_note_id, invoice.status]));
  const customerNames = new Map(customersResult.data?.map((customer) => [customer.id, customer.name]));
  const totals = new Map<string, number>();
  lineItemsResult.data?.forEach((item) => {
    totals.set(
      item.field_note_id,
      (totals.get(item.field_note_id) ?? 0) + Number(item.quantity) * item.unit_price_cents,
    );
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#377348]">Field notes</p>
          <h1 className="mt-1 text-3xl font-semibold">Review the work before it becomes an invoice.</h1>
        </div>
        <Link
          href="/app/notes/new"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-[#176b3a] px-4 text-sm font-semibold text-white hover:bg-[#11562e]"
        >
          <Plus size={17} aria-hidden="true" />
          New note
        </Link>
      </div>

      <Notice error={first(params.error)} success={first(params.created)} />

      <section className="mt-8 overflow-hidden rounded-md border border-[#d7ddd7] bg-white">
        {notes?.length ? (
          <ul className="divide-y divide-[#e1e5e0]">
            {notes.map((note) => (
              <li key={note.id}>
                <Link href={`/app/notes/${note.id}`} className="group block p-5 hover:bg-[#f8faf8] sm:p-6">
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-semibold">
                          {note.customer_id ? customerNames.get(note.customer_id) ?? "Unknown customer" : "No customer"}
                        </h2>
                        <StatusBadge status={note.status} />
                        {invoiceStatuses.has(note.id) ? <InvoiceStatusBadge status={invoiceStatuses.get(note.id)!} /> : null}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#58625b]">{note.raw_note}</p>
                      <p className="mt-3 text-xs text-[#7a847d]">
                        {date.format(new Date(`${note.occurred_on}T00:00:00`))}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <p className="font-semibold text-[#176b3a]">
                        {money.format((totals.get(note.id) ?? 0) / 100)}
                      </p>
                      <ArrowRight className="text-[#758078] group-hover:text-[#176b3a]" size={18} aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-16 text-center">
            <BookOpenText className="mx-auto text-[#6b796e]" size={30} aria-hidden="true" />
            <p className="mt-4 font-semibold">No field notes yet</p>
            <Link href="/app/notes/new" className="mt-3 inline-block text-sm font-semibold text-[#176b3a]">
              Create the first note
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
