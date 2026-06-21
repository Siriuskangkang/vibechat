"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ensureSession } from "@/lib/session";
import { postJSON } from "@/lib/api";
import type { MatchResult } from "@/lib/types";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { StarField } from "@/components/StarField";
import { addHistory } from "@/lib/history";

const EXAMPLES = [
  { text: "明天要汇报，睡不着，脑子停不下来", tone: "#6D5BFF", label: "焦虑" },
  { text: "今天被肯定了，开心，想分享", tone: "#FFB26B", label: "喜悦" },
  { text: "emo 了，说不上来，就是闷", tone: "#7C8DB5", label: "低落" },
  { text: "被领导骂了，心里好烦好气", tone: "#FF6B5E", label: "愤怒" },
  { text: "有点迷茫，不知道该怎么选", tone: "#9B7BE0", label: "迷茫" },
  { text: "今天很安静，想随便待会儿", tone: "#5BCFA8", label: "平静" },
];

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(value?: string) {
    const content = (value ?? text).trim();
    if (!content) return;
    setText(content);
    setLoading(true);
    setError("");
    try {
      await ensureSession();
      const result = await postJSON<MatchResult>("/api/emotion/analyze", { text: content });
      sessionStorage.setItem("match", JSON.stringify(result));
      const hid = addHistory({
        text: content,
        primary: result.emotion.primary,
        reading: result.emotion.reading,
        vector: result.emotion.vector,
        roomSlug: result.room.slug,
        roomName: result.room.name,
        roomColor: result.room.color,
        affinity: result.affinity,
      });
      sessionStorage.setItem("currentHistoryId", hid);
      router.push("/analyze");
    } catch (e) {
      setError(e instanceof Error ? e.message : "分析失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      {loading && (
        <LoadingOverlay title="正在听你的情绪…" subtitle="AI 正在读懂你的色彩" />
      )}
      <a href="/history" className="absolute top-5 right-5 z-10 text-sm text-ink-dim hover:text-ink px-4 py-2 rounded-full bg-surface border border-line hover:border-line-strong transition-all duration-300">
        我的轨迹
      </a>
      <StarField />
      {/* 多层情绪光晕 */}
      <div
        className="pointer-events-none absolute top-[16%] left-1/2 w-[600px] h-[600px] rounded-full animate-breathe"
        style={{ background: "radial-gradient(circle, rgba(109,91,255,0.3), transparent 65%)", filter: "blur(45px)" }}
      />
      <div
        className="pointer-events-none absolute bottom-[8%] right-[6%] w-[360px] h-[360px] rounded-full animate-float"
        style={{ background: "radial-gradient(circle, rgba(201,168,106,0.18), transparent 65%)", filter: "blur(50px)" }}
      />
      <div
        className="pointer-events-none absolute bottom-[16%] left-[4%] w-[320px] h-[320px] rounded-full animate-float"
        style={{ background: "radial-gradient(circle, rgba(91,207,168,0.14), transparent 65%)", filter: "blur(50px)", animationDelay: "1.5s" }}
      />

      <div className="relative w-full max-w-xl flex flex-col items-center">
        <p
          className="animate-fade-up text-ink-faint text-xs tracking-[0.35em] uppercase mb-6"
          style={{ animationDelay: "0ms" }}
        >
          AI · 情绪社交
        </p>

        <h1
          className="animate-fade-up font-display text-7xl md:text-8xl font-light text-ink mb-5"
          style={{ animationDelay: "90ms", letterSpacing: "-0.02em" }}
        >
          VibeChat
        </h1>

        <p
          className="animate-fade-up text-ink-dim text-lg font-light text-center max-w-md mb-12 leading-relaxed"
          style={{ animationDelay: "180ms" }}
        >
          先说说此刻的心情，
          <br />
          让情绪替你找到同频的人。
        </p>

        {/* 玻璃输入框 */}
        <div className="animate-fade-up w-full" style={{ animationDelay: "270ms" }}>
          <textarea
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            placeholder="此刻的心情、状态、或想说的话…"
            className="w-full h-36 p-5 rounded-[22px] bg-surface border border-line resize-none
                       text-ink placeholder:text-ink-faint font-light leading-relaxed
                       focus:outline-none focus:border-line-strong focus:bg-surface-strong
                       transition-all duration-500"
            style={{ transitionTimingFunction: "var(--ease)" }}
          />
        </div>

        {/* 情绪示例 · 一键填入 */}
        <div className="animate-fade-up w-full mt-6" style={{ animationDelay: "360ms" }}>
          <p className="text-ink-faint text-xs tracking-wider mb-3">或试试这些 · 点击填入</p>
          <div className="flex flex-wrap gap-2.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => setText(ex.text)}
                className="group flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full
                           bg-surface border border-line hover:border-line-strong hover:bg-surface-strong
                           transition-all duration-300 text-sm text-ink-dim hover:text-ink"
              >
                <span
                  className="w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-125"
                  style={{ background: ex.tone, boxShadow: `0 0 10px ${ex.tone}` }}
                />
                <span className="font-light">{ex.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 提交 */}
        <button
          onClick={() => submit()}
          disabled={loading || !text.trim()}
          className="animate-fade-up group relative mt-12 px-11 py-4 rounded-full overflow-hidden
                     bg-ink text-bg font-medium tracking-wide
                     hover:scale-[1.03] active:scale-95
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
                     transition-all duration-500"
          style={{
            animationDelay: "450ms",
            transitionTimingFunction: "var(--ease)",
            boxShadow: "0 10px 50px rgba(236, 233, 226, 0.12), inset 0 1px 0 rgba(255,255,255,0.45)",
          }}
        >
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: "radial-gradient(circle at 50% 130%, rgba(201,168,106,0.45), transparent 60%)" }}
          />
          <span className="relative flex items-center gap-2.5">
            {loading && (
              <span className="w-1.5 h-1.5 rounded-full bg-bg/60 animate-breathe" />
            )}
            {loading ? "正在听你的情绪…" : "找到同频房间"}
            {!loading && (
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            )}
          </span>
        </button>

        {error && (
          <p className="text-danger mt-5 text-sm animate-fade-in">{error}</p>
        )}
      </div>
    </main>
  );
}
