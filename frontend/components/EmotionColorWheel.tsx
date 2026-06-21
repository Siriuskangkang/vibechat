"use client";
import { wheelPos, emotionHsl } from "@/lib/color";
import type { EmotionResult } from "@/lib/types";

/**
 * 情绪星图：暗色圆盘 + 极坐标十字（valence 横轴 / arousal 纵轴），
 * 用户的情绪是一个发光的落点（核心 + 光晕 + 涟漪）。不再用突兀的彩虹色盘和"你"字。
 */
export function EmotionColorWheel({ emotion }: { emotion: EmotionResult }) {
  const p = wheelPos(emotion.vector);
  const color = emotionHsl(emotion.vector);

  return (
    <div
      className="relative w-80 h-80 rounded-full"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05), rgba(255,255,255,0.012) 62%, transparent 74%)",
        border: "1px solid var(--color-line)",
      }}
    >
      {/* 极坐标十字线 */}
      <span
        className="absolute left-1/2 top-[10%] bottom-[10%] w-px -translate-x-1/2"
        style={{ background: "var(--color-line)" }}
      />
      <span
        className="absolute top-1/2 left-[10%] right-[10%] h-px -translate-y-1/2"
        style={{ background: "var(--color-line)" }}
      />
      {/* 象限标注（极淡，帮助理解坐标） */}
      <span className="absolute top-3.5 left-1/2 -translate-x-1/2 text-[10px] text-ink-faint tracking-wider">激动</span>
      <span className="absolute bottom-3.5 left-1/2 -translate-x-1/2 text-[10px] text-ink-faint tracking-wider">平静</span>
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint tracking-wider">消极</span>
      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint tracking-wider">积极</span>

      {/* 情绪落点：涟漪 + 光晕 + 核心 */}
      <div
        className="absolute"
        style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
      >
        <span
          className="absolute block rounded-full animate-ripple"
          style={{ width: 18, height: 18, left: -9, top: -9, border: `1px solid ${color}` }}
        />
        <span
          className="absolute block rounded-full animate-glow"
          style={{ width: 46, height: 46, left: -23, top: -23, background: color, filter: "blur(14px)" }}
        />
        <span
          className="relative block rounded-full"
          style={{ width: 12, height: 12, background: color, boxShadow: `0 0 14px ${color}, 0 0 3px rgba(255,255,255,0.9)` }}
        />
      </div>
    </div>
  );
}
