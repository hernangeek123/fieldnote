import { BookOpenText } from "lucide-react";
import { createFieldNote } from "@/app/app/actions";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/server";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function NewNotePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: customers } = await supabase.from("customers").select("id, name").order("name");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-[#377348]">New field note</p>
      <h1 className="mt-1 text-3xl font-semibold">Capture the job while it is fresh.</h1>
      <p className="mt-3 text-[#657068]">Type the rough note for now. Voice capture and automatic line-item extraction come next.</p>
      <Notice error={first(params.error)} success={first(params.created)} />

      <form action={createFieldNote} className="mt-8 rounded-md border border-[#d7ddd7] bg-white p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block"><span className="field-label">Customer</span><select className="field-input" name="customer_id" defaultValue=""><option value="">No customer selected</option>{customers?.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label>
          <label className="block"><span className="field-label">Job date</span><input className="field-input" type="date" name="occurred_on" defaultValue={today} required /></label>
        </div>

        <label className="mt-5 block">
          <span className="field-label">What happened on the job?</span>
          <textarea
            className="field-input min-h-64 resize-y py-4 text-base leading-7"
            name="raw_note"
            required
            maxLength={10000}
            placeholder="Replaced the leaking kitchen faucet for Maria. Used one chrome fixture and two supply lines. Two hours of labor..."
          />
        </label>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#e1e5e0] pt-5">
          <p className="flex items-center gap-2 text-sm text-[#657068]"><BookOpenText size={17} />Saved notes remain drafts until you review them.</p>
          <SubmitButton label="Save draft" pendingLabel="Saving..." icon="save" />
        </div>
      </form>
    </div>
  );
}
