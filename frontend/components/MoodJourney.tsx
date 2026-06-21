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
  const startColor = emotionHsl(startVector);
  const endColor = emotionHsl([moodEnd.valence, moodEnd.arousal, 0.5, 0.5]);
  return (
    <div
      className="w-full max-w-sm aspect-square relative mx-auto rounded-[22px]"
      style={{
        border: "1px solid var(--color-line)",
        background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.035), transparent 70%)",
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <line x1="50" y1="8" x2="50" y2="92" stroke="var(--color-line)" strokeWidth="0.4" />
        <line x1="8" y1="50" x2="92" y2="50" stroke="var(--color-line)" strokeWidth="0.4" />
        <path
          d={`M ${a.x} ${a.y} Q 50 50 ${b.x} ${b.y}`}
          fill="none"
          stroke="rgba(201,168,106,0.55)"
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />
        <circle cx={a.x} cy={a.y} r="2.8" fill={startColor} filter="url(#mj-glow)" />
        <circle cx={b.x} cy={b.y} r="2.8" fill={endColor} filter="url(#mj-glow)" />
        <defs>
          <filter id="mj-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
        </defs>
      </svg>
      <p className="text-center text-xs text-ink-faint tracking-wider mt-1">你来时 · 此刻</p>
    </div>
  );
}
