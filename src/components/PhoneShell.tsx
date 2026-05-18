import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function PhoneShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="min-h-screen w-full flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen pb-28">
        {children}
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
