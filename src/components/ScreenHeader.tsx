import { Link } from "@tanstack/react-router";
import { ChevronLeft, Bell } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function ScreenHeader({
  title,
  subtitle,
  back = "/dashboard",
  showBell = false,
  showTheme = true,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: string | null;
  showBell?: boolean;
  showTheme?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <header className="px-5 pt-6 pb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {back && (
          <Link
            to={back}
            className="glass size-10 rounded-full flex items-center justify-center shrink-0"
            aria-label="Back"
          >
            <ChevronLeft className="size-5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {right}
        {showBell && (
          <Link to="/notifications" className="glass size-10 rounded-full flex items-center justify-center relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />
          </Link>
        )}
        {showTheme && <ThemeToggle />}
      </div>
    </header>
  );
}
