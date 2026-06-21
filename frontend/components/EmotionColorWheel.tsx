"use client";
import { wheelPos, emotionHsl } from "@/lib/color";
import type { EmotionResult } from "@/lib/types";

export function EmotionColorWheel({ emotion }: { emotion: EmotionResult }) {
  const p = wheelPos(emotion.vector);
  return (
    <div className="relative w-72 h-72 rounded-full"
      style={{ background: "conic-gradient(from 180deg, #6D5BFF33, #5BCFA833, #FFB26B33, #FF6B5E33, #6D5BFF33)" }}>
      <div className="absolute inset-0 rounded-full border border-white/10" />
      <div className="absolute rounded-full blur-md animate-pulse"
        style={{ width: 22, height: 22, left: `${p.x}%`, top: `${p.y}%`,
          transform: "translate(-50%,-50%)", background: emotionHsl(emotion.vector) }} />
      <span className="absolute text-xs text-white/80"
        style={{ left: `${p.x}%`, top: `calc(${p.y}% + 14px)`, transform: "translateX(-50%)" }}>你</span>
    </div>
  );
}
