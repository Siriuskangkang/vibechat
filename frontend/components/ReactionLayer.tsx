"use client";
import { useEffect, useState } from "react";
import type { Reaction } from "@/lib/types";

/**
 * 共鸣光点层：收到 reaction 时，一颗该情绪色光点落在 target_ts 对应气泡处，
 * 微光 pulse 后随 ws.ts 移除而消失。刻意无计数、不可堆叠——不做成点赞。
 * target_ts 找不到对应气泡时，落屏幕中下方淡出（spec §8 兜底）。
 */
export function ReactionLayer({ reactions }: { reactions: Reaction[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {reactions.map((r) => <ReactionDot key={r.id} r={r} />)}
    </div>
  );
}

function ReactionDot({ r }: { r: Reaction }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = document.querySelector(`[data-ts="${r.target_ts}"]`) as HTMLElement | null;
    const rect = el?.getBoundingClientRect();
    setPos(
      rect
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : { x: window.innerWidth / 2, y: window.innerHeight - 140 }
    );
  }, [r.target_ts]);

  if (!pos) return null;
  return (
    <span
      className="absolute rounded-full animate-pulse-scale"
      style={{
        left: pos.x - 7,
        top: pos.y - 7,
        width: 14,
        height: 14,
        background: r.color,
        boxShadow: `0 0 20px 4px ${r.color}`,
        opacity: 0.92,
      }}
    />
  );
}
