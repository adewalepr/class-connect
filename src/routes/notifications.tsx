import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, AlertTriangle, Megaphone, CheckCircle2 } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { subscribeAuth } from "@/lib/auth";
import { getCollection, subscribeCollection, updateDocument } from "@/lib/database";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Attendify" }] }),
  component: Notifications,
});

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    // Auth check
    const unsubAuth = subscribeAuth((user) => {
      if (!user) navigate({ to: "/login" });
    });

    // Subscribe to live database notifications
    const unsubNotifs = subscribeCollection("notifications", (list) => {
      // Sort newest first
      const sorted = [...list].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setNotifications(sorted);
    });

    return () => {
      unsubAuth();
      unsubNotifs();
    };
  }, [navigate]);

  const markAllAsRead = async () => {
    for (const n of notifications) {
      if (!n.read) {
        await updateDocument("notifications", n.id, { read: true });
      }
    }
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("marked") || t.includes("attendance") || t.includes("registered")) return CheckCircle2;
    if (t.includes("missed") || t.includes("closed") || t.includes("expired")) return AlertTriangle;
    if (t.includes("review") || t.includes("posted")) return Megaphone;
    return Bell;
  };

  const getColor = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("marked") || t.includes("attendance") || t.includes("registered")) return "bg-success/15 text-success";
    if (t.includes("missed") || t.includes("closed") || t.includes("expired")) return "bg-destructive/15 text-destructive";
    if (t.includes("review") || t.includes("posted")) return "bg-warning/20 text-warning-foreground";
    return "bg-primary/15 text-primary";
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Filter notifications
  const filtered = notifications.filter(n => {
    if (activeFilter === "All") return true;
    const title = n.title.toLowerCase();
    if (activeFilter === "Alerts") return title.includes("missed") || title.includes("closed") || title.includes("expired");
    if (activeFilter === "Announcements") return title.includes("review") || title.includes("posted");
    if (activeFilter === "Reminders") return !title.includes("missed") && !title.includes("closed") && !title.includes("posted");
    return true;
  });

  return (
    <PhoneShell>
      <ScreenHeader 
        title="Notifications" 
        subtitle={`${unreadCount} unread`} 
        back="/dashboard" 
        showTheme 
        right={
          <button onClick={markAllAsRead} className="text-xs font-semibold text-primary px-3 hover:underline">Mark all</button>
        } 
      />

      <div className="px-5 pb-10">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 mb-5">
          {["All", "Reminders", "Alerts", "Announcements"].map((c) => (
            <button 
              key={c} 
              onClick={() => setActiveFilter(c)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                activeFilter === c 
                  ? "gradient-primary text-primary-foreground border-transparent shadow-glow" 
                  : "bg-card/50 border-border text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-2.5">
          {filtered.length > 0 ? (
            filtered.map((n, i) => {
              const Icon = getIcon(n.title);
              const color = getColor(n.title);
              return (
                <div key={n.id || i} className={`glass-card rounded-2xl p-3.5 flex gap-3 items-start border transition ${
                  !n.read ? "border-primary/20 bg-primary/5" : "border-border/60"
                } animate-fade-up`} style={{ animationDelay: `${i * 0.05}s` }}>
                  <span className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="size-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate text-foreground">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{n.time || "now"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="p-10 text-center text-xs text-muted-foreground">No notifications found.</p>
          )}
        </div>
      </div>
    </PhoneShell>
  );
}
