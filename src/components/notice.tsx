import { AlertCircle, CheckCircle2 } from "lucide-react";

export function Notice({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const message = error ?? success;
  if (!message) return null;

  const Icon = error ? AlertCircle : CheckCircle2;
  return (
    <div
      className={`mt-6 flex items-start gap-3 rounded-md border p-4 text-sm ${
        error
          ? "border-[#e3a6a0] bg-[#fff0ee] text-[#8a2e25]"
          : "border-[#9bc7a7] bg-[#edf8ef] text-[#245b31]"
      }`}
    >
      <Icon className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
      {message}
    </div>
  );
}
