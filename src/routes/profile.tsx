import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronRight, Bell, Shield, Moon, Globe, HelpCircle, LogOut, Pencil } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Attendify" }] }),
  component: Profile,
});

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={`w-10 h-6 rounded-full p-0.5 transition ${on ? "gradient-primary" : "bg-secondary"}`}>
      <span className={`block size-5 rounded-full bg-white shadow-soft transition ${on ? "translate-x-4" : ""}`} />
    </button>
  );
}

function Profile() {
  const [dark, setDark] = useState(false);
  const [notif, setNotif] = useState(true);
  const [reminders, setReminders] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = (v: boolean) => {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("theme", v ? "dark" : "light");
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mt-5">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 px-1">{title}</p>
      <div className="glass-card rounded-2xl divide-y divide-border overflow-hidden">{children}</div>
    </div>
  );
  const Row = ({ icon: Icon, label, right, to }: any) => {
    const inner = (
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="size-9 rounded-xl bg-secondary flex items-center justify-center text-foreground"><Icon className="size-4" /></span>
        <span className="flex-1 text-sm font-medium">{label}</span>
        {right ?? <ChevronRight className="size-4 text-muted-foreground" />}
      </div>
    );
    return to ? <Link to={to}>{inner}</Link> : <div>{inner}</div>;
  };

  return (
    <PhoneShell>
      <ScreenHeader title="Profile" back="/dashboard" showTheme={false} right={
        <button className="glass size-10 rounded-full flex items-center justify-center"><Pencil className="size-4" /></button>
      } />

      <div className="px-5">
        <div className="glass-card rounded-3xl p-5 flex items-center gap-4">
          <div className="relative">
            <div className="size-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold shadow-glow">AC</div>
            <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-success border-2 border-background" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">Alex Carter</h2>
            <p className="text-xs text-muted-foreground">S2031 · CS · Year 3</p>
            <div className="mt-2 flex gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success font-medium">86% attendance</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">Top 10%</span>
            </div>
          </div>
        </div>

        <Section title="Account">
          <Row icon={Pencil} label="Edit personal info" />
          <Row icon={Shield} label="Security & password" />
          <Row icon={Globe} label="Language" right={<span className="text-xs text-muted-foreground">English</span>} />
        </Section>

        <Section title="Preferences">
          <Row icon={Moon} label="Dark mode" right={<Toggle on={dark} onChange={toggleDark} />} />
          <Row icon={Bell} label="Push notifications" right={<Toggle on={notif} onChange={setNotif} />} />
          <Row icon={Bell} label="Class reminders" right={<Toggle on={reminders} onChange={setReminders} />} />
        </Section>

        <Section title="Support">
          <Row icon={HelpCircle} label="Help center" />
          <Row icon={Shield} label="Privacy policy" />
        </Section>

        <button className="mt-5 w-full glass-card rounded-2xl py-3.5 flex items-center justify-center gap-2 text-destructive font-semibold text-sm">
          <LogOut className="size-4" /> Log out
        </button>

        <p className="text-center text-[10px] text-muted-foreground mt-4">Attendify v1.0 · Made with care</p>
      </div>
    </PhoneShell>
  );
}
