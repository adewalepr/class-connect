import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { 
  GraduationCap, 
  ArrowRight, 
  Mail, 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldAlert 
} from "lucide-react";
import { resetCredentials } from "@/lib/auth";
import { sendRecoveryEmail } from "@/lib/email";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/forgot")({
  head: () => ({ meta: [{ title: "Forgot Password — Attendify" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Success states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newCreds, setNewCreds] = useState({ username: "", password: "" });
  const [copied, setCopied] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email) {
      setError("Please specify your registered recovery email.");
      setLoading(false);
      return;
    }

    try {
      // Invalidate old credentials, generate new ones, and update Firestore
      const res = await resetCredentials(email);
      
      // Send new credentials securely via server function
      await sendRecoveryEmail({
        data: {
          email,
          name: "Attendify Member",
          username: res.username,
          password: res.password
        }
      });

      setNewCreds({
        username: res.username,
        password: res.password
      });

      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "No account found with this email.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCreds = () => {
    const text = `Username: ${newCreds.username}\nPassword: ${newCreds.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col bg-background text-foreground">
      {/* Background gradients */}
      <div className="absolute inset-0 gradient-hero opacity-95 dark:opacity-90" />
      <div className="absolute -top-20 -left-20 size-72 rounded-full bg-primary-glow/40 blur-3xl" />
      <div className="absolute top-40 -right-20 size-72 rounded-full bg-white/20 blur-3xl" />

      {/* Top Navbar */}
      <div className="relative flex justify-between items-center p-5 z-10">
        <Link to="/login" className="glass size-10 rounded-full flex items-center justify-center text-white hover:scale-105 transition">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex items-center gap-2 text-white absolute left-1/2 -translate-x-1/2">
          <div className="glass size-9 rounded-xl flex items-center justify-center">
            <GraduationCap className="size-5" />
          </div>
          <span className="font-semibold">Attendify</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="relative flex-1 flex flex-col justify-center px-5 max-w-[440px] mx-auto w-full z-10">
        <div className="text-white mb-6 animate-fade-up">
          <h1 className="text-3xl font-bold">Password recovery</h1>
          <p className="text-white/80 text-sm mt-1">Get generated login details sent to your email</p>
        </div>

        <form onSubmit={handleRecover} className="glass-card rounded-3xl p-6 space-y-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          
          <div className="size-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
            <ShieldAlert className="size-6" />
          </div>

          <div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter your registered matriculation or personal email. The system will automatically generate a NEW secure login password and deliver it to your inbox immediately.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Recovery Email Address</label>
            <div className="mt-2 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary/70 border border-border">
              <Mail className="size-4 text-muted-foreground" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent outline-none flex-1 text-sm w-full" 
                placeholder="alex@university.edu" 
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full gradient-primary shadow-glow text-primary-foreground rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold text-sm hover:opacity-95 transition disabled:opacity-50"
          >
            {loading ? "Resetting account..." : "Reset Password & Email Credentials"} 
            {!loading && <ArrowRight className="size-4" />}
          </button>
        </form>

        <p className="text-center text-white/80 text-xs mt-5">
          Remember details? <Link to="/login" className="font-semibold underline">Sign in</Link>
        </p>
      </div>

      {/* SUCCESS MODAL POPUP */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-background/80 backdrop-blur-md">
          <div className="glass-card max-w-[360px] w-full rounded-3xl p-6 shadow-elegant relative overflow-hidden border border-success/30 animate-scale-up">
            <div className="absolute top-0 right-0 p-8 size-44 rounded-full bg-success/10 blur-2xl pointer-events-none" />
            
            <div className="size-14 rounded-2xl bg-success/15 text-success flex items-center justify-center mx-auto mb-4">
              <Sparkles className="size-7" />
            </div>

            <h3 className="text-lg font-bold text-center text-foreground">Password Reset Complete!</h3>
            <p className="text-xs text-muted-foreground text-center mt-2.5 px-2">
              A new password has been securely generated and emailed to your inbox. You can copy the temporary password below to sign in immediately:
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-secondary/80 border border-border/80 text-left space-y-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Username</span>
                <p className="text-lg font-bold text-primary font-mono select-all">{newCreds.username}</p>
              </div>
              <div className="h-px bg-border/60" />
              <div>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">New Temporary Password</span>
                <p className="text-lg font-bold text-primary font-mono select-all">{newCreds.password}</p>
              </div>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button 
                onClick={handleCopyCreds}
                className="flex-1 glass py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-secondary transition"
              >
                {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                {copied ? "Copied!" : "Copy Details"}
              </button>
              <button 
                onClick={() => navigate({ to: "/login" })}
                className="flex-1 gradient-primary text-white py-3 rounded-xl text-xs font-semibold shadow-glow flex items-center justify-center gap-1"
              >
                Sign In <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
