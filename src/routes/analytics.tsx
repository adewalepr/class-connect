import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Attendify" }] }),
  component: Analytics,
});

const weekly = [70, 82, 76, 88, 92, 86, 94];
const courses = [
  { name: "Algorithms", val: 94, color: "var(--primary)" },
  { name: "Linear Algebra", val: 78, color: "oklch(0.7 0.18 220)" },
  { name: "Databases", val: 88, color: "oklch(0.72 0.18 290)" },
  { name: "OS", val: 65, color: "oklch(0.75 0.16 180)" },
];

function Donut() {
  const total = courses.reduce((a, c) => a + c.val, 0);
  let acc = 0;
  const r = 38, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="size-36 -rotate-90">
      <circle cx="50" cy="50" r={r} stroke="var(--muted)" strokeWidth="14" fill="none" />
      {courses.map((co, i) => {
        const len = (co.val / total) * c;
        const dash = `${len} ${c - len}`;
        const offset = -((acc / total) * c);
        acc += co.val;
        return <circle key={i} cx="50" cy="50" r={r} stroke={co.color} strokeWidth="14" fill="none" strokeDasharray={dash} strokeDashoffset={offset} />;
      })}
    </svg>
  );
}

function Heatmap() {
  // 7 cols (days) x 5 rows (weeks)
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: 35 }).map((_, i) => {
        const v = (Math.sin(i * 1.3) + 1) / 2; // 0..1
        const op = 0.15 + v * 0.85;
        return <div key={i} className="aspect-square rounded-md" style={{ backgroundColor: `oklch(0.6 0.22 270 / ${op})` }} />;
      })}
    </div>
  );
}

function Analytics() {
  const max = Math.max(...weekly);
  return (
    <PhoneShell>
      <ScreenHeader title="Analytics" subtitle="Insights & trends" back="/dashboard" showBell showTheme />

      <div className="px-5 space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "GPA Impact", v: "+0.4" },
            { label: "Streak", v: "12d" },
            { label: "Rank", v: "#7" },
          ].map((m) => (
            <div key={m.label} className="glass-card rounded-2xl p-3 text-center">
              <p className="text-xl font-bold gradient-text">{m.v}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-3xl p-4">
          <h3 className="font-semibold">Weekly attendance</h3>
          <p className="text-xs text-muted-foreground">Mon — Sun</p>
          <div className="mt-4 flex items-end gap-2 h-32">
            {weekly.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-medium">{v}%</span>
                <div className="w-full rounded-2xl bg-gradient-to-t from-primary to-primary-glow shadow-soft" style={{ height: `${(v / max) * 100}%` }} />
                <span className="text-[10px] text-muted-foreground">{["M","T","W","T","F","S","S"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-4">
          <h3 className="font-semibold">By course</h3>
          <div className="mt-3 flex items-center gap-4">
            <Donut />
            <div className="flex-1 space-y-2">
              {courses.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="size-2.5 rounded-sm" style={{ background: c.color }} />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="font-semibold">{c.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Attendance heatmap</h3>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              less <span className="size-2 rounded-sm bg-primary/20" />
              <span className="size-2 rounded-sm bg-primary/50" />
              <span className="size-2 rounded-sm bg-primary" /> more
            </div>
          </div>
          <Heatmap />
        </div>
      </div>
    </PhoneShell>
  );
}
