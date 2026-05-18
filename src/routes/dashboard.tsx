import { createFileRoute, Link } from "@tanstack/react-router";
import { QrCode, Users, CalendarCheck, Bell, TrendingUp, Clock, MapPin, ChevronRight } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Attendify" }] }),
  component: Dashboard,
});

const upcoming = [
  { course: "Algorithms", code: "CS301", time: "10:00 AM", room: "Hall B-204", color: "from-indigo-500 to-blue-500" },
  { course: "Linear Algebra", code: "MATH210", time: "1:30 PM", room: "Block C-110", color: "from-violet-500 to-fuchsia-500" },
  { course: "Database Systems", code: "CS320", time: "3:45 PM", room: "Lab D-3", color: "from-sky-500 to-cyan-500" },
];

const sparkData = [62, 70, 68, 80, 76, 88, 92, 86, 94];

function Sparkline() {
  const w = 280, h = 80, max = 100;
  const step = w / (sparkData.length - 1);
  const pts = sparkData.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#g1)" />
      <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {sparkData.map((v, i) => (
        <circle key={i} cx={i * step} cy={h - (v / max) * h} r={i === sparkData.length - 1 ? 4 : 0} fill="var(--primary)" />
      ))}
    </svg>
  );
}

function RingProgress({ value }: { value: number }) {
  const r = 38, c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg viewBox="0 0 100 100" className="size-24 -rotate-90">
      <circle cx="50" cy="50" r={r} stroke="currentColor" strokeWidth="9" className="text-white/20" fill="none" />
      <circle cx="50" cy="50" r={r} stroke="white" strokeWidth="9" fill="none" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset} />
    </svg>
  );
}

function Dashboard() {
  const quick = [
    { to: "/scan", label: "Scan QR", icon: QrCode, accent: "bg-primary/15 text-primary" },
    { to: "/dashboard", label: "Join Class", icon: Users, accent: "bg-success/15 text-success" },
    { to: "/history", label: "Attendance", icon: CalendarCheck, accent: "bg-warning/20 text-warning-foreground" },
    { to: "/notifications", label: "Alerts", icon: Bell, accent: "bg-accent text-accent-foreground" },
  ] as const;

  return (
    <PhoneShell>
      <header className="px-5 pt-7 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-11 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold shadow-glow">A</div>
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-success border-2 border-background" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Good morning</p>
            <h1 className="text-base font-semibold">Alex Carter</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/notifications" className="glass size-10 rounded-full flex items-center justify-center relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <section className="px-5 animate-fade-up">
        <div className="relative gradient-hero rounded-3xl p-5 text-white shadow-elegant overflow-hidden">
          <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">Overall attendance</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-bold">86%</span>
                <span className="inline-flex items-center text-[11px] gap-1 px-2 py-0.5 rounded-full bg-white/20"><TrendingUp className="size-3" /> +4.2%</span>
              </div>
              <p className="text-xs text-white/70 mt-1">12 classes attended this week</p>
            </div>
            <div className="relative flex items-center justify-center">
              <RingProgress value={86} />
              <span className="absolute text-sm font-semibold">86%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 mt-5 grid grid-cols-4 gap-2 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        {quick.map((q) => (
          <Link key={q.label} to={q.to} className="glass-card rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-[1.03] transition">
            <span className={`size-10 rounded-xl flex items-center justify-center ${q.accent}`}>
              <q.icon className="size-4" />
            </span>
            <span className="text-[10px] font-medium text-center leading-tight">{q.label}</span>
          </Link>
        ))}
      </section>

      <section className="px-5 mt-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Weekly trend</h2>
          <Link to="/analytics" className="text-xs text-primary font-medium">View all</Link>
        </div>
        <div className="glass-card rounded-3xl p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">94%</span>
            <span className="text-xs text-success">▲ 8.4% vs last week</span>
          </div>
          <Sparkline />
        </div>
      </section>

      <section className="px-5 mt-6 animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Today's schedule</h2>
          <span className="text-xs text-muted-foreground">3 classes</span>
        </div>
        <div className="space-y-2.5">
          {upcoming.map((c, i) => (
            <Link to="/class" key={c.code} className="glass-card rounded-2xl p-3.5 flex items-center gap-3 hover:translate-x-1 transition" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`shrink-0 w-1.5 h-12 rounded-full bg-gradient-to-b ${c.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm truncate">{c.course}</h3>
                  <span className="text-[10px] text-muted-foreground">{c.code}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="size-3" /> {c.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="size-3" /> {c.room}</span>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
    </PhoneShell>
  );
}
