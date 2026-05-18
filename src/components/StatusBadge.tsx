export function StatusBadge({ status }: { status: "present" | "absent" | "late" }) {
  const cfg = {
    present: { label: "Present", cls: "bg-success/15 text-success border-success/30" },
    absent: { label: "Absent", cls: "bg-destructive/15 text-destructive border-destructive/30" },
    late: { label: "Late", cls: "bg-warning/20 text-warning-foreground border-warning/40" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}
