import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight, GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Attendify" }] }),
  component: Login,
});

function Login() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 gradient-hero opacity-90" />
      <div className="absolute -top-20 -left-20 size-72 rounded-full bg-primary-glow/40 blur-3xl" />
      <div className="absolute top-40 -right-20 size-72 rounded-full bg-white/20 blur-3xl" />

      <div className="relative flex justify-between items-center p-5">
        <div className="flex items-center gap-2 text-white">
          <div className="glass size-9 rounded-xl flex items-center justify-center">
            <GraduationCap className="size-5" />
          </div>
          <span className="font-semibold">Attendify</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="relative flex-1 flex flex-col justify-end px-5 pb-10">
        <div className="text-white mb-6 animate-fade-up">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-white/80 text-sm mt-1">Sign in to mark your attendance</p>
        </div>

        <div className="glass-card rounded-3xl p-6 space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Student ID / Email</label>
            <div className="mt-1.5 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary/70 border border-border">
              <Mail className="size-4 text-muted-foreground" />
              <input className="bg-transparent outline-none flex-1 text-sm" placeholder="alex@university.edu" defaultValue="alex@university.edu" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <div className="mt-1.5 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary/70 border border-border">
              <Lock className="size-4 text-muted-foreground" />
              <input type="password" className="bg-transparent outline-none flex-1 text-sm" placeholder="••••••••" defaultValue="password" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="accent-primary" defaultChecked /> Remember me
            </label>
            <button className="text-primary font-medium">Forgot password?</button>
          </div>

          <Link
            to="/dashboard"
            className="gradient-primary shadow-glow text-primary-foreground rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold text-sm hover:opacity-95 transition"
          >
            Sign in <ArrowRight className="size-4" />
          </Link>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["Google", "Apple", "SSO"].map((p) => (
              <button key={p} className="glass rounded-xl py-2.5 text-xs font-medium hover:scale-[1.02] transition">
                {p}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-white/80 text-xs mt-5">
          New to Attendify? <Link to="/login" className="font-semibold underline">Create account</Link>
        </p>
        <p className="text-center mt-3">
          <Link to="/lecturer" className="text-white/70 text-[11px] underline">Continue as lecturer</Link>
        </p>
      </div>
    </div>
  );
}
