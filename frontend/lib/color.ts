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
