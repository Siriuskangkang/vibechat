"use client";
import { useEffect, useState } from "react";
import { getHistory, clearHistory, exportCardAsImage, type HistoryRecord } from "@/lib/history";
import { StarField } from "@/components/StarField";

export default function HistoryPage() {
  const [list, setList] = useState<HistoryRecord[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setList(getHistory());
    setLoaded(true);
  }, []);

  function handleClear() {
    setConfirmClear(true);
  }

  function doClear() {
    clearHistory();
    setList([]);
    setConfirmClear(false);
  }

  async function handleExport(rec: HistoryRecord) {
    setLoadingId(rec.id);
    try {
      await exportCardAsImage(rec);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <main className="relative min-h-screen px-6 py-16 overflow-hidden">
      <StarField />
      {/* 氛围光晕 */}
      <div
        className="pointer-events-none absolute top-[10%] left-1/2 w-[560px] h-[560px] rounded-full animate-breathe"
        style={{ background: "radial-gradient(circle, rgba(201,168,106,0.16), transparent 65%)", filter: "blur(50px)" }}
      />

      <div className="relative w-full max-w-2xl mx-auto flex flex-col">
        {/* 顶部 */}
        <div className="flex items-center justify-between mb-2">
          <a
            href="/"
            className="text-sm text-ink-dim hover:text-ink transition-colors duration-300"
          >
            ← 回到首页
          </a>
          {list.length > 0 && (
            <button
              onClick={handleClear}
              className="text-sm text-ink-faint hover:text-danger transition-colors duration-300"
            >
              清空记录
            </button>
          )}
        </div>

        <p className="animate-fade-up text-ink-faint text-xs tracking-[0.35em] uppercase mb-3 mt-4">
          My Journey
        </p>
        <h1 className="animate-fade-up font-display text-5xl md:text-6xl font-light text-ink mb-2" style={{ letterSpacing: "-0.02em" }}>
          我的情绪轨迹
        </h1>
        <p className="animate-fade-up text-ink-dim text-sm font-light mb-10">
          {list.length > 0 ? `共 ${list.length} 段被听见的时光` : "每一次落点，都被悄悄记住"}
        </p>

        {/* 空状态 */}
        {loaded && list.length === 0 && (
          <div className="animate-fade-up mt-20 flex flex-col items-center text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-breathe"
              style={{ background: "radial-gradient(circle, rgba(109,91,255,0.22), transparent 70%)" }}
            >
              <span className="text-3xl opacity-60">✦</span>
            </div>
            <p className="font-display text-2xl font-light text-ink mb-3">还没有轨迹</p>
            <p className="text-ink-faint text-sm font-light max-w-xs leading-relaxed">
              说说此刻的心情，让每一次同频都被留在这里。
            </p>
            <a
              href="/"
              className="mt-8 px-7 py-3 rounded-full bg-ink text-bg font-medium tracking-wide hover:scale-[1.03] active:scale-95 transition-all duration-500"
              style={{ transitionTimingFunction: "var(--ease)" }}
            >
              去说说心情
            </a>
          </div>
        )}

        {/* 卡片列表 */}
        <div className="space-y-4">
          {list.map((rec, i) => (
            <article
              key={rec.id}
              className="animate-fade-up group relative rounded-[20px] bg-surface border border-line p-6 hover:border-line-strong transition-all duration-500 overflow-hidden"
              style={{ animationDelay: `${Math.min(i * 60, 480)}ms` }}
            >
              {/* 卡片内情绪色光晕 */}
              <div
                className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700"
                style={{ background: `radial-gradient(circle, ${rec.roomColor}33, transparent 65%)`, filter: "blur(30px)" }}
              />

              <div className="relative flex items-start gap-4">
                {/* 情绪色光点 */}
                <div className="relative flex-shrink-0 mt-1">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: `radial-gradient(circle, ${rec.roomColor}55, transparent 70%)` }}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: rec.roomColor, boxShadow: `0 0 14px ${rec.roomColor}` }}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {/* 情绪名 + 房间同频 */}
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <h2 className="font-display text-3xl font-light text-ink">{rec.primary}</h2>
                    <span className="text-xs font-medium" style={{ color: rec.roomColor }}>
                      {rec.roomName} · 同频 {rec.affinity}%
                    </span>
                  </div>

                  {/* 解读 */}
                  <p className="text-ink-dim text-sm font-light mt-2 leading-relaxed">{rec.reading}</p>

                  {/* 原始输入 */}
                  <p className="text-ink-faint text-xs font-light italic mt-3 line-clamp-2">
                    「{rec.text}」
                  </p>

                  {/* 离场总结 */}
                  {rec.takeaway && (
                    <div className="mt-4 pt-4 border-t border-line">
                      <p className="text-accent text-sm font-light leading-relaxed">{rec.summary}</p>
                      <p className="text-ink-faint text-xs font-light mt-1.5">— {rec.takeaway}</p>
                    </div>
                  )}

                  {/* 底部：时间 + 导出 */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-ink-faint text-[11px] font-light">
                      {new Date(rec.ts).toLocaleString("zh-CN")}
                    </span>
                    <button
                      onClick={() => handleExport(rec)}
                      disabled={loadingId === rec.id}
                      className="text-xs px-3.5 py-1.5 rounded-full bg-surface-strong border border-line text-ink-dim hover:text-ink hover:border-line-strong disabled:opacity-50 transition-all duration-300"
                    >
                      {loadingId === rec.id ? "导出中…" : "导出图片"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 清空确认弹窗（主题化，替代浏览器原生 confirm） */}
      {confirmClear && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
          style={{ background: "rgba(10,11,18,0.72)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-sm rounded-[22px] p-7 border border-line-strong animate-fade-up"
            style={{ background: "linear-gradient(160deg, #14151f, #0f1018)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: "#FF6B5E", boxShadow: "0 0 10px #FF6B5E" }} />
              <h3 className="font-display text-xl font-light text-ink">清空情绪轨迹？</h3>
            </div>
            <p className="text-sm text-ink-dim font-light leading-relaxed mb-6">
              这些被听见的时光将被全部移除，且无法找回。确定继续吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-2.5 rounded-full bg-surface border border-line text-ink-dim hover:text-ink hover:border-line-strong transition-all duration-300 text-sm"
              >
                再想想
              </button>
              <button
                onClick={doClear}
                className="flex-1 py-2.5 rounded-full text-bg font-medium text-sm transition-all duration-300 hover:scale-[1.03] active:scale-95"
                style={{ background: "linear-gradient(135deg, #FF6B5E, #E0554A)", boxShadow: "0 8px 24px rgba(255,107,94,0.25)" }}
              >
                清空
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
