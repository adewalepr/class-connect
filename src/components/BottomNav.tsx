import { Link, useLocation } from "@tanstack/react-router";
import { Home, QrCode, CalendarDays, BarChart3, User } from "lucide-react";

type NavItem = { to: "/dashboard" | "/history" | "/scan" | "/analytics" | "/profile"; label: string; icon: typeof Home; primary?: boolean };
const items: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/history", label: "History", icon: CalendarDays },
  { to: "/scan", label: "Scan", icon: QrCode, primary: true },
  { to: "/analytics", label: "Stats", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-4 pb-4 pt-2 z-40">
      <div className="glass-card rounded-3xl px-3 py-2 flex items-end justify-between">
        {items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          if (it.primary) {
            return (
              <Link
                key={it.to}
                to={it.to}
                className="-mt-7 flex flex-col items-center"
              >
                <span className="gradient-primary shadow-glow size-14 rounded-2xl flex items-center justify-center text-primary-foreground">
                  <Icon className="size-6" />
                </span>
                <span className="text-[10px] mt-1 text-muted-foreground">{it.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
