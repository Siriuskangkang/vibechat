"use client";
import { emotionHsl } from "@/lib/color";

export function MoodField({ vector, children }: { vector: number[]; children?: React.ReactNode }) {
  const color = emotionHsl(vector);
  return (
    <>
      <div className="fixed inset-0 -z-10 transition-all duration-[2000ms]"
           style={{ background: `radial-gradient(circle at 50% 40%, ${color} 0%, rgba(14,15,26,0.9) 70%)` }}>
        <div className="absolute inset-0 opacity-30 animate-pulse" style={{ background: color, filter: "blur(60px)" }} />
      </div>
      {children}
    </>
  );
}
