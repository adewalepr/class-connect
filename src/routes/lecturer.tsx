import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Users, QrCode, Activity, Plus, ArrowUpRight, GraduationCap, LogOut, Trash2 } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PhoneShell } from "@/components/PhoneShell";
import { subscribeAuth, logout, UserSession } from "@/lib/auth";
import { 
  getCollection, 
  addDocument, 
  setDocument, 
  updateDocument, 
  subscribeCollection 
} from "@/lib/database";

export const Route = createFileRoute("/lecturer")({
  head: () => ({ meta: [{ title: "Lecturer — Attendify" }] }),
  component: Lecturer,
});

function Lecturer() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserSession | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [liveCheckins, setLiveCheckins] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00");

  // Auth Redirection Guard
  useEffect(() => {
    return subscribeAuth((currUser) => {
      if (!currUser) {
        navigate({ to: "/login" });
      } else if (currUser.role !== "lecturer") {
        if (currUser.role === "admin") navigate({ to: "/admin" });
        if (currUser.role === "student") navigate({ to: "/dashboard" });
      } else {
        setUser(currUser);
      }
    });
  }, [navigate]);

  // Sync real-time check-ins from database
  useEffect(() => {
    if (!user) return;

    // Load active session from database
    async function loadActiveSession() {
      const classes = await getCollection("classes");
      const active = classes.find(c => c.status === "active");
      if (active) {
        // Double check if expired already
        if (new Date(active.expiresAt).getTime() < Date.now()) {
          await updateDocument("classes", active.id, { status: "ended" });
        } else {
          setActiveSession(active);
        }
      }
    }
    loadActiveSession();

    // Subscribe to live attendance updates
    const unsubAttendance = subscribeCollection("attendance", (records) => {
      // Load student names
      getCollection("students").then(studentsList => {
        setStudents(studentsList);
        
        // Filter attendance records for today
        const todayStr = new Date().toISOString().split("T")[0];
        const todayRecords = records.filter(r => r.date === todayStr);
        
        const mapped = todayRecords.map(r => {
          const match = studentsList.find(s => s.matricNumber === r.studentId);
          return {
            name: match ? `${match.otherNames} ${match.surname}` : r.studentName,
            id: r.studentId,
            time: r.time,
            status: r.status || "present"
          };
        });
        setLiveCheckins(mapped);
      });
    });

    return () => {
      unsubAttendance();
    };
  }, [user]);

  // Session Ticker Countdown Timer
  useEffect(() => {
    if (!activeSession) return;

    const timer = setInterval(async () => {
      const remainingMs = new Date(activeSession.expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        clearInterval(timer);
        setTimeRemaining("00:00");
        setActiveSession(null);
        await updateDocument("classes", activeSession.id, { status: "ended" });
        
        // Push notification that session ended
        await addDocument("notifications", {
          title: "Attendance Session Closed",
          message: `The dynamic check-in code for ${activeSession.code} has expired.`,
          time: "Just now",
          read: false,
          createdAt: new Date().toISOString()
        });
      } else {
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeRemaining(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  const handleGenerateSession = async () => {
    if (activeSession) return; // Prevent double session

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = "CS301-" + randomSuffix;
    const expiresAt = new Date(Date.now() + 300000).toISOString(); // 5 minutes

    const newClassDoc = {
      code: "CS301",
      name: "CS301 · Algorithms",
      lecturerId: user?.uid || "lecturer-mei",
      lecturerName: `Dr. ${user?.otherNames} ${user?.surname}`,
      qrCode: code,
      expiresAt,
      status: "active",
      createdAt: new Date().toISOString()
    };

    const newId = await addDocument("classes", newClassDoc);
    
    // Add dynamic notification
    await addDocument("notifications", {
      title: "Algorithms Code Active",
      message: `Use code ${code} to mark Algorithms attendance immediately.`,
      time: "Just now",
      read: false,
      createdAt: new Date().toISOString()
    });

    setActiveSession({ id: newId, ...newClassDoc });
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    await updateDocument("classes", activeSession.id, { status: "ended" });
    setActiveSession(null);
  };

  const handleLogout = () => {
    logout().then(() => navigate({ to: "/login" }));
  };

  if (!user) return null;

  // Stats calculations
  const totalStudents = students.length || 238;
  const presentCount = liveCheckins.filter(c => c.status === "present" || c.status === "late").length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 88;

  return (
    <PhoneShell hideNav>
      <header className="px-5 pt-7 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Lecturer Profile</p>
          <h1 className="text-base font-semibold">Dr. {user.otherNames} {user.surname}</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleLogout}
            className="glass size-10 rounded-full flex items-center justify-center text-destructive hover:scale-105 transition"
            title="Log Out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <div className="px-5 pb-10">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><Users className="size-4" /></span>
              <ArrowUpRight className="size-3.5 text-success" />
            </div>
            <p className="text-2xl font-bold mt-3">{totalStudents}</p>
            <p className="text-[11px] text-muted-foreground">Total enrolled students</p>
          </div>
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="size-9 rounded-xl bg-success/15 text-success flex items-center justify-center"><Activity className="size-4" /></span>
              <span className="text-[10px] font-medium text-success">Live</span>
            </div>
            <p className="text-2xl font-bold mt-3">{presentCount}<span className="text-sm text-muted-foreground">/{totalStudents}</span></p>
            <p className="text-[11px] text-muted-foreground">Checked in today</p>
          </div>
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="size-9 rounded-xl bg-warning/20 text-warning-foreground flex items-center justify-center"><GraduationCap className="size-4" /></span>
              <span className="text-[10px] text-muted-foreground">avg</span>
            </div>
            <p className="text-2xl font-bold mt-3">{attendanceRate}%</p>
            <p className="text-[11px] text-muted-foreground">Session attendance rate</p>
          </div>
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="size-9 rounded-xl bg-accent text-accent-foreground flex items-center justify-center"><QrCode className="size-4" /></span>
              <span className="text-[10px] text-muted-foreground">today</span>
            </div>
            <p className="text-2xl font-bold mt-3">{activeSession ? 1 : 0}</p>
            <p className="text-[11px] text-muted-foreground">Active sessions held</p>
          </div>
        </div>

        {/* Dynamic active session box */}
        {activeSession ? (
          <div className="mt-5 gradient-hero rounded-3xl p-5 text-white shadow-elegant relative overflow-hidden animate-fade-up">
            <div className="absolute -top-10 -right-10 size-44 rounded-full bg-white/15 blur-2xl pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="size-24 rounded-2xl bg-white p-2.5 grid grid-cols-7 grid-rows-7 gap-[3px] shadow-soft">
                {Array.from({ length: 49 }).map((_, i) => {
                  const filled = [0,1,2,3,4,5,6,7,12,13,14,15,16,17,18,19,21,22,24,26,28,30,32,34,35,36,38,40,42,43,44,45,46,47,48].includes(i);
                  return <span key={i} className={`rounded-[1.5px] ${filled ? "bg-black" : "bg-transparent"}`} />;
                })}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">Active Session QR</p>
                <h3 className="font-semibold mt-0.5 truncate text-lg">{activeSession.name}</h3>
                <p className="text-xs text-white/80 mt-1 font-mono bg-white/10 px-2 py-0.5 rounded-md inline-block">Code: {activeSession.qrCode}</p>
                <p className="text-xs text-white/90 mt-1.5 font-medium">Code expires in {timeRemaining}</p>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={handleEndSession}
                    className="text-[11px] bg-white text-primary font-semibold px-4 py-1.5 rounded-full shadow-soft hover:scale-105 transition"
                  >
                    End Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleGenerateSession}
            className="mt-5 w-full gradient-primary text-primary-foreground rounded-2xl py-4 font-semibold text-sm flex items-center justify-center gap-2 shadow-glow hover:opacity-95 transition"
          >
            <Plus className="size-4" /> Generate new session
          </button>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Real-time check-ins</h3>
            <span className="flex items-center gap-1.5 text-[11px] text-success font-medium">
              <span className="size-2 rounded-full bg-success animate-pulse" /> Live updates
            </span>
          </div>
          
          <div className="glass-card rounded-3xl divide-y divide-border overflow-hidden">
            {liveCheckins.length > 0 ? (
              liveCheckins.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 animate-fade-up">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[11px] font-semibold shrink-0">
                      {s.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground">{s.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      s.status === "present" ? "text-success" : s.status === "late" ? "text-warning-foreground" : "text-destructive"
                    }`}>{s.status}</span>
                    <p className="text-[10px] text-muted-foreground">{s.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-xs text-muted-foreground">No students checked in yet today.</p>
            )}
          </div>
        </div>

        <Link to="/analytics" className="mt-6 block text-center text-xs text-primary font-semibold">
          View full analytics →
        </Link>
      </div>
    </PhoneShell>
  );
}
