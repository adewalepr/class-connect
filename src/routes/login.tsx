import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, ArrowRight, GraduationCap, Eye, EyeOff, Info } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { login } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Attendify" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!identity || !password) {
      setError("Please enter your login username/email and password.");
      setLoading(false);
      return;
    }

    try {
      const session = await login(identity, password);
      
      // Role-based protected dashboard routing
      if (session.role === "admin") {
        navigate({ to: "/admin" });
      } else if (session.role === "lecturer") {
        navigate({ to: "/lecturer" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col bg-background text-foreground">
      <div className="absolute inset-0 gradient-hero opacity-95 dark:opacity-90" />
      <div className="absolute -top-20 -left-20 size-72 rounded-full bg-primary-glow/40 blur-3xl" />
      <div className="absolute top-40 -right-20 size-72 rounded-full bg-white/20 blur-3xl" />

      {/* Header */}
      <div className="relative flex justify-between items-center p-5 z-10">
        <div className="flex items-center gap-2 text-white">
          <div className="glass size-9 rounded-xl flex items-center justify-center">
            <GraduationCap className="size-5" />
          </div>
          <span className="font-semibold">Attendify</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="relative flex-1 flex flex-col justify-end px-5 pb-10 max-w-[440px] mx-auto w-full z-10">
        <div className="text-white mb-6 animate-fade-up">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-white/80 text-sm mt-1">Sign in to mark your attendance</p>
        </div>

        <form onSubmit={handleSignIn} className="glass-card rounded-3xl p-6 space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {error && (
            <div className="p-3.5 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground">Generated Username or Email</label>
            <div className="mt-1.5 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary/70 border border-border">
              <Mail className="size-4 text-muted-foreground" />
              <input 
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                className="bg-transparent outline-none flex-1 text-sm w-full text-foreground" 
                placeholder="e.g. ATTD-12345 or alex@university.edu" 
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <div className="mt-1.5 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary/70 border border-border">
              <Lock className="size-4 text-muted-foreground" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent outline-none flex-1 text-sm w-full text-foreground" 
                placeholder="••••••••" 
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-muted-foreground select-none">
              <input type="checkbox" className="accent-primary" defaultChecked /> Remember me
            </label>
            <Link to="/forgot" className="text-primary font-medium hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary shadow-glow text-primary-foreground rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold text-sm hover:opacity-95 transition disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign in"} 
            {!loading && <ArrowRight className="size-4" />}
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Quick Prefill options for testing */}
          <div className="grid grid-cols-3 gap-2">
            <button 
              type="button"
              onClick={() => { setIdentity("alex@university.edu"); setPassword("password"); }}
              className="glass rounded-xl py-2.5 text-[10px] font-medium hover:scale-[1.02] transition"
            >
              Student
            </button>
            <button 
              type="button"
              onClick={() => { setIdentity("ATTD-L01"); setPassword("password"); }}
              className="glass rounded-xl py-2.5 text-[10px] font-medium hover:scale-[1.02] transition"
            >
              Lecturer
            </button>
            <button 
              type="button"
              onClick={() => { setIdentity("admin@university.edu"); setPassword("password"); }}
              className="glass rounded-xl py-2.5 text-[10px] font-medium hover:scale-[1.02] transition"
            >
              Admin
            </button>
          </div>
        </form>

        <p className="text-center text-white/80 text-xs mt-5">
          New to Attendify? <Link to="/signup" className="font-semibold underline text-white hover:text-white/90">Create account</Link>
        </p>
        <p className="text-center mt-3">
          <button 
            type="button"
            onClick={() => { setIdentity("ATTD-L01"); setPassword("password"); }}
            className="text-white/70 text-[11px] underline"
          >
            Continue as lecturer
          </button>
        </p>
      </div>
    </div>
  );
}
