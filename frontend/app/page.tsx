"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ensureSession } from "@/lib/session";
import { postJSON } from "@/lib/api";
import type { MatchResult } from "@/lib/types";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      await ensureSession();
      const result = await postJSON<MatchResult>("/api/emotion/analyze", { text });
      sessionStorage.setItem("match", JSON.stringify(result));
      router.push("/analyze");
    } catch (e) {
      setError(e instanceof Error ? e.message : "分析失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0E0F1A] text-slate-200">
      <h1 className="text-4xl font-light mb-2">VibeChat</h1>
      <p className="text-slate-400 mb-10 text-center max-w-md">
        先说说此刻的心情，让情绪替你找到同频的人。
      </p>
      <textarea
        value={text} maxLength={500} onChange={(e) => setText(e.target.value)}
        placeholder="此刻的心情、状态、或想说的话…"
        className="w-full max-w-md h-32 p-4 rounded-xl bg-white/5 border border-white/10 resize-none focus:outline-none focus:border-white/30"
      />
      <button
        onClick={submit} disabled={loading || !text.trim()}
        className="mt-4 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 transition"
      >
        {loading ? "正在听你的情绪…" : "找到同频房间"}
      </button>
      {error && <p className="text-rose-400 mt-4 text-sm">{error}</p>}
    </main>
  );
}
