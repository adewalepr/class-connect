import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ScanLine, Check, Image as ImgIcon, Zap, ZapOff, Keyboard, AlertCircle } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { subscribeAuth, UserSession } from "@/lib/auth";
import { 
  getCollection, 
  addDocument, 
  subscribeCollection, 
  updateDocument 
} from "@/lib/database";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "Scan QR — Attendify" }] }),
  component: Scan,
});

function Scan() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserSession | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedClass, setScannedClass] = useState<any | null>(null);
  const [checkedInTime, setCheckedInTime] = useState("");

  // Auth Protection Guard
  useEffect(() => {
    return subscribeAuth((currUser) => {
      if (!currUser) {
        navigate({ to: "/login" });
      } else if (currUser.role !== "student") {
        if (currUser.role === "admin") navigate({ to: "/admin" });
        if (currUser.role === "lecturer") navigate({ to: "/lecturer" });
      } else {
        setUser(currUser);
      }
    });
  }, [navigate]);

  // Simulate auto-scan behavior if an active session exists in DB
  useEffect(() => {
    if (scanned || showManualInput) return;

    const scanTimer = setTimeout(async () => {
      if (!user) return;
      
      const classesList = await getCollection("classes");
      const activeClass = classesList.find(c => c.status === "active");
      
      if (activeClass) {
        // Expiration check
        if (new Date(activeClass.expiresAt).getTime() < Date.now()) {
          setErrorMessage("The class QR code has expired.");
          return;
        }

        await processCheckIn(activeClass);
      } else {
        setErrorMessage("No active attendance sessions detected nearby.");
      }
    }, 2800);

    return () => clearTimeout(scanTimer);
  }, [user, scanned, showManualInput]);

  const processCheckIn = async (targetClass: any) => {
    if (!user) return;

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const attendanceLogs = await getCollection("attendance");
      
      // Duplicate protection check
      const alreadyCheckedIn = attendanceLogs.find(
        log => log.studentId === user.matricNumber && 
               log.classCode === targetClass.code && 
               log.date === todayStr
      );

      if (alreadyCheckedIn) {
        setErrorMessage("You have already checked in to this class today.");
        return;
      }

      // Check-in details
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCheckedInTime(timeNow);
      setScannedClass(targetClass);

      const checkInRecord = {
        studentId: user.matricNumber || "S-GUEST",
        studentName: `${user.otherNames} ${user.surname}`,
        classCode: targetClass.code,
        className: targetClass.name,
        time: timeNow,
        date: todayStr,
        status: "present" // Could calculate late based on start time
      };

      await addDocument("attendance", checkInRecord);

      // Trigger analytics updates in DB
      const analyticsList = await getCollection("analytics");
      if (analyticsList && analyticsList[0]) {
        const stats = analyticsList[0];
        const newTotal = stats.totalClasses + 1;
        const newPresent = stats.presentClasses + 1;
        await updateDocument("analytics", stats.id, {
          totalClasses: newTotal,
          presentClasses: newPresent,
          averageRate: Math.round((newPresent / newTotal) * 100)
        });
      }

      // Add dynamic user notification
      await addDocument("notifications", {
        title: "Attendance Registered",
        message: `Successfully logged check-in for ${targetClass.name}.`,
        time: "Just now",
        read: false,
        createdAt: new Date().toISOString()
      });

      setErrorMessage(null);
      setScanned(true);
    } catch (e: any) {
      setErrorMessage("Could not submit check-in: " + e.message);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!manualCode.trim()) return;

    const classesList = await getCollection("classes");
    const matchedClass = classesList.find(
      c => c.status === "active" && 
           c.qrCode?.toUpperCase() === manualCode.toUpperCase().trim()
    );

    if (!matchedClass) {
      setErrorMessage("Invalid check-in code or session has expired.");
      return;
    }

    if (new Date(matchedClass.expiresAt).getTime() < Date.now()) {
      setErrorMessage("This session code has expired.");
      return;
    }

    await processCheckIn(matchedClass);
  };

  return (
    <PhoneShell>
      <ScreenHeader title="Scan to attend" subtitle="Point camera at the lecturer's QR" back="/dashboard" showTheme />

      <div className="px-5">
        <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-elegant border border-border bg-[oklch(0.12_0.04_265)]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary-glow/20" />
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />

          {errorMessage && (
            <div className="absolute inset-x-5 top-5 z-20 p-3.5 rounded-2xl bg-destructive/90 text-white backdrop-blur text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-soft">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!scanned ? (
            <>
              {/* Frame corners */}
              {[
                "top-6 left-6 border-t-4 border-l-4 rounded-tl-3xl",
                "top-6 right-6 border-t-4 border-r-4 rounded-tr-3xl",
                "bottom-6 left-6 border-b-4 border-l-4 rounded-bl-3xl",
                "bottom-6 right-6 border-b-4 border-r-4 rounded-br-3xl",
              ].map((c, i) => (
                <span key={i} className={`absolute size-16 border-white ${c}`} />
              ))}

              {/* Scan line */}
              <div className="absolute inset-x-10 top-6 bottom-6 overflow-hidden rounded-2xl">
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_20px_rgba(255,255,255,0.9)] animate-scan" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                {showManualInput ? (
                  <form onSubmit={handleManualSubmit} className="p-5 max-w-[260px] w-full text-center glass rounded-2xl border border-white/20 animate-scale-up">
                    <p className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Enter Class Code</p>
                    <input 
                      type="text" 
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="w-full bg-white/10 text-white rounded-xl py-2 px-3 text-center font-mono font-bold uppercase border border-white/20 outline-none text-sm focus:border-primary/70 transition"
                      placeholder="e.g. CS301-4921"
                      required
                    />
                    <button 
                      type="submit"
                      className="w-full gradient-primary text-white py-2 rounded-xl text-xs font-semibold mt-3 shadow-glow"
                    >
                      Submit Code
                    </button>
                  </form>
                ) : (
                  <ScanLine className="size-24 text-white/30" strokeWidth={1} />
                )}
              </div>

              <div className="absolute bottom-5 inset-x-5 text-center pointer-events-none">
                <p className="text-white/90 text-xs font-medium">
                  {showManualInput ? "Enter the lecturer's generated passcode" : "Align the QR within the frame"}
                </p>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-success/20 backdrop-blur-sm animate-fade-up">
              <div className="size-24 rounded-full bg-success flex items-center justify-center shadow-glow animate-pulse-glow">
                <Check className="size-12 text-success-foreground" strokeWidth={3} />
              </div>
              <div className="text-center text-white p-4">
                <h3 className="text-2xl font-bold">Attendance marked</h3>
                <p className="text-white/80 text-sm mt-1">{scannedClass?.name || "Lecture Class"}</p>
                <p className="text-white/70 text-xs mt-0.5">{checkedInTime} · Present</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-around glass-card rounded-2xl p-3">
          <button onClick={() => setFlash(!flash)} className="flex flex-col items-center gap-1 text-xs">
            <span className="glass size-11 rounded-full flex items-center justify-center">
              {flash ? <Zap className="size-4 text-warning-foreground" /> : <ZapOff className="size-4" />}
            </span>
            Flash
          </button>
          <button onClick={() => setShowManualInput(!showManualInput)} className="flex flex-col items-center gap-1 text-xs">
            <span className={`size-11 rounded-full flex items-center justify-center transition ${
              showManualInput ? "gradient-primary text-white shadow-glow" : "glass"
            }`}>
              <Keyboard className="size-4" />
            </span>
            Code Input
          </button>
          <button 
            onClick={() => {
              setScanned(false);
              setErrorMessage(null);
              setShowManualInput(false);
              setManualCode("");
            }} 
            className="flex flex-col items-center gap-1 text-xs"
          >
            <span className="gradient-primary text-primary-foreground size-11 rounded-full flex items-center justify-center shadow-glow">
              <ScanLine className="size-4" />
            </span>
            Rescan
          </button>
        </div>

        {scanned && scannedClass && (
          <div className="mt-4 block glass-card rounded-2xl p-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Class details</p>
                <h3 className="font-semibold mt-0.5">{scannedClass.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{scannedClass.lecturerName} · Hall B-204</p>
              </div>
              <Link to="/dashboard" className="text-xs text-primary font-semibold">Done</Link>
            </div>
          </div>
        )}
      </div>
    </PhoneShell>
  );
}
