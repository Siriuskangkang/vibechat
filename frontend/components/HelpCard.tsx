/**
 * 求助卡：情绪风险场景常驻展示真实 24h 援助热线。
 * 视觉上温暖、不惊吓（暖金 + 守护青绿），而非警示红。
 */
export function HelpCard() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: "linear-gradient(135deg, rgba(201,168,106,0.12), rgba(127,179,168,0.10))",
        border: "1px solid rgba(201,168,106,0.32)",
        boxShadow: "0 0 30px rgba(201,168,106,0.08)",
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-base" style={{ color: "#C9A86A" }}>✦</span>
        <span className="text-sm font-medium text-ink">此刻有人接住你</span>
      </div>
      <p className="text-xs text-ink-dim font-light leading-relaxed mb-4">
        你愿意说出来，本身就很不容易。如果现在很难受，专业的人 24 小时都在——打过去，就有人陪你。
      </p>
      <div className="space-y-3">
        <div>
          <p className="text-[11px] text-ink-faint mb-0.5">全国心理援助热线 · 24 小时</p>
          <p className="text-lg font-medium tracking-wide text-ink" style={{ fontFamily: "'Songti SC', Georgia, serif" }}>
            400-161-9995
          </p>
        </div>
        <div className="h-px" style={{ background: "rgba(236,233,226,0.08)" }} />
        <div>
          <p className="text-[11px] text-ink-faint mb-0.5">北京心理危机研究与干预中心</p>
          <p className="text-lg font-medium tracking-wide text-ink" style={{ fontFamily: "'Songti SC', Georgia, serif" }}>
            010-82951332
          </p>
        </div>
      </div>
    </div>
  );
}
