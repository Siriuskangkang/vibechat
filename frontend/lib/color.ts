export function emotionHsl(vec: number[]): string {
  const [valence, arousal] = vec;
  const hue = valence >= 0 ? 40 : 240;
  const light = Math.round(40 + arousal * 40);
  return `hsl(${hue}, 70%, ${light}%)`;
}

export function wheelPos(vec: number[]): { x: number; y: number } {
  const [valence, arousal] = vec;
  return { x: 2 + ((valence + 1) / 2) * 96, y: 2 + (1 - arousal) * 96 };
}

export function affinityColor(affinity: number): string {
  const hue = Math.round(240 - (affinity / 100) * 200);
  return `hsl(${hue}, 70%, 55%)`;
}

/** 情绪天气：把房间情绪向量翻译成五档天气意象（纯函数，边界规则见 spec §5.2 / §9）。 */
export type Weather = { key: string; label: string; color: string; glow: string };

export function weatherOf(valence: number, arousal: number): Weather {
  // valence ≥ +0.2 暖向（放晴/晨光，按 arousal 0.55 分高低能）
  if (valence >= 0.2) {
    if (arousal >= 0.55)
      return { key: "sunny", label: "放晴", color: "#E8B864", glow: "rgba(201,168,106,0.50)" };
    return { key: "dawn", label: "晨光", color: "#E6C9A0", glow: "rgba(230,201,160,0.35)" };
  }
  // valence ≤ -0.2 冷向（骤雨/微雨，按 arousal 0.45 分高低能）
  if (valence <= -0.2) {
    if (arousal >= 0.45)
      return { key: "storm", label: "骤雨", color: "#8E7BC8", glow: "rgba(142,123,200,0.40)" };
    return { key: "drizzle", label: "微雨", color: "#7C8FB5", glow: "rgba(124,143,181,0.35)" };
  }
  // 其间薄云（不看 arousal）
  return { key: "cloudy", label: "薄云", color: "#9AA5B5", glow: "rgba(154,165,181,0.25)" };
}

/** 星云定位：由成员 id 哈希出稳定的 (x%, y%)，分散且确定。 */
export function nebulaPos(id: string): { x: number; y: number } {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return {
    x: 8 + ((h % 1000) / 10) * 0.84,          // 8% ~ 92%
    y: 12 + (((h >>> 10) % 1000) / 10) * 0.7, // 12% ~ 82%
  };
}
