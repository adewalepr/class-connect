import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  Users, 
  ArrowUpRight, 
  Activity, 
  Settings, 
  Download, 
  UserMinus, 
  UserPlus, 
  BookOpen, 
  ShieldCheck, 
  ArrowLeft,
  Search,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { getCollection, updateDocument } from "@/lib/database";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Attendify" }] }),
  component: AdminPanel,
});

function AdminPanel() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"students" | "lecturers">("students");

  useEffect(() => {
    async function loadData() {
      const s = await getCollection("students");
      const l = await getCollection("lecturers");
      const a = await getCollection("attendance");
      setStudents(s);
      setLecturers(l);
      setAttendance(a);
    }
    loadData();
  }, []);

  const toggleUserStatus = async (collection: "students" | "lecturers", userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    await updateDocument(collection, userId, { status: newStatus });
    
    // Live update state
    if (collection === "students") {
      setStudents(prev => prev.map(u => u.uid === userId ? { ...u, status: newStatus } : u));
    } else {
      setLecturers(prev => prev.map(u => u.uid === userId ? { ...u, status: newStatus } : u));
    }
  };

  const exportAttendanceCSV = () => {
    if (attendance.length === 0) return;
    
    // Build CSV contents
    const headers = ["Check-in ID", "Student Name", "Student ID", "Class Code", "Subject", "Time", "Date", "Status"];
    const rows = attendance.map(a => [
      a.id,
      a.studentName,
      a.studentId,
      a.classCode,
      a.className,
      a.time,
      a.date,
      a.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendify_Attendance_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => 
    `${s.surname} ${s.otherNames} ${s.matricNumber} ${s.studentEmail}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLecturers = lecturers.filter(l => 
    `${l.surname} ${l.otherNames} ${l.studentEmail}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PhoneShell hideNav>
      <ScreenHeader title="Admin Dashboard" subtitle="Control Center" back="/login" showBell={false} showTheme />

      <div className="px-5 pb-10">
        {/* Quick Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><Users className="size-4" /></span>
              <span className="text-[9px] font-semibold text-muted-foreground uppercase">active</span>
            </div>
            <p className="text-2xl font-bold mt-3">{students.length}</p>
            <p className="text-[11px] text-muted-foreground">Total Students</p>
          </div>
          
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="size-9 rounded-xl bg-success/15 text-success flex items-center justify-center"><ShieldCheck className="size-4" /></span>
              <span className="text-[9px] font-semibold text-muted-foreground uppercase">staff</span>
            </div>
            <p className="text-2xl font-bold mt-3">{lecturers.length}</p>
            <p className="text-[11px] text-muted-foreground">Total Lecturers</p>
          </div>
        </div>

        {/* CSV Export Action Card */}
        <div className="glass-card rounded-3xl p-5 mb-6 text-left relative overflow-hidden">
          <div className="absolute -top-10 -right-10 size-32 rounded-full bg-success/10 blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-success/15 text-success flex items-center justify-center shrink-0">
              <FileSpreadsheet className="size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">Attendance Logging Reports</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Export all university attendance logs as CSV.</p>
            </div>
            <button 
              onClick={exportAttendanceCSV}
              className="gradient-success size-10 rounded-xl flex items-center justify-center text-white shadow-glow shrink-0 hover:scale-105 transition"
            >
              <Download className="size-4" />
            </button>
          </div>
        </div>

        {/* Section Management Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Manage Directory</h3>
          <div className="flex p-0.5 rounded-xl bg-secondary border border-border">
            <button
              onClick={() => setActiveTab("students")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition ${
                activeTab === "students" ? "bg-background text-primary shadow-soft" : "text-muted-foreground"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab("lecturers")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition ${
                activeTab === "lecturers" ? "bg-background text-primary shadow-soft" : "text-muted-foreground"
              }`}
            >
              Lecturers
            </button>
          </div>
        </div>

        {/* Search filter */}
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary/70 border border-border">
          <Search className="size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none flex-1 text-xs"
          />
        </div>

        {/* Users list directory */}
        <div className="glass-card rounded-3xl divide-y divide-border overflow-hidden">
          {activeTab === "students" ? (
            filteredStudents.length > 0 ? (
              filteredStudents.map(s => (
                <div key={s.matricNumber} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                      {s.otherNames[0]}{s.surname[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.otherNames} {s.surname}</p>
                      <p className="text-[10px] text-muted-foreground">{s.matricNumber} · {s.course} · L{s.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                      s.status === "suspended" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
                    }`}>
                      {s.status === "suspended" ? "Suspended" : "Active"}
                    </span>
                    <button 
                      onClick={() => toggleUserStatus("students", s.uid || s.id, s.status)}
                      className={`size-8 rounded-lg flex items-center justify-center border transition ${
                        s.status === "suspended" 
                          ? "bg-success/10 border-success/30 text-success" 
                          : "bg-destructive/10 border-destructive/30 text-destructive"
                      }`}
                    >
                      {s.status === "suspended" ? <UserPlus className="size-3.5" /> : <UserMinus className="size-3.5" />}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-5 text-center text-xs text-muted-foreground">No students found.</p>
            )
          ) : (
            filteredLecturers.length > 0 ? (
              filteredLecturers.map(l => (
                <div key={l.uid} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                      {l.otherNames[0]}{l.surname[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Dr. {l.otherNames} {l.surname}</p>
                      <p className="text-[10px] text-muted-foreground">{l.studentEmail} · {l.course}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                      l.status === "suspended" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
                    }`}>
                      {l.status === "suspended" ? "Suspended" : "Active"}
                    </span>
                    <button 
                      onClick={() => toggleUserStatus("lecturers", l.uid || l.id, l.status)}
                      className={`size-8 rounded-lg flex items-center justify-center border transition ${
                        l.status === "suspended" 
                          ? "bg-success/10 border-success/30 text-success" 
                          : "bg-destructive/10 border-destructive/30 text-destructive"
                      }`}
                    >
                      {l.status === "suspended" ? <UserPlus className="size-3.5" /> : <UserMinus className="size-3.5" />}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-5 text-center text-xs text-muted-foreground">No lecturers found.</p>
            )
          )}
        </div>
      </div>
    </PhoneShell>
  );
}
