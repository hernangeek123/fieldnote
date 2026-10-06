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
