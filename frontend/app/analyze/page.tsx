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

  if (!result) return <main className="min-h-screen bg-[#0E0F1A]" />;

  const enter = () => {
    sessionStorage.setItem("vector", JSON.stringify(result.emotion.vector));
    router.push(`/room/${result.room.slug}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-[#0E0F1A] text-slate-200">
      <div className="flex flex-col md:flex-row gap-12 items-center max-w-3xl w-full">
        <EmotionColorWheel emotion={result.emotion} />
        <div className="flex-1">
          <p className="text-slate-400 text-sm">AI 读到的情绪</p>
          <h2 className="text-2xl mb-1">{result.emotion.primary}</h2>
          <p className="text-slate-300 mb-5">{result.emotion.reading}</p>
          <div className="rounded-xl p-4 mb-4"
            style={{ background: result.room.color + "22", border: `1px solid ${result.room.color}66` }}>
            <p className="text-sm text-slate-400">匹配房间</p>
            <p className="text-xl">{result.room.name} · 同频 {result.affinity}%</p>
            <p className="text-sm text-slate-400 mt-1">{result.room.description}</p>
          </div>
          <div className="flex gap-2 mb-5 flex-wrap">
            {result.alternatives.map((a) => (
              <span key={a.slug} className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-400">
                {a.name} {a.affinity}%
              </span>
            ))}
          </div>
          <button onClick={enter} className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20">
            进入房间 →
          </button>
          {result.help_needed && <HelpCard />}
        </div>
      </div>
    </main>
  );
}
