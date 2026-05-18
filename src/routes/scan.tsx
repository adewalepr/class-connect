import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ScanLine, Check, Image as ImgIcon, Zap, ZapOff } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "Scan QR — Attendify" }] }),
  component: Scan,
});

function Scan() {
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setScanned(true), 3200);
    return () => clearTimeout(t);
  }, []);

  return (
    <PhoneShell>
      <ScreenHeader title="Scan to attend" subtitle="Point camera at the lecturer's QR" back="/dashboard" showTheme />

      <div className="px-5">
        <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-elegant border border-border bg-[oklch(0.12_0.04_265)]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary-glow/20" />
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />

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
                <ScanLine className="size-24 text-white/30" strokeWidth={1} />
              </div>

              <div className="absolute bottom-5 inset-x-5 text-center">
                <p className="text-white/90 text-sm font-medium">Align the QR within the frame</p>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-success/20 backdrop-blur-sm animate-fade-up">
              <div className="size-24 rounded-full bg-success flex items-center justify-center shadow-glow animate-pulse-glow">
                <Check className="size-12 text-success-foreground" strokeWidth={3} />
              </div>
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold">Attendance marked</h3>
                <p className="text-white/80 text-sm">CS301 · Algorithms · 10:02 AM</p>
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
          <button className="flex flex-col items-center gap-1 text-xs">
            <span className="glass size-11 rounded-full flex items-center justify-center"><ImgIcon className="size-4" /></span>
            Gallery
          </button>
          <button onClick={() => setScanned(false)} className="flex flex-col items-center gap-1 text-xs">
            <span className="gradient-primary text-primary-foreground size-11 rounded-full flex items-center justify-center shadow-glow"><ScanLine className="size-4" /></span>
            Rescan
          </button>
        </div>

        {scanned && (
          <Link to="/class" className="mt-4 block glass-card rounded-2xl p-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Class details</p>
                <h3 className="font-semibold mt-0.5">CS301 · Algorithms</h3>
                <p className="text-xs text-muted-foreground mt-1">Dr. Lin · Hall B-204</p>
              </div>
              <span className="text-xs text-primary font-medium">View →</span>
            </div>
          </Link>
        )}
      </div>
    </PhoneShell>
  );
}
