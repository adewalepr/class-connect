import { createFileRoute } from "@tanstack/react-router";
import { Bell, AlertTriangle, Megaphone, CheckCircle2 } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Attendify" }] }),
  component: Notifications,
});

const groups = [
  {
    label: "Today",
    items: [
      { icon: Bell, t: "Reminder", d: "CS301 starts in 15 minutes — Hall B-204", ago: "now", color: "bg-primary/15 text-primary" },
      { icon: CheckCircle2, t: "Attendance marked", d: "You were marked present in MATH210", ago: "2h", color: "bg-success/15 text-success" },
    ],
  },
  {
    label: "Yesterday",
    items: [
      { icon: AlertTriangle, t: "Missed class alert", d: "You missed CS320 — your attendance dropped to 84%", ago: "1d", color: "bg-destructive/15 text-destructive" },
      { icon: Megaphone, t: "Dr. Lin posted", d: "Midterm review session moved to Friday 4PM", ago: "1d", color: "bg-warning/20 text-warning-foreground" },
    ],
  },
  {
    label: "Earlier",
    items: [
      { icon: Bell, t: "Weekly report", d: "Great week! You attended 11 of 12 classes.", ago: "3d", color: "bg-accent text-accent-foreground" },
    ],
  },
];

function Notifications() {
  return (
    <PhoneShell>
      <ScreenHeader title="Notifications" subtitle="3 unread" back="/dashboard" showTheme right={
        <button className="text-xs font-medium text-primary px-3">Mark all</button>
      } />

      <div className="px-5">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {["All", "Reminders", "Alerts", "Announcements"].map((c, i) => (
            <button key={c} className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border ${i === 0 ? "gradient-primary text-primary-foreground border-transparent" : "bg-card/50 border-border"}`}>
              {c}
            </button>
          ))}
        </div>

        {groups.map((g) => (
          <div key={g.label} className="mt-5">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 px-1">{g.label}</p>
            <div className="space-y-2.5">
              {g.items.map((n, i) => (
                <div key={i} className="glass-card rounded-2xl p-3.5 flex gap-3 items-start">
                  <span className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                    <n.icon className="size-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">{n.t}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{n.ago}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PhoneShell>
  );
}
