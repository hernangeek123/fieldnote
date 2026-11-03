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
          ? "border-danger-border bg-danger-soft text-danger"
          : "border-success-border bg-success-soft text-success"
      }`}
    >
      <Icon className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
      {message}
    </div>
  );
}
