export interface EmotionResult {
  primary: string;
  secondary: string[];
  valence: number; arousal: number; intensity: number; social: number;
  vector: number[];
  keywords: string[];
  reading: string;
  risk_flag: boolean;
  provider: string;
}
export interface RoomBrief { slug: string; name: string; color: string; description: string; }
export interface MatchResult {
  emotion: EmotionResult;
  room: RoomBrief;
  affinity: number;
  alternatives: { slug: string; name: string; color: string; affinity: number }[];
  help_needed?: boolean;
}
export interface Avatar { color: string; shape: string; }
export interface ChatMessage {
  sender: string;
  nickname: string;
  role: "user" | "ai" | "bot";
  content: string;
  ts: number;
  avatar?: Avatar;
  isSelf?: boolean;
  isHistory?: boolean;
}
export interface RoomMood { vector: number[]; resonance: number; online: number; }
export interface Member { id: string; color: string; shape: string; }
export interface TypingState { nickname: string; color: string; expireAt: number; }
export interface Reaction { id: string; color: string; target_ts: number; nickname: string; }
