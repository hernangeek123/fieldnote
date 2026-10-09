import { Notice } from "@/components/notice";
import { NewNoteForm } from "@/components/new-note-form";
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
      <p className="mt-3 text-[#657068]">Record the job details or type a rough note, then review the transcript before saving.</p>
      <Notice error={first(params.error)} success={first(params.created)} />

      <NewNoteForm customers={customers ?? []} today={today} />
    </div>
  );
}
