import { CircleDollarSign, PackageOpen } from "lucide-react";
import { createCatalogItem, updateCatalogItem } from "@/app/app/actions";
import { CatalogFields } from "@/components/record-fields";
import { RecordEditor } from "@/components/record-editor";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/server";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("catalog_items")
    .select("id, name, description, unit, unit_price_cents, active, updated_at")
    .order("name");

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-semibold text-accent">Price book</p>
      <h1 className="mt-1 text-3xl font-semibold">Your services, your prices.</h1>
      <p className="mt-3 max-w-2xl text-muted">FieldNote will use this catalog when matching spoken work to invoice line items.</p>
      <Notice error={first(params.error)} success={first(params.created)} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="min-w-0">
          <h2 className="text-lg font-semibold">Add service</h2>
          <form action={createCatalogItem} className="mt-5 space-y-4 rounded-md border border-line bg-surface p-5">
            <CatalogFields />
            <SubmitButton label="Add service" pendingLabel="Adding..." icon="plus" />
          </form>
        </section>

        <section className="min-w-0">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Services</h2><span className="text-sm text-muted">{items?.length ?? 0} total</span></div>
          <div className="mt-5 overflow-hidden rounded-md border border-line bg-surface">
            {items?.length ? (
              <ul className="divide-y divide-line">
                {items.map((item) => (
                  <li key={item.id} className="p-5">
                    <RecordEditor name={item.name}
                      action={updateCatalogItem.bind(null, item.id, item.updated_at)}
                      fields={<CatalogFields values={item} />}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="min-w-0 font-semibold [overflow-wrap:anywhere]">{item.name}</p>
                        <p className="shrink-0 font-semibold text-accent">{money(item.unit_price_cents)}</p>
                      </div>
                      {item.description ? <p className="mt-1 text-sm leading-6 text-muted [overflow-wrap:anywhere]">{item.description}</p> : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <p className="min-w-0 text-xs uppercase text-muted [overflow-wrap:anywhere]">per {item.unit}</p>
                        {!item.active ? <span className="rounded bg-warning-soft px-2 py-1 text-xs font-semibold text-warning">Inactive</span> : null}
                      </div>
                    </RecordEditor>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center"><PackageOpen className="mx-auto text-muted" size={28} /><p className="mt-4 font-semibold">Your price book is empty</p><p className="mt-1 text-sm text-muted">Add a few common services to get started.</p></div>
            )}
          </div>
          <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-muted"><CircleDollarSign className="mt-0.5 shrink-0" size={17} />Prices are stored in cents to keep invoice totals exact.</div>
        </section>
      </div>
    </div>
  );
}
