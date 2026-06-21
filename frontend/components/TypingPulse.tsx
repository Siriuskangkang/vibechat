"use client";
import type { TypingState } from "@/lib/types";

/**
 * 情绪脉搏：他人输入时，footer 上方显示该人情绪色 pulse 点 + 极小昵称，
 * 替代冷冰冰的「…」。ws.ts 收到 typing 后 2s 未续则淡出。
 */
export function TypingPulse({ typing }: { typing: TypingState | null }) {
  if (!typing) return null;
  return (
    <div className="px-5 pb-1 h-5 flex items-center gap-2 animate-fade-in">
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse-scale"
        style={{ background: typing.color, boxShadow: `0 0 8px ${typing.color}` }}
      />
      <span className="text-[11px] text-ink-faint font-light">{typing.nickname} 正在输入…</span>
    </div>
  );
}
