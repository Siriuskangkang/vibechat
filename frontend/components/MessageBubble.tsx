import { emotionHsl } from "@/lib/color";
import type { ChatMessage } from "@/lib/types";

export function MessageBubble({ msg }: { msg: ChatMessage }) {
  const aiish = msg.role !== "user";
  const color =
    msg.avatar?.color ||
    (msg.role === "ai" ? "#9B7BE0" : msg.role === "bot" ? "#7C8DB5" : emotionHsl([0, 0.4, 0.4, 0.4]));
  const tag = msg.role === "ai" ? "房间主持" : msg.role === "bot" ? "匿名居民" : msg.nickname;
  return (
    <div className="msg-in flex gap-3">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 mt-1 border border-white/10"
        style={{ background: color, boxShadow: `0 0 10px ${color}66` }}
      />
      <div className="flex-1 min-w-0">
        <span className="text-xs text-ink-faint">{tag}</span>
        <p className={`font-light leading-relaxed break-words ${aiish ? "text-ink-dim italic" : "text-ink"}`}>
          {msg.content}
        </p>
      </div>
    </div>
  );
}
