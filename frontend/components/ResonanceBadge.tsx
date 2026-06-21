"use client";
export function ResonanceBadge({ resonance, online }: { resonance: number; online: number }) {
  const pct = Math.round(resonance * 100);
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span className="px-2 py-1 rounded-full bg-white/10">此刻共鸣度 {pct}%</span>
      <span className="px-2 py-1 rounded-full bg-white/10">{online} 人在线</span>
    </div>
  );
}
