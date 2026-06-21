import { emotionHsl } from "@/lib/color";
import type { ChatMessage } from "@/lib/types";

function fmtTime(ts?: number) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isSelf = !!msg.isSelf;
  const isHost = msg.role === "ai";
  const isBot = msg.role === "bot";
  const isSystem = isHost || isBot;
  const color =
    msg.avatar?.color ||
    (isHost ? "#9B7BE0" : isBot ? "#7C8DB5" : emotionHsl([0, 0.4, 0.4, 0.4]));

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

  // 真人：自己右对齐 + 强调气泡，他人左对齐 + 玻璃气泡
  return (
    <div className={`msg-in flex ${isSelf ? "justify-end" : "justify-start"} gap-2.5`}>
      {!isSelf && (
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 mt-1 border border-white/10"
          style={{ background: color, boxShadow: `0 0 10px ${color}55` }}
        />
      )}
      <div className={`max-w-[75%] flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
        <span className="text-[11px] text-ink-faint mb-0.5">{isSelf ? "你" : msg.nickname}</span>
        <div
          className={`rounded-[18px] px-4 py-2.5 ${isSelf ? "bg-ink text-bg" : "bg-surface border border-line text-ink"}`}
        >
          <p className="text-sm font-light leading-relaxed break-words">{msg.content}</p>
        </div>
        {msg.ts ? <span className="text-[10px] text-ink-faint mt-0.5 px-1">{fmtTime(msg.ts)}</span> : null}
      </div>
      {isSelf && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 mt-1 border border-white/10 bg-ink/30" />
      )}
    </div>
  );
}
