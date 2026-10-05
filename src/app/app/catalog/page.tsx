import { CircleDollarSign, PackageOpen, Plus } from "lucide-react";
import { createCatalogItem } from "@/app/app/actions";
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
    .select("id, name, description, unit, unit_price_cents, active")
    .order("name");

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-semibold text-[#377348]">Price book</p>
      <h1 className="mt-1 text-3xl font-semibold">Your services, your prices.</h1>
      <p className="mt-3 max-w-2xl text-[#657068]">FieldNote will use this catalog when matching spoken work to invoice line items.</p>
      <Notice error={first(params.error)} success={first(params.created)} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section>
          <h2 className="text-lg font-semibold">Add service</h2>
          <form action={createCatalogItem} className="mt-5 space-y-4 rounded-md border border-[#d7ddd7] bg-white p-5">
            <label className="block"><span className="field-label">Service name</span><input className="field-input" name="name" required maxLength={120} /></label>
            <label className="block"><span className="field-label">Description</span><textarea className="field-input min-h-20 py-3" name="description" maxLength={240} /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="field-label">Price</span><div className="relative"><span className="absolute left-3 top-3 text-[#657068]">$</span><input className="field-input pl-7" name="price" type="number" min="0" step="0.01" required /></div></label>
              <label className="block"><span className="field-label">Per</span><input className="field-input" name="unit" defaultValue="job" required maxLength={40} /></label>
            </div>
            <SubmitButton label="Add service" pendingLabel="Adding..." icon={Plus} />
          </form>
        </section>

        <section>
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Services</h2><span className="text-sm text-[#657068]">{items?.length ?? 0} total</span></div>
          <div className="mt-5 overflow-hidden rounded-md border border-[#d7ddd7] bg-white">
            {items?.length ? (
              <ul className="divide-y divide-[#e1e5e0]">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-5 p-5">
                    <div><p className="font-semibold">{item.name}</p>{item.description ? <p className="mt-1 text-sm leading-6 text-[#657068]">{item.description}</p> : null}<p className="mt-2 text-xs uppercase text-[#7a847d]">per {item.unit}</p></div>
                    <p className="shrink-0 font-semibold text-[#176b3a]">{money(item.unit_price_cents)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center"><PackageOpen className="mx-auto text-[#6b796e]" size={28} /><p className="mt-4 font-semibold">Your price book is empty</p><p className="mt-1 text-sm text-[#657068]">Add a few common services to get started.</p></div>
            )}
          </div>
          <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#657068]"><CircleDollarSign className="mt-0.5 shrink-0" size={17} />Prices are stored in cents to keep invoice totals exact.</div>
        </section>
      </div>
    </div>
  );
}
