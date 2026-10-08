const statusStyles = {
  draft: "bg-[#edf0ed] text-[#566159]",
  reviewed: "bg-[#e5f1e7] text-[#245b31]",
  invoiced: "bg-[#e8eef7] text-[#27527a]",
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
    ? "bg-[#e5f1e7] text-[#245b31]"
    : ["CANCELLED", "FAILED"].includes(status)
      ? "bg-[#fff0ee] text-[#8a2e25]"
      : ["PARTIALLY_PAID", "PAYMENT_PENDING"].includes(status)
        ? "bg-[#fff3d6] text-[#765513]"
        : "bg-[#e8eef7] text-[#27527a]";
  return <span title="PayPal invoice status" className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${style}`}>
    {status.toLowerCase().replaceAll("_", " ")}
  </span>;
}
