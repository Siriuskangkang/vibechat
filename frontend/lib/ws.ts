"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { ChatMessage, RoomMood, Member, TypingState, Reaction } from "./types";

export function useRoom(slug: string, vector: number[], sessionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mood, setMood] = useState<RoomMood | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [typing, setTyping] = useState<TypingState | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);

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
        setMembers(Array.isArray(m.members) ? m.members : []);
      } else if (m.type === "typing") {
        setTyping({ nickname: m.nickname, color: m.color, expireAt: Date.now() + 2000 });
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTyping(null), 2000);
      } else if (m.type === "reaction") {
        const r: Reaction = {
          id: `${m.ts}_${Math.random().toString(36).slice(2, 6)}`,
          color: m.color, target_ts: m.target_ts, nickname: m.nickname,
        };
        setReactions((p) => [...p, r]);
        setTimeout(() => setReactions((p) => p.filter((x) => x.id !== r.id)), 1800);
      }
    };
    return () => {
      ws.close();
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
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

  // typing 节流：600ms 内只发一次，避免每键刷屏
  const sendTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSent.current < 600) return;
    lastTypingSent.current = now;
    wsRef.current?.send(JSON.stringify({ type: "typing" }));
  }, []);

  const sendReaction = useCallback((target_ts: number) => {
    wsRef.current?.send(JSON.stringify({ type: "reaction", target_ts }));
  }, []);

  return { messages, mood, members, typing, reactions, send, sendTyping, sendReaction };
}
