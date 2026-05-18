import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Users, Megaphone, TrendingUp } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/class")({
  head: () => ({ meta: [{ title: "Class — Attendify" }] }),
  component: ClassDetails,
});

const bars = [78, 82, 75, 90, 88, 92, 86, 94, 89, 95];

function BarChart() {
  return (
    <div className="flex items-end gap-2 h-28">
      {bars.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary-glow" style={{ height: `${v}%` }} />
          <span className="text-[9px] text-muted-foreground">W{i + 1}</span>
        </div>
      ))}
    </div>
  );
}

function ClassDetails() {
  const students = ["AC", "MR", "JS", "TL", "KP", "OB", "NV", "RS"];
  return (
    <PhoneShell>
      <ScreenHeader title="CS301" subtitle="Algorithms & Complexity" back="/dashboard" showTheme />

      <div className="px-5">
        <div className="relative gradient-hero rounded-3xl p-5 text-white shadow-elegant overflow-hidden">
          <div className="absolute -top-12 -right-12 size-40 rounded-full bg-white/10 blur-2xl" />
          <p className="text-xs uppercase tracking-widest text-white/70">Lecturer</p>
          <h2 className="text-xl font-bold mt-1">Dr. Mei Lin</h2>
          <p className="text-xs text-white/80">Computer Science Dept.</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-white/70 uppercase">Schedule</p>
              <p className="text-sm font-semibold flex items-center gap-1 mt-0.5"><Clock className="size-3.5" /> Mon · 10AM</p>
            </div>
            <div>
              <p className="text-[10px] text-white/70 uppercase">Room</p>
              <p className="text-sm font-semibold flex items-center gap-1 mt-0.5"><MapPin className="size-3.5" /> B-204</p>
            </div>
            <div>
              <p className="text-[10px] text-white/70 uppercase">Students</p>
              <p className="text-sm font-semibold flex items-center gap-1 mt-0.5"><Users className="size-3.5" /> 48</p>
            </div>
          </div>
        </div>

        <div className="mt-5 glass-card rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Attendance trend</h3>
              <p className="text-xs text-muted-foreground">Last 10 weeks</p>
            </div>
            <span className="inline-flex items-center text-xs gap-1 px-2 py-0.5 rounded-full bg-success/15 text-success font-medium"><TrendingUp className="size-3" /> +12%</span>
          </div>
          <div className="mt-4">
            <BarChart />
          </div>
        </div>

        <div className="mt-5 glass-card rounded-3xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Present today</h3>
            <span className="text-xs text-muted-foreground">42 / 48</span>
          </div>
          <div className="flex -space-x-2">
            {students.map((s, i) => (
              <div key={i} className="size-9 rounded-full border-2 border-background gradient-primary text-primary-foreground flex items-center justify-center text-[11px] font-semibold">
                {s}
              </div>
            ))}
            <div className="size-9 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[11px] font-medium">+34</div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full gradient-primary" style={{ width: "87%" }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">87% attendance rate</p>
        </div>

        <div className="mt-5 glass-card rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="size-4 text-primary" />
            <h3 className="font-semibold">Announcements</h3>
          </div>
          <div className="space-y-3">
            {[
              { t: "Midterm next week", d: "Chapters 1–6, bring calculator." },
              { t: "Office hours moved", d: "Thursdays 2–4 PM in office C-302." },
            ].map((a) => (
              <div key={a.t} className="border-l-2 border-primary pl-3">
                <p className="text-sm font-medium">{a.t}</p>
                <p className="text-xs text-muted-foreground">{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
