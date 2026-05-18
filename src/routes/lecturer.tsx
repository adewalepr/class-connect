import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, QrCode, Activity, Plus, ArrowUpRight, GraduationCap } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/lecturer")({
  head: () => ({ meta: [{ title: "Lecturer — Attendify" }] }),
  component: Lecturer,
});

const live = [
  { name: "Alex Carter", id: "S2031", time: "10:01", status: "present" },
  { name: "Maya Reed", id: "S2044", time: "10:01", status: "present" },
  { name: "Tom Liu", id: "S2018", time: "10:03", status: "late" },
  { name: "Olivia B.", id: "S2052", time: "—", status: "absent" },
  { name: "Noah Vega", id: "S2061", time: "10:02", status: "present" },
];

function Lecturer() {
  return (
    <PhoneShell hideNav>
      <ScreenHeader title="Dr. Mei Lin" subtitle="Lecturer dashboard" back="/login" showBell showTheme />

      <div className="px-5 pb-10">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><Users className="size-4" /></span>
              <ArrowUpRight className="size-3.5 text-success" />
            </div>
            <p className="text-2xl font-bold mt-3">238</p>
            <p className="text-[11px] text-muted-foreground">Total students</p>
          </div>
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="size-9 rounded-xl bg-success/15 text-success flex items-center justify-center"><Activity className="size-4" /></span>
              <span className="text-[10px] font-medium text-success">Live</span>
            </div>
            <p className="text-2xl font-bold mt-3">42<span className="text-sm text-muted-foreground">/48</span></p>
            <p className="text-[11px] text-muted-foreground">Present now</p>
          </div>
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="size-9 rounded-xl bg-warning/20 text-warning-foreground flex items-center justify-center"><GraduationCap className="size-4" /></span>
              <span className="text-[10px] text-muted-foreground">avg</span>
            </div>
            <p className="text-2xl font-bold mt-3">88%</p>
            <p className="text-[11px] text-muted-foreground">Attendance rate</p>
          </div>
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="size-9 rounded-xl bg-accent text-accent-foreground flex items-center justify-center"><QrCode className="size-4" /></span>
              <span className="text-[10px] text-muted-foreground">today</span>
            </div>
            <p className="text-2xl font-bold mt-3">3</p>
            <p className="text-[11px] text-muted-foreground">Sessions held</p>
          </div>
        </div>

        <div className="mt-5 gradient-hero rounded-3xl p-5 text-white shadow-elegant relative overflow-hidden">
          <div className="absolute -top-10 -right-10 size-44 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="size-24 rounded-2xl bg-white p-2.5 grid grid-cols-7 grid-rows-7 gap-[3px]">
              {Array.from({ length: 49 }).map((_, i) => {
                const filled = [0,1,2,3,4,5,6,7,12,13,14,15,16,17,18,19,21,22,24,26,28,30,32,34,35,36,38,40,42,43,44,45,46,47,48].includes(i);
                return <span key={i} className={`rounded-[1px] ${filled ? "bg-foreground" : "bg-transparent"}`} />;
              })}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-white/70">Active session</p>
              <h3 className="font-semibold mt-0.5 truncate">CS301 · Algorithms</h3>
              <p className="text-xs text-white/80 mt-1">Code expires in 04:23</p>
              <div className="flex gap-2 mt-3">
                <button className="text-[11px] bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">Share</button>
                <button className="text-[11px] bg-white text-primary font-semibold px-3 py-1.5 rounded-full">End</button>
              </div>
            </div>
          </div>
        </div>

        <button className="mt-5 w-full gradient-primary text-primary-foreground rounded-2xl py-4 font-semibold text-sm flex items-center justify-center gap-2 shadow-glow hover:opacity-95 transition">
          <Plus className="size-4" /> Generate new session
        </button>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Real-time check-ins</h3>
            <span className="flex items-center gap-1.5 text-[11px] text-success"><span className="size-2 rounded-full bg-success animate-pulse" /> Live</span>
          </div>
          <div className="glass-card rounded-3xl divide-y divide-border overflow-hidden">
            {live.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[11px] font-semibold shrink-0">
                    {s.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                    s.status === "present" ? "text-success" : s.status === "late" ? "text-warning-foreground" : "text-destructive"
                  }`}>{s.status}</span>
                  <p className="text-[10px] text-muted-foreground">{s.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link to="/analytics" className="mt-5 block text-center text-xs text-primary font-medium">
          View full analytics →
        </Link>
      </div>
    </PhoneShell>
  );
}
