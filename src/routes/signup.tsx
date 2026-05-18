import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { 
  GraduationCap, 
  ArrowRight, 
  Mail, 
  User, 
  Phone, 
  School, 
  BookOpen, 
  Layers, 
  Hash, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { register } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create Profile — Attendify" }] }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "lecturer">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields state
  const [matricNumber, setMatricNumber] = useState("");
  const [surname, setSurname] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [gender, setGender] = useState("Male");
  const [mobile, setMobile] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [institution, setInstitution] = useState("State University");
  const [course, setCourse] = useState("");
  const [level, setLevel] = useState("300");

  // Success Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState({ username: "", password: "" });
  const [copied, setCopied] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!surname || !otherNames || !personalEmail || !studentEmail || !course) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    if (role === "student" && !matricNumber) {
      setError("Please specify your Matriculation Number.");
      setLoading(false);
      return;
    }

    try {
      // Generate secure credentials
      const generatedUsername = "ATTD-" + Math.floor(10000 + Math.random() * 90000);
      
      const { session: newSession, generatedPassword } = await register({
        username: generatedUsername,
        email: studentEmail,
        role,
        surname,
        otherNames,
        matricNumber: role === "student" ? matricNumber : "L-" + Math.floor(1000 + Math.random() * 9000),
        course,
        level: role === "student" ? level : "Staff",
        mobile,
        institution,
        gender
      });

      // Fire email asynchronously in the background so the UI never blocks!
      sendWelcomeEmail({
        data: {
          email: studentEmail,
          name: `${otherNames} ${surname}`,
          username: generatedUsername,
          password: generatedPassword
        }
      }).catch(console.error);

      // Set credentials to show in the success modal
      setGeneratedCreds({
        username: generatedUsername,
        password: generatedPassword
      });

      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCreds = () => {
    const text = `Username: ${generatedCreds.username}\nPassword: ${generatedCreds.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col pb-10 bg-background text-foreground">
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

      <div className="relative flex-1 flex flex-col justify-end px-5 max-w-[440px] mx-auto w-full z-10">
        <div className="text-white mb-5 animate-fade-up">
          <h1 className="text-3xl font-bold">Create profile</h1>
          <p className="text-white/80 text-sm mt-1">Get started with class check-ins</p>
        </div>

        <form onSubmit={handleRegister} className="glass-card rounded-3xl p-6 space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          
          {/* Student/Lecturer Toggle */}
          <div className="p-1 rounded-2xl bg-secondary/50 border border-border/60 flex">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                role === "student" ? "bg-background text-primary shadow-soft" : "text-muted-foreground"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("lecturer")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                role === "lecturer" ? "bg-background text-primary shadow-soft" : "text-muted-foreground"
              }`}
            >
              Lecturer
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Surname *</label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary/70 border border-border">
                <User className="size-4 text-muted-foreground" />
                <input 
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-xs w-full" 
                  placeholder="e.g. Carter" 
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Other Names *</label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary/70 border border-border">
                <User className="size-4 text-muted-foreground" />
                <input 
                  value={otherNames}
                  onChange={(e) => setOtherNames(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-xs w-full" 
                  placeholder="e.g. Alex" 
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {role === "student" && (
              <div>
                <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Matric Number *</label>
                <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary/70 border border-border">
                  <Hash className="size-4 text-muted-foreground" />
                  <input 
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    className="bg-transparent outline-none flex-1 text-xs w-full" 
                    placeholder="e.g. S2031" 
                    required={role === "student"}
                  />
                </div>
              </div>
            )}
            <div className={role === "lecturer" ? "col-span-2" : ""}>
              <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Gender Select *</label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary/70 border border-border">
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-xs w-full text-foreground"
                >
                  <option value="Male" className="bg-background">Male</option>
                  <option value="Female" className="bg-background">Female</option>
                  <option value="Prefer not to say" className="bg-background">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Mobile Number</label>
            <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary/70 border border-border">
              <Phone className="size-4 text-muted-foreground" />
              <input 
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="bg-transparent outline-none flex-1 text-xs w-full" 
                placeholder="e.g. +1 (555) 019-2834" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Personal Email *</label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary/70 border border-border">
                <Mail className="size-4 text-muted-foreground" />
                <input 
                  type="email"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-xs w-full" 
                  placeholder="personal@gmail.com" 
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Student Email *</label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary/70 border border-border">
                <Mail className="size-4 text-muted-foreground" />
                <input 
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-xs w-full" 
                  placeholder="student@university.edu" 
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Institution *</label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary/70 border border-border">
                <School className="size-4 text-muted-foreground" />
                <input 
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-xs w-full" 
                  placeholder="State University" 
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Course *</label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary/70 border border-border">
                <BookOpen className="size-4 text-muted-foreground" />
                <input 
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-xs w-full" 
                  placeholder="e.g. Computer Science" 
                  required
                />
              </div>
            </div>
          </div>

          {role === "student" && (
            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Level</label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary/70 border border-border">
                <Layers className="size-4 text-muted-foreground" />
                <select 
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-xs w-full text-foreground"
                >
                  <option value="100" className="bg-background">100 Level</option>
                  <option value="200" className="bg-background">200 Level</option>
                  <option value="300" className="bg-background">300 Level</option>
                  <option value="400" className="bg-background">400 Level</option>
                  <option value="500" className="bg-background">500 Level</option>
                </select>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full gradient-primary shadow-glow text-primary-foreground rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold text-sm hover:opacity-95 transition disabled:opacity-50"
          >
            {loading ? "Generating credentials..." : "Sign Up & Generate Credentials"} 
            {!loading && <ArrowRight className="size-4" />}
          </button>
        </form>

        <p className="text-center text-white/80 text-xs mt-5">
          Already have an account? <Link to="/login" className="font-semibold underline">Sign in</Link>
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

            <h3 className="text-lg font-bold text-center text-foreground">Credentials Generated!</h3>
            <p className="text-xs text-muted-foreground text-center mt-2.5 px-2">
              Your profile has been created! Secure credentials have been generated and emailed to <span className="text-primary font-medium">{studentEmail}</span>.
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-secondary/80 border border-border/80 text-left space-y-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Username</span>
                <p className="text-lg font-bold text-primary font-mono select-all">{generatedCreds.username}</p>
              </div>
              <div className="h-px bg-border/60" />
              <div>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Secure Password</span>
                <p className="text-lg font-bold text-primary font-mono select-all">{generatedCreds.password}</p>
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
