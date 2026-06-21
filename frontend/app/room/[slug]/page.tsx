"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/lib/ws";
import { MoodField } from "@/components/MoodField";
import { ResonanceBadge } from "@/components/ResonanceBadge";
import { MoodJourney } from "@/components/MoodJourney";
import { MessageBubble } from "@/components/MessageBubble";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { postJSON } from "@/lib/api";
import { updateHistory } from "@/lib/history";
import { HelpCard } from "@/components/HelpCard";

function RoomInner({ slug, sessionId, vector }: { slug: string; sessionId: string; vector: number[] }) {
  const router = useRouter();
  const { messages, mood, send } = useRoom(slug, vector, sessionId);
  const [input, setInput] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [left, setLeft] = useState<null | {
    summary: string; takeaway: string;
    mood_end: { valence: number; arousal: number }; start_vector: number[];
  }>(null);

  async function leave() {
    setLeaving(true);
    try {
      const dialogue = messages.filter((m) => m.role === "user").map((m) => m.content).join("；");
      const r = await postJSON<{
        summary: string; takeaway: string;
        mood_end: { valence: number; arousal: number }; start_vector: number[];
      }>(`/api/rooms/${slug}/leave`, { session_id: sessionId, dialogue });
      const hid = sessionStorage.getItem("currentHistoryId");
      if (hid) {
        updateHistory(hid, { summary: r.summary, takeaway: r.takeaway, moodEnd: r.mood_end });
      }
      setLeft(r);
    } catch {
      setLeft({
        summary: "这次逗留，希望让你轻了一点。",
        takeaway: "被听见本身就是一种接住。",
        mood_end: { valence: vector[0], arousal: vector[1] },
        start_vector: vector,
      });
    } finally {
      setLeaving(false);
    }
  }

  function doSend() {
    if (input.trim()) {
      send(input);
      setInput("");
    }
  }

  const historyMsgs = messages.filter((m) => m.isHistory);
  const newMsgs = messages.filter((m) => !m.isHistory);
  const visibleHistory = showHistory ? historyMsgs : historyMsgs.slice(-3);

  if (left) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md flex flex-col items-center animate-fade-up">
          <p className="text-ink-faint text-xs tracking-[0.3em] uppercase mb-4">离场前的回望</p>
          <h2 className="font-display text-3xl font-light text-ink text-center mb-3 leading-relaxed">{left.summary}</h2>
          <p className="text-accent font-light mb-8">{left.takeaway}</p>
          <MoodJourney startVector={left.start_vector} moodEnd={left.mood_end} />
          <button
            onClick={() => router.push("/")}
            className="mt-10 px-8 py-3 rounded-full bg-ink text-bg font-medium tracking-wide hover:scale-[1.03] active:scale-95 transition-all duration-500"
            style={{ transitionTimingFunction: "var(--ease)" }}
          >
            回到首页
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col">
      {leaving && <LoadingOverlay title="正在为你梳理这段情绪…" subtitle="AI 在回看你们的对话" />}
      <MoodField vector={mood?.vector || vector}>
        <header className="flex items-center justify-between p-5">
          <div>
            <h1 className="font-display text-xl text-ink font-light">匿名房间</h1>
            {mood && (
              <div className="mt-1.5">
                <ResonanceBadge resonance={mood.resonance} online={mood.online} />
              </div>
            )}
          </div>
          <button
            onClick={leave}
            className="px-4 py-2 rounded-full bg-surface border border-line text-sm text-ink-dim hover:text-ink hover:border-line-strong transition-all duration-300"
          >
            离开房间
          </button>
        </header>

        {slug === "guardian-haven" && (
          <div className="px-5 pt-1 pb-2">
            <HelpCard />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {historyMsgs.length > 3 && !showHistory && (
            <button
              onClick={() => setShowHistory(true)}
              className="msg-in mx-auto block text-xs text-ink-faint hover:text-ink-dim py-1.5 transition-colors"
            >
              ↑ 展开进房前的 {historyMsgs.length} 条消息
            </button>
          )}
          {visibleHistory.map((m, i) => (
            <MessageBubble key={`h${i}`} msg={m} />
          ))}
          {historyMsgs.length > 0 && newMsgs.length > 0 && (
            <div className="text-center text-[10px] text-ink-faint py-1">— 进房后 —</div>
          )}
          {newMsgs.map((m, i) => (
            <MessageBubble key={`n${i}`} msg={m} />
          ))}
        </div>

        <footer className="p-5 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") doSend(); }}
            placeholder="说点什么…"
            className="flex-1 px-5 py-3 rounded-full bg-surface border border-line text-ink placeholder:text-ink-faint font-light focus:outline-none focus:border-line-strong focus:bg-surface-strong transition-all duration-300"
          />
          <button
            onClick={doSend}
            className="px-6 py-3 rounded-full bg-ink text-bg font-medium hover:opacity-90 active:scale-95 transition-all duration-300"
          >
            发送
          </button>
        </footer>
      </MoodField>
    </main>
  );
}

export default function RoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const [init, setInit] = useState<{ sid: string; vec: number[] } | null>(null);

  useEffect(() => {
    const sid = localStorage.getItem("sid") || "";
    const vec = JSON.parse(sessionStorage.getItem("vector") || "[0,0,0,0]");
    setInit({ sid, vec });
  }, []);

  if (!init || !init.sid) {
    return (
      <main className="min-h-screen flex items-center justify-center text-ink-dim font-light">
        正在进入房间…
      </main>
    );
  }
  return <RoomInner slug={slug} sessionId={init.sid} vector={init.vec} />;
}
