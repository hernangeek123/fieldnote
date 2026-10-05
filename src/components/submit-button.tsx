"use client";

import { useFormStatus } from "react-dom";
import { Plus, Save, UserPlus, type LucideIcon } from "lucide-react";

type SubmitButtonIcon = "plus" | "save" | "user-plus";

const icons = {
  plus: Plus,
  save: Save,
  "user-plus": UserPlus,
} satisfies Record<SubmitButtonIcon, LucideIcon>;

type SubmitButtonProps = {
  label: string;
  pendingLabel: string;
  icon: SubmitButtonIcon;
};

export function SubmitButton({ label, pendingLabel, icon }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const Icon = icons[icon];

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#176b3a] px-5 text-sm font-semibold text-white transition hover:bg-[#11562e] disabled:cursor-wait disabled:bg-[#8fa197]"
    >
      <Icon size={17} aria-hidden="true" />
      {pending ? pendingLabel : label}
    </button>
  );
}
