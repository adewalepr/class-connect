import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Attendify — Smart Class Attendance" },
      { name: "description", content: "Modern QR-based attendance for students and lecturers." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/login" }), 2200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 size-64 rounded-full bg-white/20 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 size-72 rounded-full bg-white/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>
      <div className="relative flex flex-col items-center gap-6 animate-fade-up">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-white/30 blur-2xl animate-pulse-glow" />
          <div className="relative glass size-24 rounded-3xl flex items-center justify-center shadow-elegant">
            <GraduationCap className="size-12 text-white" strokeWidth={2.2} />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white tracking-tight">Attendify</h1>
          <p className="text-white/80 mt-2 text-sm tracking-wide">Smart attendance, simplified.</p>
        </div>
        <div className="mt-8 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-white/80 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <Link to="/login" className="text-white/70 text-xs underline-offset-4 hover:underline mt-4">Skip</Link>
      </div>
    </div>
  );
}
