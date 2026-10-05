import { Mail, MapPin, Phone, Users } from "lucide-react";
import { createCustomer } from "@/app/app/actions";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, email, phone, address")
    .order("name");

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <p className="text-sm font-semibold text-[#377348]">Customers</p>
        <h1 className="mt-1 text-3xl font-semibold">Who are you working for?</h1>
      </div>

      <Notice error={first(params.error)} success={first(params.created)} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section>
          <h2 className="text-lg font-semibold">Add customer</h2>
          <form action={createCustomer} className="mt-5 space-y-4 rounded-md border border-[#d7ddd7] bg-white p-5">
            <label className="block">
              <span className="field-label">Name</span>
              <input className="field-input" name="name" required maxLength={120} />
            </label>
            <label className="block">
              <span className="field-label">Email</span>
              <input className="field-input" name="email" type="email" />
            </label>
            <label className="block">
              <span className="field-label">Phone</span>
              <input className="field-input" name="phone" type="tel" />
            </label>
            <label className="block">
              <span className="field-label">Service address</span>
              <textarea className="field-input min-h-20 py-3" name="address" maxLength={240} />
            </label>
            <SubmitButton label="Add customer" pendingLabel="Adding..." icon="user-plus" />
          </form>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Customer list</h2>
            <span className="text-sm text-[#657068]">{customers?.length ?? 0} total</span>
          </div>
          <div className="mt-5 overflow-hidden rounded-md border border-[#d7ddd7] bg-white">
            {customers?.length ? (
              <ul className="divide-y divide-[#e1e5e0]">
                {customers.map((customer) => (
                  <li key={customer.id} className="p-5">
                    <p className="font-semibold">{customer.name}</p>
                    <div className="mt-3 space-y-2 text-sm text-[#657068]">
                      {customer.email ? <p className="flex items-center gap-2"><Mail size={15} />{customer.email}</p> : null}
                      {customer.phone ? <p className="flex items-center gap-2"><Phone size={15} />{customer.phone}</p> : null}
                      {customer.address ? <p className="flex items-start gap-2"><MapPin className="mt-0.5 shrink-0" size={15} />{customer.address}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center">
                <Users className="mx-auto text-[#6b796e]" size={28} />
                <p className="mt-4 font-semibold">No customers yet</p>
                <p className="mt-1 text-sm text-[#657068]">Add the first one using the form.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
