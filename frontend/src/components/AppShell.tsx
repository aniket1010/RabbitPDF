"use client";

import { ReactNode, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";

  const isAuthRoute = useMemo(() => {
    const authPrefixes = ["/sign-in", "/sign-up", "/verify-email"]; // extend here if you add more
    return authPrefixes.some((p) => pathname.startsWith(p));
  }, [pathname]);

  const mainClass = [
    "min-h-screen bg-white",
    !isAuthRoute ? "md:ml-[var(--sidebar-width,320px)]" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="min-h-screen min-h-[100dvh] bg-white overflow-x-hidden">
      {/* Fixed Sidebar - Hidden on auth pages and on mobile */}
      {!isAuthRoute && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}
      <main className={mainClass} style={{ transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        {children}
      </main>
    </div>
  );
}
