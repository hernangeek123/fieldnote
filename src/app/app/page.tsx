import Link from "next/link";
import { ArrowRight, BookOpenText, PackageOpen, Users } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";

function plural(count: number, singular: string) {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const [customers, catalog, notes, recentNotes] = await Promise.all([
    supabase.from("customers").select("id, name"),
    supabase.from("catalog_items").select("id", { count: "exact", head: true }),
    supabase.from("field_notes").select("id", { count: "exact", head: true }),
    supabase
      .from("field_notes")
      .select("id, customer_id, raw_note, occurred_on, status")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const stats = [
    { label: "Customers", value: customers.data?.length ?? 0, icon: Users },
    { label: "Services", value: catalog.count ?? 0, icon: PackageOpen },
    { label: "Field notes", value: notes.count ?? 0, icon: BookOpenText },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent">Workspace overview</p>
          <h1 className="mt-1 text-3xl font-semibold">Good work starts with a clear note.</h1>
        </div>
        <span className="rounded-md bg-success-soft px-3 py-1 text-xs font-semibold text-success">
          PayPal Sandbox
        </span>
      </div>

      <section className="mt-8 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-surface p-5">
            <Icon size={19} className="text-accent" aria-hidden="true" />
            <p className="mt-5 text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent field notes</h2>
            <p className="mt-1 text-sm text-muted">Draft work waiting for review.</p>
          </div>
          <Link
            href="/app/notes/new"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent"
          >
            Add note <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-5 overflow-hidden rounded-md border border-line bg-surface">
          {recentNotes.data?.length ? (
            <ul className="divide-y divide-line">
              {recentNotes.data.map((note) => (
                <li key={note.id}>
                  <Link href={`/app/notes/${note.id}`} className="block p-5 hover:bg-surface-muted">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">
                        {customers.data?.find((customer) => customer.id === note.customer_id)?.name ??
                          "No customer"}
                      </p>
                      <StatusBadge status={note.status} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                      {note.raw_note}
                    </p>
                    <p className="mt-3 text-xs text-muted">{note.occurred_on}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-12 text-center">
              <BookOpenText className="mx-auto text-muted" size={28} aria-hidden="true" />
              <p className="mt-4 font-semibold">No field notes yet</p>
              <p className="mt-1 text-sm text-muted">
                Your first saved note will appear here.
              </p>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-muted">
          {plural(recentNotes.data?.length ?? 0, "recent note")} shown
        </p>
      </section>
    </div>
  );
}
