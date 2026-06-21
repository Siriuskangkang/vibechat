"use client";
import { useEffect, useRef, useState } from "react";

/**
 * 共振时刻：resonance ≥ 0.7 时触发一次全屏柔光脉冲 +「此刻，你们同频」。
 * 单次破阈 + 4s 冷却（resonance 仅在进出房重算，非连续流，故不做"连续采样窗口"）。
 * 关键时刻的安静爆发，与发言涟漪/光点遵循单一焦点。
 */
export function ResonancePulse({ resonance }: { resonance: number }) {
  const [burst, setBurst] = useState(false);
  const lastBurst = useRef(0);

  useEffect(() => {
    if (resonance >= 0.7) {
      const now = Date.now();
      if (now - lastBurst.current > 4000) {
        lastBurst.current = now;
        setBurst(true);
        const t = setTimeout(() => setBurst(false), 2400);
        return () => clearTimeout(t);
      }
    }
  }, [resonance]);

  if (!burst) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
      <div
        className="absolute inset-0 animate-glow"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(201,168,106,0.18), transparent 60%)" }}
      />
      <p
        className="relative font-display text-2xl md:text-3xl font-light text-ink animate-fade-in"
        style={{ textShadow: "0 0 28px rgba(201,168,106,0.55)", letterSpacing: "0.08em" }}
      >
        此刻，你们同频
      </p>
    </div>
  );
}
