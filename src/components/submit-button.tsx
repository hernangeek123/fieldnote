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
  disabled?: boolean;
  isPending?: boolean;
};

export function SubmitButton({ label, pendingLabel, icon, disabled = false, isPending = false }: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus();
  const pending = formPending || isPending;
  const Icon = icons[icon];

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-wait disabled:bg-disabled-action"
    >
      <Icon size={17} aria-hidden="true" />
      {pending ? pendingLabel : label}
    </button>
  );
}
