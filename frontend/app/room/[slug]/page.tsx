"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/lib/ws";
import { MoodField } from "@/components/MoodField";
import { ResonanceBadge } from "@/components/ResonanceBadge";
import { MoodJourney } from "@/components/MoodJourney";
import { MessageBubble } from "@/components/MessageBubble";
import { postJSON } from "@/lib/api";

function RoomInner({ slug, sessionId, vector }: { slug: string; sessionId: string; vector: number[] }) {
  const router = useRouter();
  const { messages, mood, send } = useRoom(slug, vector, sessionId);
  const [input, setInput] = useState("");
  const [left, setLeft] = useState<null | { summary: string; takeaway: string; mood_end: { valence: number; arousal: number }; start_vector: number[] }>(null);

  async function leave() {
    const dialogue = messages.filter((m) => m.role === "user").map((m) => m.content).join("；");
    const r = await postJSON<{
      summary: string; takeaway: string;
      mood_end: { valence: number; arousal: number }; start_vector: number[];
    }>(`/api/rooms/${slug}/leave`, { session_id: sessionId, dialogue });
    setLeft(r);
  }

  function doSend() {
    if (input.trim()) {
      send(input);
      setInput("");
    }
  }

  if (left) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0E0F1A] text-slate-200">
        <h2 className="text-xl mb-2 text-center max-w-md">{left.summary}</h2>
        <p className="text-slate-400 mb-6">{left.takeaway}</p>
        <MoodJourney startVector={left.start_vector} moodEnd={left.mood_end} />
        <button onClick={() => router.push("/")} className="mt-8 px-6 py-2 rounded-full bg-white/10">回到首页</button>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col bg-[#0E0F1A] text-slate-200">
      <MoodField vector={mood?.vector || vector}>
        <header className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg">匿名房间</h1>
            {mood && <div className="mt-1"><ResonanceBadge resonance={mood.resonance} online={mood.online} /></div>}
          </div>
          <button onClick={leave} className="text-sm text-slate-400 hover:text-white">离开房间</button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
          {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
        </div>
        <footer className="p-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") doSend(); }}
            placeholder="说点什么…"
            className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 focus:outline-none"
          />
          <button onClick={doSend} className="px-4 py-2 rounded-full bg-white/10">发送</button>
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
    return <main className="min-h-screen flex items-center justify-center bg-[#0E0F1A] text-slate-400">正在进入房间…</main>;
  }
  return <RoomInner slug={slug} sessionId={init.sid} vector={init.vec} />;
}
