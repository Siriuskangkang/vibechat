import { emotionHsl } from "@/lib/color";
import type { ChatMessage } from "@/lib/types";

export function MessageBubble({ msg }: { msg: ChatMessage }) {
  const aiish = msg.role !== "user";
  const color =
    msg.avatar?.color ||
    (msg.role === "ai" ? "#9B7BE0" : msg.role === "bot" ? "#7C8DB5" : emotionHsl([0, 0.4, 0.4, 0.4]));
  const tag = msg.role === "ai" ? " · 主持" : msg.role === "bot" ? " · 居民" : "";
  return (
    <div className={`flex gap-2 ${aiish ? "opacity-90" : ""}`}>
      <div className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5" style={{ background: color }} />
      <div>
        <span className="text-xs text-slate-500">{msg.nickname}{tag}</span>
        <p className={`text-slate-200 ${aiish ? "italic text-slate-300" : ""}`}>{msg.content}</p>
      </div>
    </div>
  );
}
