"use client";

import { BookOpenText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createFieldNote } from "@/app/app/actions";
import { useNavigationGuard } from "@/components/navigation-guard";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { VoiceNoteInput } from "@/components/voice-note-input";

export function NewNoteForm({ customers, today }: {
  customers: { id: string; name: string }[]; today: string;
}) {
  const router = useRouter();
  const { setBlocked } = useNavigationGuard();
  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState(today);
  const [voice, setVoice] = useState({ dirty: false, busy: false });
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const mountedRef = useRef(true);
  const dirty = voice.dirty || Boolean(customer) || date !== today;

  useEffect(() => {
    setBlocked(dirty);
  }, [dirty, setBlocked]);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; setBlocked(false); };
  }, [setBlocked]);

  async function save(formData: FormData) {
    if (voice.busy || saving) return;
    setSaving(true);
    setError(undefined);
    let saved = false;
    try {
      const result = await createFieldNote(formData);
      if (!mountedRef.current) return;
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBlocked(false);
      saved = true;
      router.push(`/app/notes/${result.noteId}?created=${encodeURIComponent("Field note saved as a draft.")}`);
    } catch {
      if (mountedRef.current) setError("The draft could not be saved. Your text and recording are still here. Try again.");
    } finally {
      if (mountedRef.current && !saved) setSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      void save(new FormData(event.currentTarget));
    }} className="mt-8 rounded-md border border-line bg-surface p-5 sm:p-7">
      <Notice error={error} />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block"><span className="field-label">Customer</span><select className="field-input" name="customer_id" value={customer} onChange={(event) => setCustomer(event.target.value)} disabled={saving}><option value="">No customer selected</option>{customers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="block"><span className="field-label">Job date</span><input className="field-input" type="date" name="occurred_on" value={date} onChange={(event) => setDate(event.target.value)} disabled={saving} required /></label>
      </div>
      <VoiceNoteInput onStateChange={setVoice} disabled={saving} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        <p className="flex items-center gap-2 text-sm text-muted"><BookOpenText size={17} />Saved notes remain drafts until you review them.</p>
        <SubmitButton label="Save draft" pendingLabel="Saving..." icon="save" disabled={voice.busy} isPending={saving} />
      </div>
    </form>
  );
}
