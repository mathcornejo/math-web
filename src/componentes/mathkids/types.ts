// ─── Tipos compartidos de la plataforma MathKids ──────────────────────────────

export type LevelId = "primaria" | "secundaria" | "highschool";

export type Difficulty = "facil" | "medio" | "dificil";

export type Screen = "home" | "level" | "topicDetail" | "aiGen" | "quiz";

export type OllamaStatus = "checking" | "online" | "offline";

export type ChatRole = "system" | "user" | "assistant";

export type BotMood = "idle" | "correct" | "wrong" | "celebrate";

export interface Level {
  id: LevelId;
  label: string;
  emoji: string;
  grades: string;
  color: string;
  dark: string;
  bg: string;
}

export interface Topic {
  id: string;
  title: string;
  icon: string;
  desc: string;
  xp: number;
}

export interface ExerciseExplanation {
  steps: string[];
  formula?: string;
}

export interface Exercise {
  q: string;
  opts: string[];
  /** Índice (0-3) de la respuesta correcta en `opts` */
  ans: number;
  hint: string;
  explanation?: ExerciseExplanation;
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
}
