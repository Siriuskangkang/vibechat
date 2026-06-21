"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmotionColorWheel } from "@/components/EmotionColorWheel";
import { HelpCard } from "@/components/HelpCard";
import type { MatchResult } from "@/lib/types";

export default function AnalyzePage() {
  const router = useRouter();
  const [result, setResult] = useState<MatchResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("match");
    if (!raw) {
      router.replace("/");
      return;
    }
    setResult(JSON.parse(raw));
  }, [router]);

  if (!result) return <main className="min-h-screen" />;

  const enter = () => {
    sessionStorage.setItem("vector", JSON.stringify(result.emotion.vector));
    router.push(`/room/${result.room.slug}`);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-14 items-center">
        {/* 左：情绪星图 */}
        <div className="animate-fade-up flex flex-col items-center" style={{ animationDelay: "0ms" }}>
          <EmotionColorWheel emotion={result.emotion} />
          <p className="mt-5 text-xs text-ink-faint tracking-wider">你的情绪此刻落在这里</p>
        </div>

        {/* 右：解读 + 匹配 */}
        <div className="flex-1 w-full">
          <p
            className="animate-fade-up text-ink-faint text-xs tracking-[0.3em] uppercase mb-3"
            style={{ animationDelay: "80ms" }}
          >
            AI 读到的情绪
          </p>
          <h2
            className="animate-fade-up font-display text-5xl font-light text-ink mb-3"
            style={{ animationDelay: "160ms" }}
          >
            {result.emotion.primary}
          </h2>
          <p
            className="animate-fade-up text-ink-dim font-light leading-relaxed mb-7"
            style={{ animationDelay: "240ms" }}
          >
            {result.emotion.reading}
          </p>

          {/* 匹配房卡 */}
          <div
            className="animate-fade-up rounded-[22px] p-5 mb-5"
            style={{
              animationDelay: "320ms",
              background: `linear-gradient(135deg, ${result.room.color}22, transparent)`,
              border: `1px solid ${result.room.color}44`,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: result.room.color, boxShadow: `0 0 8px ${result.room.color}` }}
              />
              <p className="text-ink-faint text-xs tracking-wider">最同频的房间</p>
            </div>
            <div className="flex items-baseline gap-3 mb-1.5">
              <span className="font-display text-2xl text-ink">{result.room.name}</span>
              <span className="text-accent text-sm">同频 {result.affinity}%</span>
            </div>
            <p className="text-ink-dim text-sm font-light">{result.room.description}</p>
          </div>

          {/* 其他同频 */}
          {result.alternatives.length > 0 && (
            <div className="animate-fade-up flex flex-wrap gap-2 mb-8" style={{ animationDelay: "400ms" }}>
              {result.alternatives.map((a) => (
                <span
                  key={a.slug}
                  className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full bg-surface border border-line text-xs text-ink-dim"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.color }} />
                  {a.name} · {a.affinity}%
                </span>
              ))}
            </div>
          )}

          <button
            onClick={enter}
            className="animate-fade-up group relative px-10 py-3.5 rounded-full overflow-hidden bg-ink text-bg font-medium tracking-wide hover:scale-[1.03] active:scale-95 transition-all duration-500"
            style={{
              animationDelay: "480ms",
              transitionTimingFunction: "var(--ease)",
              boxShadow: "0 10px 50px rgba(236,233,226,0.12), inset 0 1px 0 rgba(255,255,255,0.45)",
            }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "radial-gradient(circle at 50% 130%, rgba(201,168,106,0.45), transparent 60%)" }}
            />
            <span className="relative flex items-center gap-2.5">
              进入这间房
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </span>
          </button>

          {result.help_needed && <div className="mt-6 animate-fade-in"><HelpCard /></div>}
        </div>
      </div>
    </main>
  );
}
