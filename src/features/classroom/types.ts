import type { Difficulty, Letter, Question } from "@/data/questions";

export type VisualQuestion = Question & {
  imagePath?: string;
  imageUrl?: string;
  diagram?: number;
  alt?: string;
  attribution?: string;
  source?: string;
};

export type PublicQuestion = Omit<VisualQuestion, "correctAnswer" | "explanation"> & {
  correctAnswer?: Letter;
  explanation?: string;
};

export type JokerType =
  | "doubleAnswer"
  | "halfAndHalf"
  | "extraTime"
  | "hint"
  | "switchQuestion"
  | "doublePoints";

export const JOKER_PRICES: Record<JokerType, number> = {
  doubleAnswer: 60,
  halfAndHalf: 40,
  extraTime: 25,
  hint: 35,
  switchQuestion: 75,
  doublePoints: 100,
};

export const JOKER_DETAILS: Record<
  JokerType,
  { name: string; price: number; description: string; shortDesc: string }
> = {
  doubleAnswer: {
    name: "Çift Cevap",
    price: 60,
    description: "Aynı soruda iki farklı şık seçebilirsiniz. Biri doğruysa normal puanı kazanırsınız.",
    shortDesc: "2 şık seçme hakkı",
  },
  halfAndHalf: {
    name: "50/50",
    price: 40,
    description: "Beş şıktan iki yanlış şık kaldırılır (3 şık kalır).",
    shortDesc: "2 yanlış şıkkı siler",
  },
  extraTime: {
    name: "Ek Süre",
    price: 25,
    description: "Soruya 20 saniye ek süre kazandırır.",
    shortDesc: "+20 saniye süre",
  },
  hint: {
    name: "İpucu",
    price: 35,
    description: "Doğru cevabı doğrudan vermeyen eğitici bir ipucu gösterilir.",
    shortDesc: "Pedagojik ipucu",
  },
  switchQuestion: {
    name: "Soru Değiştir",
    price: 75,
    description: "Aynı üniteden ve zorluk seviyesinden kullanılmamış başka bir soruya geçer.",
    shortDesc: "Aynı üniteden yeni soru",
  },
  doublePoints: {
    name: "Çift Puan",
    price: 100,
    description: "Cevap doğruysa sorunun puanı 2 katına çıkar. Yanlışsa puan verilmez.",
    shortDesc: "Doğru yanıtta 2x puan",
  },
};

export const DEFAULT_ACTIVE_JOKERS: JokerType[] = [
  "doubleAnswer",
  "halfAndHalf",
  "extraTime",
  "hint",
  "switchQuestion",
  "doublePoints",
];

export interface TeamColorOption {
  id: string;
  name: string;
  hex: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  badgeClass: string;
}

export const TEAM_COLORS: TeamColorOption[] = [
  {
    id: "emerald",
    name: "Zümrüt Yeşili",
    hex: "#10b981",
    borderClass: "border-emerald-500",
    bgClass: "bg-emerald-500/15",
    textClass: "text-emerald-400",
    badgeClass: "bg-emerald-500 text-white",
  },
  {
    id: "cyan",
    name: "Turkuaz",
    hex: "#06b6d4",
    borderClass: "border-cyan-500",
    bgClass: "bg-cyan-500/15",
    textClass: "text-cyan-400",
    badgeClass: "bg-cyan-500 text-white",
  },
  {
    id: "amber",
    name: "Güneş Sarısı",
    hex: "#f59e0b",
    borderClass: "border-amber-500",
    bgClass: "bg-amber-500/15",
    textClass: "text-amber-400",
    badgeClass: "bg-amber-500 text-white",
  },
  {
    id: "coral",
    name: "Mercan / Turuncu",
    hex: "#f97316",
    borderClass: "border-orange-500",
    bgClass: "bg-orange-500/15",
    textClass: "text-orange-400",
    badgeClass: "bg-orange-500 text-white",
  },
  {
    id: "purple",
    name: "Lavanta / Mor",
    hex: "#a855f7",
    borderClass: "border-purple-500",
    bgClass: "bg-purple-500/15",
    textClass: "text-purple-400",
    badgeClass: "bg-purple-500 text-white",
  },
  {
    id: "pink",
    name: "Gül / Pembe",
    hex: "#ec4899",
    borderClass: "border-pink-500",
    bgClass: "bg-pink-500/15",
    textClass: "text-pink-400",
    badgeClass: "bg-pink-500 text-white",
  },
  {
    id: "blue",
    name: "Okyanus Mavisi",
    hex: "#3b82f6",
    borderClass: "border-blue-500",
    bgClass: "bg-blue-500/15",
    textClass: "text-blue-400",
    badgeClass: "bg-blue-500 text-white",
  },
  {
    id: "teal",
    name: "Deniz Yeşili",
    hex: "#14b8a6",
    borderClass: "border-teal-500",
    bgClass: "bg-teal-500/15",
    textClass: "text-teal-400",
    badgeClass: "bg-teal-500 text-white",
  },
];

export interface Settings {
  units: number[];
  difficulties: Difficulty[];
  count: number;
  random: boolean;
  seconds: number;
  explanations: boolean;
  autoClose: boolean;
  leaderboard: boolean;
  steal: boolean;
  manualTurn: boolean;
  coins: boolean;
  jokerShop: boolean;
  activeJokersList: JokerType[];
  skipAnimations: boolean;
  sound: boolean;
}

export const defaultSettings: Settings = {
  units: [1, 2, 3, 4, 5, 6, 7],
  difficulties: ["kolay", "orta", "zor"],
  count: 42,
  random: false,
  seconds: 30,
  explanations: true,
  autoClose: true,
  leaderboard: true,
  steal: false,
  manualTurn: false,
  coins: true,
  jokerShop: true,
  activeJokersList: DEFAULT_ACTIVE_JOKERS,
  skipAnimations: false,
  sound: false,
};

export interface TeamJokers {
  doubleAnswer: number;
  halfAndHalf: number;
  extraTime: number;
  hint: number;
  switchQuestion: number;
  doublePoints: number;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  color: string;
  score: number;
  correct: number;
  coins: number;
  coinsEarned: number;
  coinsSpent: number;
  jokers: TeamJokers;
  jokersUsed: number;
}

export interface ActiveJokersState {
  doubleAnswer?: boolean;
  eliminatedOptions?: Letter[];
  extraTime?: boolean;
  hintRevealed?: boolean;
  switchQuestion?: boolean;
  doublePoints?: boolean;
  switched?: boolean;
  lastUsed?: {
    joker: JokerType;
    teamName: string;
    timestamp: number;
  };
}

export interface CoinAward {
  teamId: string;
  teamName: string;
  amount: number;
  seconds: number;
  timestamp: number;
}

export interface RoomState {
  questions: VisualQuestion[];
  settings: Settings;
  phase: "lobby" | "board" | "open" | "closed" | "steal" | "finished";
  index: number;
  deadline: string | null;
  paused: boolean;
  remaining: number | null;
  teams: Team[];
  active: number;
  used: number[];
  choices: Record<string, Letter | Letter[]>;
  stealing: string | null;
  awarded: boolean;
  activeJokers: ActiveJokersState;
  questionStartTime: number | null;
  lastCoinAward: CoinAward | null;
  history: RoomState[];
  signal: string;
}

export interface Player {
  id: string;
  name: string;
  answered: boolean;
  connected: boolean;
  score: number;
  correct: number;
  choice?: Letter;
  rank: number;
}

export interface RoomView {
  id: string;
  pin: string;
  mode: "live" | "teams";
  phase: RoomState["phase"];
  question: PublicQuestion | null;
  index: number;
  total: number;
  deadline: string | null;
  paused: boolean;
  remaining: number | null;
  teams: (Team & { rank: number })[];
  active: number;
  used: number[];
  board: { id: number; unit: number; difficulty: Difficulty; points: number }[];
  settings: Settings;
  signal: string;
  players: Player[];
  mine?: Player;
  distribution: number[];
  stealing: string | null;
  choices: Record<string, Letter | Letter[]>;
  activeJokers: ActiveJokersState;
  lastCoinAward: CoinAward | null;
  version: number;
}

export interface Capability {
  id: string;
  token: string;
}

export const letters: Letter[] = ["A", "B", "C", "D", "E"];

export function ranked<T extends { score: number }>(rows: T[]): (T & { rank: number })[] {
  return [...rows]
    .sort((a, b) => b.score - a.score)
    .map((r, _, all) => ({ ...r, rank: 1 + all.filter((x) => x.score > r.score).length }));
}

export function eligible(qs: VisualQuestion[], s: Settings) {
  return qs.filter((q) => s.units.includes(q.unit) && s.difficulties.includes(q.difficulty));
}

export function calculateCoinReward(elapsedSeconds: number): number {
  if (elapsedSeconds <= 5) return 30;
  if (elapsedSeconds <= 10) return 25;
  if (elapsedSeconds <= 20) return 20;
  if (elapsedSeconds <= 30) return 15;
  return 10;
}
