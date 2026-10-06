import Link from "next/link";
import { ArrowLeft, CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { Notice } from "@/components/notice";
import { ReviewEditor } from "@/components/review-editor";
import { StatusBadge } from "@/components/status-badge";
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

  const [customerResult, lineItemsResult, catalogResult] = await Promise.all([
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
      .select("id, name, unit, unit_price_cents")
      .eq("active", true)
      .order("name"),
  ]);
  const customer = customerResult.data;

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/app/notes" className="inline-flex items-center gap-2 text-sm font-semibold text-[#566159] hover:text-[#176b3a]">
        <ArrowLeft size={16} aria-hidden="true" />
        Field notes
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-[#377348]">Review field note</p>
            <StatusBadge status={note.status} />
          </div>
          <h1 className="mt-2 text-3xl font-semibold">{customer?.name ?? "Unassigned job"}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-[#657068]">
            <CalendarDays size={16} aria-hidden="true" />
            {date.format(new Date(`${note.occurred_on}T00:00:00`))}
          </p>
        </div>
      </div>

      <Notice error={first(query.error)} success={first(query.created)} />

      <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-7">
          <ReviewEditor
            noteId={note.id}
            status={note.status}
            catalog={catalogResult.data ?? []}
            initialItems={lineItemsResult.data ?? []}
          />

          <section className="rounded-md border border-[#d7ddd7] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Original field note</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#4f5b52]">{note.raw_note}</p>
          </section>
        </div>

        <aside>
          <section className="border-t border-[#cfd6cf] pt-5 lg:border-t-0 lg:pt-0">
            <h2 className="text-sm font-semibold uppercase text-[#657068]">Customer</h2>
            {customer ? (
              <div className="mt-4 space-y-3 text-sm text-[#4f5b52]">
                <p className="font-semibold text-[#17201a]">{customer.name}</p>
                {customer.email ? <p className="flex items-center gap-2"><Mail size={15} />{customer.email}</p> : null}
                {customer.phone ? <p className="flex items-center gap-2"><Phone size={15} />{customer.phone}</p> : null}
                {customer.address ? <p className="flex items-start gap-2"><MapPin className="mt-0.5 shrink-0" size={15} />{customer.address}</p> : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#657068]">No customer selected.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
