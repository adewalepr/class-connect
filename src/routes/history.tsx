import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — Attendify" }] }),
  component: History,
});

const days = Array.from({ length: 30 }, (_, i) => i + 1);
const statusMap: Record<number, "present" | "absent" | "late"> = {
  2: "present", 3: "present", 5: "late", 7: "absent", 8: "present", 9: "present",
  10: "present", 12: "present", 14: "absent", 15: "late", 16: "present", 17: "present",
  19: "present", 21: "present", 22: "late", 23: "present", 24: "present", 26: "present", 28: "present",
};

const records = [
  { course: "Algorithms", code: "CS301", date: "Mon, May 12", time: "10:00", status: "present" as const },
  { course: "Linear Algebra", code: "MATH210", date: "Mon, May 12", time: "13:30", status: "late" as const },
  { course: "Database Systems", code: "CS320", date: "Fri, May 9", time: "15:45", status: "absent" as const },
  { course: "Operating Systems", code: "CS340", date: "Thu, May 8", time: "09:00", status: "present" as const },
  { course: "Algorithms", code: "CS301", date: "Wed, May 7", time: "10:00", status: "present" as const },
];

const dotCls = (s?: string) =>
  s === "present" ? "bg-success" : s === "absent" ? "bg-destructive" : s === "late" ? "bg-warning" : "";

function History() {
  return (
    <PhoneShell>
      <ScreenHeader title="Attendance" subtitle="May 2026" back="/dashboard" showTheme right={
        <button className="glass size-10 rounded-full flex items-center justify-center"><Filter className="size-4" /></button>
      } />

      <div className="px-5">
        <div className="glass-card rounded-2xl flex items-center gap-2 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input className="bg-transparent outline-none text-sm flex-1" placeholder="Search by course, code or date" />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {["All", "CS301", "MATH210", "CS320", "CS340"].map((c, i) => (
            <button key={c} className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${i === 0 ? "gradient-primary text-primary-foreground border-transparent shadow-soft" : "bg-card/50 border-border"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: "Present", value: "22", cls: "text-success", bg: "bg-success/10" },
            { label: "Late", value: "4", cls: "text-warning-foreground", bg: "bg-warning/15" },
            { label: "Absent", value: "2", cls: "text-destructive", bg: "bg-destructive/10" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-3 ${s.bg}`}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.cls}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 glass-card rounded-3xl p-4">
          <div className="grid grid-cols-7 text-[10px] text-muted-foreground mb-2 text-center">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => <div key={`p${i}`} />)}
            {days.map((d) => (
              <div key={d} className="aspect-square rounded-xl bg-secondary/60 flex flex-col items-center justify-center relative">
                <span className="text-[11px] font-medium">{d}</span>
                {statusMap[d] && <span className={`absolute bottom-1 size-1.5 rounded-full ${dotCls(statusMap[d])}`} />}
              </div>
            ))}
          </div>
        </div>

        <h3 className="mt-6 mb-3 font-semibold">Recent records</h3>
        <div className="space-y-2.5">
          {records.map((r, i) => (
            <div key={i} className="glass-card rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-semibold text-sm truncate">{r.course}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">{r.code} · {r.date} · {r.time}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </div>
    </PhoneShell>
  );
}
