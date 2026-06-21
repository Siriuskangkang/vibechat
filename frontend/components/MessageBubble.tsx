"use client";
import { useRef, type CSSProperties } from "react";
import { emotionHsl } from "@/lib/color";
import type { ChatMessage } from "@/lib/types";

function fmtTime(ts?: number) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

// 头像形状：用 clip-path / border-radius 让每个用户的几何形状也不同。
function avatarStyle(shape?: string): CSSProperties {
  switch (shape) {
    case "square": return { borderRadius: "5px" };
    case "rounded": return { borderRadius: "28%" };
    case "triangle": return { clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" };
    case "hexagon": return { clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" };
    case "diamond": return { clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" };
    case "pentagon": return { clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" };
    default: return { borderRadius: "9999px" }; // circle
  }
}

export function MessageBubble({ msg, onReaction }: { msg: ChatMessage; onReaction?: (ts: number) => void }) {
  const isSelf = !!msg.isSelf;
  const isHost = msg.role === "ai";
  const isBot = msg.role === "bot";
  const isSystem = isHost || isBot;
  const color =
    msg.avatar?.color ||
    (isHost ? "#9B7BE0" : isBot ? "#7C8DB5" : emotionHsl([0, 0.4, 0.4, 0.4]));
  const reactTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 长按(移动) / 悬停 0.4s(桌面) → 送一颗「接住你」光点；仅他人真人消息
  const armReact = () => {
    if (isSelf || isSystem || !onReaction || !msg.ts) return;
    if (reactTimer.current) clearTimeout(reactTimer.current);
    reactTimer.current = setTimeout(() => onReaction(msg.ts!), 400);
  };
  const cancelReact = () => {
    if (reactTimer.current) {
      clearTimeout(reactTimer.current);
      reactTimer.current = null;
    }
  };

  // 主持 / 兜底 bot：居中系统卡片
  if (isSystem) {
    return (
      <div className="msg-in flex justify-center">
        <div
          className="max-w-[85%] rounded-[18px] px-4 py-2.5"
          style={{
            background: isHost ? "rgba(155,123,224,0.1)" : "rgba(124,141,181,0.08)",
            border: `1px solid ${isHost ? "rgba(155,123,224,0.28)" : "var(--color-line)"}`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: color, boxShadow: `0 0 6px ${color}` }}
            />
            <span className="text-[11px] text-ink-faint tracking-wide">
              {isHost ? "房间主持" : "匿名居民"}
            </span>
          </div>
          <p className={`text-sm font-light leading-relaxed ${isHost ? "italic text-ink-dim" : "text-ink-dim"}`}>
            {msg.content}
          </p>
          {msg.ts ? <p className="text-[10px] text-ink-faint mt-1">{fmtTime(msg.ts)}</p> : null}
        </div>
      </div>
    );
  }

  // 真人：自己右对齐 + 强调气泡，他人左对齐 + 玻璃气泡（情绪色光晕）
  const shape = msg.avatar?.shape;
  return (
    <div className={`msg-in flex ${isSelf ? "justify-end" : "justify-start"} gap-2.5`}>
      {!isSelf && (
        <div className="flex-shrink-0 mt-1" style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}>
          <div className="w-8 h-8" style={{ background: color, ...avatarStyle(shape) }} />
        </div>
      )}
      <div
        className={`max-w-[75%] flex flex-col ${isSelf ? "items-end" : "items-start"}`}
        data-ts={msg.ts}
        onMouseEnter={armReact}
        onMouseLeave={cancelReact}
        onTouchStart={armReact}
        onTouchEnd={cancelReact}
      >
        <span className="text-[11px] text-ink-faint mb-0.5">{isSelf ? "你" : msg.nickname}</span>
        <div
          className={`rounded-[18px] px-4 py-2.5 ${isSelf ? "bg-ink text-bg" : "bg-surface border border-line text-ink"}`}
          style={!isSelf ? { boxShadow: `0 0 22px -6px ${color}` } : undefined}
        >
          <p className="text-sm font-light leading-relaxed break-words">{msg.content}</p>
        </div>
        {msg.ts ? <span className="text-[10px] text-ink-faint mt-0.5 px-1">{fmtTime(msg.ts)}</span> : null}
      </div>
      {isSelf && (
        <div className="flex-shrink-0 mt-1" style={{ filter: "drop-shadow(0 0 6px rgba(236,233,226,0.25))" }}>
          <div className="w-8 h-8 bg-ink/40" style={avatarStyle(shape)} />
        </div>
      )}
    </div>
  );
}
