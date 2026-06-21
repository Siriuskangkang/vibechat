export interface HistoryRecord {
  id: string;
  ts: number;
  text: string;
  primary: string;
  reading: string;
  vector: number[];
  roomSlug: string;
  roomName: string;
  roomColor: string;
  affinity: number;
  summary?: string;
  takeaway?: string;
  moodEnd?: { valence: number; arousal: number };
}

const KEY = "vibechat_history";

export function getHistory(): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addHistory(rec: Omit<HistoryRecord, "id" | "ts">): string {
  const id = `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const full: HistoryRecord = { id, ts: Date.now(), ...rec };
  const list = getHistory();
  list.unshift(full);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
  return id;
}

export function updateHistory(id: string, patch: Partial<HistoryRecord>) {
  const list = getHistory();
  const i = list.findIndex((r) => r.id === id);
  if (i >= 0) {
    list[i] = { ...list[i], ...patch };
    localStorage.setItem(KEY, JSON.stringify(list));
  }
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

// ---- canvas 文本换行 ----
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number): number {
  const chars = text.split("");
  let line = "";
  let yy = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = ch;
      yy += lh;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
  return yy;
}

// ---- 导出为精美情绪卡片图片（纯 canvas，无第三方依赖）----
export async function exportCardAsImage(rec: HistoryRecord) {
  const W = 750, H = 1050;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 背景
  ctx.fillStyle = "#0A0B12";
  ctx.fillRect(0, 0, W, H);

  // 氛围光晕（房间色）
  const g = ctx.createRadialGradient(W / 2, 280, 0, W / 2, 280, 400);
  g.addColorStop(0, rec.roomColor + "44");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 600);

  // 星点
  for (let i = 0; i < 45; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(236,233,226,${Math.random() * 0.35})`;
    ctx.fill();
  }

  ctx.textAlign = "center";
  // 标题
  ctx.fillStyle = "#ECE9E2";
  ctx.font = "300 42px Georgia, serif";
  ctx.fillText("VibeChat", W / 2, 95);
  ctx.font = "300 14px sans-serif";
  ctx.fillStyle = "rgba(236,233,226,0.4)";
  ctx.fillText("情绪同频的匿名房间", W / 2, 122);

  // 情绪落点（同心圆 + 光晕）
  const cx = W / 2, cy = 290;
  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.stroke();
  const dotG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
  dotG.addColorStop(0, rec.roomColor);
  dotG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = dotG;
  ctx.beginPath();
  ctx.arc(cx, cy, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.shadowColor = rec.roomColor;
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;

  // 情绪名
  ctx.fillStyle = "#ECE9E2";
  ctx.font = "300 60px Georgia, serif";
  ctx.fillText(rec.primary, W / 2, 480);
  // 解读
  ctx.fillStyle = "rgba(236,233,226,0.7)";
  wrapText(ctx, rec.reading, W / 2, 530, 600, 28);

  // 房间 + 同频
  ctx.fillStyle = rec.roomColor;
  ctx.font = "500 22px sans-serif";
  ctx.fillText(`${rec.roomName} · 同频 ${rec.affinity}%`, W / 2, 640);

  // 分隔线
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath();
  ctx.moveTo(120, 685);
  ctx.lineTo(W - 120, 685);
  ctx.stroke();

  // 原始输入
  ctx.fillStyle = "rgba(236,233,226,0.45)";
  ctx.font = "300 14px sans-serif";
  ctx.fillText("你写下的：", W / 2, 720);
  ctx.fillStyle = "rgba(236,233,226,0.75)";
  ctx.font = "italic 300 17px sans-serif";
  wrapText(ctx, `「${rec.text}」`, W / 2, 748, 560, 26);

  // 离场总结（若有）
  let y = 860;
  if (rec.summary) {
    ctx.fillStyle = "rgba(201,168,106,0.85)";
    wrapText(ctx, rec.summary, W / 2, y, 600, 26);
    y += 60;
  }
  if (rec.takeaway) {
    ctx.fillStyle = "rgba(236,233,226,0.5)";
    ctx.font = "300 16px sans-serif";
    ctx.fillText(`— ${rec.takeaway}`, W / 2, y);
  }

  // 时间 + 水印
  ctx.fillStyle = "rgba(236,233,226,0.3)";
  ctx.font = "300 13px sans-serif";
  ctx.fillText(new Date(rec.ts).toLocaleString("zh-CN"), W / 2, H - 60);
  ctx.fillText("来自 VibeChat", W / 2, H - 38);

  // 下载
  const a = document.createElement("a");
  a.download = `vibechat-${rec.primary}-${rec.ts}.png`;
  a.href = canvas.toDataURL("image/png");
  a.click();
}
