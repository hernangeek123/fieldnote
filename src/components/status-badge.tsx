const statusStyles = {
  draft: "bg-neutral-soft text-secondary",
  reviewed: "bg-success-soft text-success",
  invoiced: "bg-info-soft text-info",
} as const;

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status as keyof typeof statusStyles] ?? statusStyles.draft;

  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${style}`}>
      {status}
    </span>
  );
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const style = ["PAID", "MARKED_AS_PAID"].includes(status)
    ? "bg-success-soft text-success"
    : ["CANCELLED", "FAILED"].includes(status)
      ? "bg-danger-soft text-danger"
      : ["PARTIALLY_PAID", "PAYMENT_PENDING"].includes(status)
        ? "bg-warning-soft text-warning"
        : "bg-info-soft text-info";
  return <span title="PayPal invoice status" className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${style}`}>
    {status.toLowerCase().replaceAll("_", " ")}
  </span>;
}
