"use client";
import { weatherOf } from "@/lib/color";

const SYMBOL: Record<string, string> = {
  sunny: "☀", dawn: "◜", cloudy: "◌", drizzle: "☂", storm: "⚡",
};
const DESC: Record<string, string> = {
  sunny: "明朗", dawn: "柔和", cloudy: "中性", drizzle: "低沉", storm: "动荡",
};

/**
 * 情绪天气：把房间情绪向量翻成一档天气意象 + 诗意短文案，比「共鸣度 65%」直观。
 * header 内与 ResonanceBadge 并列。纯 SVG/CSS。
 */
export function EmotionWeather({ vector }: { vector: number[] }) {
  const w = weatherOf(vector[0] ?? 0, vector[1] ?? 0);
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-base animate-breathe"
        style={{ color: w.color, textShadow: `0 0 14px ${w.glow}` }}
      >
        {SYMBOL[w.key]}
      </span>
      <span className="text-xs text-ink-dim font-light tracking-wide">
        房间{w.label} · {DESC[w.key]}
      </span>
    </div>
  );
}
