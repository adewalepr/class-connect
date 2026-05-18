import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { subscribeAuth, UserSession } from "@/lib/auth";
import { getCollection, subscribeCollection } from "@/lib/database";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — Attendify" }] }),
  component: History,
});

const days = Array.from({ length: 30 }, (_, i) => i + 1);

const dotCls = (s?: string) =>
  s === "present" ? "bg-success" : s === "absent" ? "bg-destructive" : s === "late" ? "bg-warning" : "";

function History() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserSession | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  useEffect(() => {
    // Auth Protection Guard
    const unsubAuth = subscribeAuth((currUser) => {
      if (!currUser) {
        navigate({ to: "/login" });
      } else if (currUser.role !== "student") {
        if (currUser.role === "admin") navigate({ to: "/admin" });
        if (currUser.role === "lecturer") navigate({ to: "/lecturer" });
      } else {
        setUser(currUser);
      }
    });

    // Subscribe to attendance logs
    const unsubAttendance = subscribeCollection("attendance", (list) => {
      if (user) {
        const studentLogs = list.filter(l => l.studentId === user.matricNumber);
        setAttendance(studentLogs);
      }
    });

    return () => {
      unsubAuth();
      unsubAttendance();
    };
  }, [navigate, user]);

  if (!user) return null;

  // Counts
  const presentCount = attendance.filter(a => a.status === "present").length;
  const lateCount = attendance.filter(a => a.status === "late").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;

  // Calendar Day Dot Mapping
  const calendarMap: Record<number, "present" | "absent" | "late"> = {};
  attendance.forEach(a => {
    if (a.date) {
      const day = parseInt(a.date.split("-")[2]);
      if (!isNaN(day) && day >= 1 && day <= 30) {
        calendarMap[day] = a.status || "present";
      }
    }
  });

  // Unique Courses for filters
  const uniqueCourses = ["All", ...Array.from(new Set(attendance.map(a => a.classCode || "CS301")))];

  // Filter records
  const filteredRecords = attendance.filter(r => {
    const matchesSearch = 
      (r.className || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.classCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.date || "").toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesFilter = selectedFilter === "All" || r.classCode === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <PhoneShell>
      <ScreenHeader title="Attendance" subtitle="May 2026" back="/dashboard" showTheme right={
        <button className="glass size-10 rounded-full flex items-center justify-center"><Filter className="size-4" /></button>
      } />

      <div className="px-5 pb-10">
        <div className="glass-card rounded-2xl flex items-center gap-2 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1" 
            placeholder="Search by course, code or date" 
          />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {uniqueCourses.map((c) => (
            <button 
              key={c} 
              onClick={() => setSelectedFilter(c)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                selectedFilter === c 
                  ? "gradient-primary text-primary-foreground border-transparent shadow-glow" 
                  : "bg-card/50 border-border text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: "Present", value: presentCount || "0", cls: "text-success", bg: "bg-success/10" },
            { label: "Late", value: lateCount || "0", cls: "text-warning-foreground", bg: "bg-warning/15" },
            { label: "Absent", value: absentCount || "0", cls: "text-destructive", bg: "bg-destructive/10" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-3 ${s.bg}`}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.cls}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Dynamic calendar panel */}
        <div className="mt-5 glass-card rounded-3xl p-4 animate-fade-up">
          <div className="grid grid-cols-7 text-[10px] text-muted-foreground mb-2 text-center font-semibold">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => <div key={`p${i}`} />)}
            {days.map((d) => (
              <div key={d} className="aspect-square rounded-xl bg-secondary/60 flex flex-col items-center justify-center relative">
                <span className="text-[11px] font-semibold">{d}</span>
                {calendarMap[d] && <span className={`absolute bottom-1.5 size-1.5 rounded-full ${dotCls(calendarMap[d])}`} />}
              </div>
            ))}
          </div>
        </div>

        <h3 className="mt-6 mb-3 font-semibold">Recent records</h3>
        <div className="space-y-2.5">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((r, i) => (
              <div key={r.id || i} className="glass-card rounded-2xl p-3.5 flex items-center justify-between gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm truncate text-foreground">{r.className || "Algorithms"}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{r.classCode || "CS301"} · {r.date} · {r.time}</p>
                </div>
                <StatusBadge status={r.status || "present"} />
              </div>
            ))
          ) : (
            <p className="p-6 text-center text-xs text-muted-foreground">No recent attendance records found.</p>
          )}
        </div>
      </div>
    </PhoneShell>
  );
}
