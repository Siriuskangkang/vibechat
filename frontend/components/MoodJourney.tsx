"use client";
import { wheelPos, emotionHsl } from "@/lib/color";

export function MoodJourney({
  startVector,
  moodEnd,
}: {
  startVector: number[];
  moodEnd: { valence: number; arousal: number };
}) {
  const a = wheelPos(startVector);
  const b = wheelPos([moodEnd.valence, moodEnd.arousal, 0.5, 0.5]);
  return (
    <div className="w-full max-w-md aspect-square relative mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="0" y="0" width="100" height="100" rx="8" fill="#15162a" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="#ffffff15" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#ffffff15" />
        <path d={`M ${a.x} ${a.y} Q 50 50 ${b.x} ${b.y}`} fill="none" stroke="#ffffff60" strokeWidth="0.8" strokeDasharray="2 2" />
        <circle cx={a.x} cy={a.y} r="2.5" fill={emotionHsl(startVector)} />
        <circle cx={b.x} cy={b.y} r="2.5" fill={emotionHsl([moodEnd.valence, moodEnd.arousal, 0.5, 0.5])} />
      </svg>
      <p className="text-center text-sm text-slate-400 mt-2">你来时 · 此刻</p>
    </div>
  );
}
