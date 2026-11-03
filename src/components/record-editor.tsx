"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import type { RecordUpdateResult } from "@/lib/records";

export function RecordEditor({ name, action, fields, children }: {
  name: string;
  action: (formData: FormData) => Promise<RecordUpdateResult>;
  fields: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const busy = useRef(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function close() {
    setEditing(false);
    setError(null);
    requestAnimationFrame(() => editButton.current?.focus());
  }

  return <>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">{children}</div>
      <button ref={editButton} type="button" aria-label={`Edit ${name}`} title={`Edit ${name}`} aria-expanded={editing}
        disabled={saving} onClick={() => {
          if (editing) close();
          else {
            setEditing(true); setSaved(false);
            requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>("input")?.focus());
          }
        }} className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-control hover:bg-background disabled:opacity-60">
        {editing ? <X size={17} aria-hidden="true" /> : <Pencil size={17} aria-hidden="true" />}
      </button>
    </div>
    {saved ? <p role="status" className="mt-3 text-sm text-accent">Changes saved.</p> : null}
    {editing ? <form ref={formRef} aria-label={`Edit ${name}`} className="mt-5 border-t border-line pt-5" onSubmit={async (event) => {
      event.preventDefault();
      if (busy.current) return;
      const data = new FormData(event.currentTarget);
      busy.current = true; setSaving(true); setError(null);
      try {
        const result = await action(data);
        if (!result.ok) { setError(result.error); return; }
        close(); setSaved(true); router.refresh();
      } catch {
        setError("Could not save. Your edits are still here; try again.");
      } finally { busy.current = false; setSaving(false); }
    }}>
      <fieldset disabled={saving} className="min-w-0 space-y-4">
        {fields}
        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <SubmitButton label="Save changes" pendingLabel="Saving..." icon="save" isPending={saving} />
          <button type="button" onClick={close} className="h-11 rounded-md border border-control px-4 text-sm font-semibold hover:bg-background">Cancel</button>
        </div>
      </fieldset>
    </form> : null}
  </>;
}
