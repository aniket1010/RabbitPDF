"use client";

import { type ReactNode } from "react";

type Props = { children: ReactNode };

export function AmbientBackground({ children }: Props) {
  const VISUAL_TEST = true;

  return (
    <div className="min-h-screen bg-[#F6F5F2] font-mono overflow-y-auto overflow-x-hidden relative">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10" />

        <div
          className="absolute rounded-full"
          style={{
            width: VISUAL_TEST ? 280 : 150,
            height: VISUAL_TEST ? 280 : 150,
            background: VISUAL_TEST
              ? "radial-gradient(circle at 30% 30%, rgba(0,0,0,0.40), rgba(0,0,0,0.12) 60%, transparent)"
              : "linear-gradient(45deg, #000000, #333333)",
            top: "10%",
            left: "20%",
            filter: VISUAL_TEST ? "blur(60px)" : undefined,
            opacity: VISUAL_TEST ? 1 : undefined,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: VISUAL_TEST ? 240 : 100,
            height: VISUAL_TEST ? 240 : 100,
            background: VISUAL_TEST
              ? "radial-gradient(circle at 30% 30%, rgba(0,0,0,0.35), rgba(0,0,0,0.10) 60%, transparent)"
              : "linear-gradient(45deg, #000000, #333333)",
            top: "60%",
            right: "15%",
            filter: VISUAL_TEST ? "blur(55px)" : undefined,
            opacity: VISUAL_TEST ? 1 : undefined,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: VISUAL_TEST ? 260 : 120,
            height: VISUAL_TEST ? 260 : 120,
            background: VISUAL_TEST
              ? "radial-gradient(circle at 30% 30%, rgba(0,0,0,0.32), rgba(0,0,0,0.08) 60%, transparent)"
              : "linear-gradient(45deg, #000000, #333333)",
            bottom: "20%",
            left: "10%",
            filter: VISUAL_TEST ? "blur(60px)" : undefined,
            opacity: VISUAL_TEST ? 1 : undefined,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: VISUAL_TEST
              ? "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)"
              : "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {VISUAL_TEST && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 5,
            backdropFilter: "blur(3px) saturate(120%)",
            WebkitBackdropFilter: "blur(3px) saturate(120%)",
            background: "rgba(255,255,255,0.08)",
          }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default AmbientBackground;
