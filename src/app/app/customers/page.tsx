import { Mail, MapPin, Phone, Users } from "lucide-react";
import { createCustomer, updateCustomer } from "@/app/app/actions";
import { CustomerFields } from "@/components/record-fields";
import { RecordEditor } from "@/components/record-editor";
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
    .select("id, name, email, phone, address, updated_at")
    .order("name");

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <p className="text-sm font-semibold text-accent">Customers</p>
        <h1 className="mt-1 text-3xl font-semibold">Who are you working for?</h1>
      </div>

      <Notice error={first(params.error)} success={first(params.created)} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="min-w-0">
          <h2 className="text-lg font-semibold">Add customer</h2>
          <form action={createCustomer} className="mt-5 space-y-4 rounded-md border border-line bg-surface p-5">
            <CustomerFields />
            <SubmitButton label="Add customer" pendingLabel="Adding..." icon="user-plus" />
          </form>
        </section>

        <section className="min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Customer list</h2>
            <span className="text-sm text-muted">{customers?.length ?? 0} total</span>
          </div>
          <div className="mt-5 overflow-hidden rounded-md border border-line bg-surface">
            {customers?.length ? (
              <ul className="divide-y divide-line">
                {customers.map((customer) => (
                  <li key={customer.id} className="p-5">
                    <RecordEditor name={customer.name}
                      action={updateCustomer.bind(null, customer.id, customer.updated_at)}
                      fields={<CustomerFields values={customer} />}>
                    <p className="font-semibold [overflow-wrap:anywhere]">{customer.name}</p>
                    <div className="mt-3 space-y-2 text-sm text-muted">
                      {customer.email ? <p className="flex items-start gap-2"><Mail className="mt-0.5 shrink-0" size={15} /><span className="min-w-0 [overflow-wrap:anywhere]">{customer.email}</span></p> : null}
                      {customer.phone ? <p className="flex items-start gap-2"><Phone className="mt-0.5 shrink-0" size={15} /><span className="min-w-0 [overflow-wrap:anywhere]">{customer.phone}</span></p> : null}
                      {customer.address ? <p className="flex items-start gap-2"><MapPin className="mt-0.5 shrink-0" size={15} /><span className="min-w-0 [overflow-wrap:anywhere]">{customer.address}</span></p> : null}
                    </div>
                    </RecordEditor>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center">
                <Users className="mx-auto text-muted" size={28} />
                <p className="mt-4 font-semibold">No customers yet</p>
                <p className="mt-1 text-sm text-muted">Add the first one using the form.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
