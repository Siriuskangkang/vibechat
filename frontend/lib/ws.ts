"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { ChatMessage, RoomMood } from "./types";

export function useRoom(slug: string, vector: number[], sessionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mood, setMood] = useState<RoomMood | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_WS_BASE || (typeof window !== "undefined" ? window.location.origin : "");
    const wsUrl = base.replace(/^http/, "ws") + `/api/ws/room/${slug}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", session_id: sessionId, vector }));
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.type === "history") {
        setMessages((p) => [...p, {
          sender: m.nickname, nickname: m.nickname,
          role: (m.role || "user") as ChatMessage["role"],
          content: m.content, ts: m.ts, isHistory: true,
        }]);
      } else if (m.type === "message" || m.type === "host") {
        const role = (m.role || (m.type === "host" ? "ai" : "user")) as ChatMessage["role"];
        setMessages((p) => [...p, {
          sender: m.sender || m.nickname, nickname: m.nickname, role,
          content: m.content, ts: m.ts, avatar: m.avatar,
        }]);
      } else if (m.type === "room_mood") {
        setMood({ vector: m.vector, resonance: m.resonance, online: m.online });
      } else if (m.type === "presence") {
        setMood((p) => (p ? { ...p, online: m.online } : { vector: [0, 0, 0, 0], resonance: 0, online: m.online }));
      }
    };
    return () => ws.close();
  }, [slug, sessionId, vector.join(",")]);

  const send = useCallback((content: string) => {
    const c = content.trim();
    if (!c) return;
    // 乐观更新：自己的消息立即显示（后端广播会排除发送者，不再回环）
    setMessages((p) => [...p, {
      sender: "你", nickname: "你", role: "user",
      content: c, ts: Date.now(), isSelf: true,
    }]);
    wsRef.current?.send(JSON.stringify({ type: "message", content: c }));
  }, []);

  return { messages, mood, send };
}
