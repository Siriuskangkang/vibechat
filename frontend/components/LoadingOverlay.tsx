"use client";

/**
 * LLM 调用期间的过渡卡片：同心呼吸光圈 + 文案，掩盖 3-10s 的推理延迟。
 */
export function LoadingOverlay({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <main className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-28 h-28 mb-10">
        <span
          className="absolute inset-0 rounded-full animate-pulse-scale"
          style={{
            background: "radial-gradient(circle, rgba(201,168,106,0.35), transparent 70%)",
            filter: "blur(8px)",
          }}
        />
        <span
          className="absolute inset-5 rounded-full animate-glow"
          style={{ background: "radial-gradient(circle, rgba(109,91,255,0.5), transparent 70%)" }}
        />
        <span
          className="absolute inset-9 rounded-full animate-ripple"
          style={{ border: "1px solid rgba(236,233,226,0.45)" }}
        />
        <span
          className="absolute left-1/2 top-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink"
          style={{ boxShadow: "0 0 12px rgba(236,233,226,0.8)" }}
        />
      </div>
      <p className="font-display text-2xl text-ink font-light mb-2 tracking-wide">{title}</p>
      {subtitle && <p className="text-ink-dim text-sm font-light">{subtitle}</p>}
    </main>
  );
}
