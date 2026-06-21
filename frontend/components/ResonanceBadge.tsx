"use client";
export function ResonanceBadge({ resonance, online }: { resonance: number; online: number }) {
  const pct = Math.round(resonance * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="px-2.5 py-1 rounded-full bg-surface border border-line text-ink-dim">
        共鸣度 <span className="text-accent">{pct}%</span>
      </span>
      <span className="px-2.5 py-1 rounded-full bg-surface border border-line text-ink-dim">
        {online} 人在线
      </span>
    </div>
  );
}
