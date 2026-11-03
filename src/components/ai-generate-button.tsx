"use client";

import { Sparkles } from "lucide-react";
import { useFormStatus } from "react-dom";
import { generateFieldNoteLineItems } from "@/app/app/actions";

function GenerateSubmitButton({ hasItems }: { hasItems: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-strong px-4 text-sm font-semibold text-white hover:bg-strong-hover disabled:cursor-wait disabled:bg-disabled-action"
    >
      <Sparkles size={17} aria-hidden="true" />
      {pending ? "Generating..." : hasItems ? "Regenerate with AI" : "Generate with AI"}
    </button>
  );
}

export function AiGenerateButton({ noteId, hasItems }: { noteId: string; hasItems: boolean }) {
  const action = generateFieldNoteLineItems.bind(null, noteId);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          hasItems &&
          !window.confirm("Regenerating will replace the current draft line items. Continue?")
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="replace_existing" value={hasItems ? "true" : "false"} />
      <GenerateSubmitButton hasItems={hasItems} />
    </form>
  );
}
