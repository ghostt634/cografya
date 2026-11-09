import { questions, type Difficulty, type Letter, type Question } from "@/data/questions";

export const LETTERS: Letter[] = ["A", "B", "C", "D", "E"];
export const POINTS: Record<Difficulty, number> = { kolay: 5, orta: 10, zor: 15 };
export const DIFF_LABEL: Record<Difficulty, string> = { kolay: "Kolay", orta: "Orta", zor: "Zor" };

export type Answers = Record<number, Letter>;

export function questionsFor(unit?: number): Question[] {
  return unit ? questions.filter((q) => q.unit === unit) : questions;
}

export function isCorrect(q: Question, a: Letter | undefined) {
  return a !== undefined && a === q.correctAnswer;
}

export function scoreFor(q: Question, a: Letter | undefined) {
  return isCorrect(q, a) ? POINTS[q.difficulty] : 0;
}

export function maxScore(qs: Question[]) {
  return qs.reduce((s, q) => s + POINTS[q.difficulty], 0);
}

export interface Summary {
  score: number;
  max: number;
  correct: number;
  wrong: number;
  total: number;
  accuracy: number;
  byDifficulty: Record<Difficulty, { correct: number; total: number }>;
  byUnit: Record<number, { correct: number; total: number }>;
  wrongQuestions: Question[];
}

export function summarize(qs: Question[], answers: Answers): Summary {
  const byDifficulty = {
    kolay: { correct: 0, total: 0 },
    orta: { correct: 0, total: 0 },
    zor: { correct: 0, total: 0 },
  };
  const byUnit: Summary["byUnit"] = {};
  let score = 0,
    correct = 0;
  const wrongQuestions: Question[] = [];
  for (const q of qs) {
    const ok = isCorrect(q, answers[q.id]);
    score += scoreFor(q, answers[q.id]);
    byDifficulty[q.difficulty].total++;
    byUnit[q.unit] ??= { correct: 0, total: 0 };
    byUnit[q.unit].total++;
    if (ok) {
      correct++;
      byDifficulty[q.difficulty].correct++;
      byUnit[q.unit].correct++;
    } else wrongQuestions.push(q);
  }
  return {
    score,
    max: maxScore(qs),
    correct,
    wrong: qs.length - correct,
    total: qs.length,
    accuracy: qs.length ? Math.round((correct / qs.length) * 100) : 0,
    byDifficulty,
    byUnit,
    wrongQuestions,
  };
}

/* ---------- local storage ---------- */
export interface Progress {
  unit: number | null;
  index: number;
  answers: Answers;
  timer: boolean;
}
export interface LastResult {
  unit: number | null;
  answers: Answers;
  date: string;
}

const K = { progress: "ca-progress", result: "ca-result", best: "ca-best", sound: "ca-sound" };

function read<T>(k: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

export const store = {
  getProgress: () => read<Progress>(K.progress),
  setProgress: (p: Progress) => write(K.progress, p),
  clearProgress: () => {
    try {
      localStorage.removeItem(K.progress);
    } catch {
      /* ignore */
    }
  },
  getResult: () => read<LastResult>(K.result),
  setResult: (r: LastResult) => write(K.result, r),
  getBest: () => read<Record<string, number>>(K.best) ?? {},
  setBest: (unit: number | null, score: number) => {
    const b = store.getBest();
    const key = unit ? `u${unit}` : "all";
    const isNew = score > (b[key] ?? -1);
    if (isNew) write(K.best, { ...b, [key]: score });
    return isNew;
  },
  getSound: () => read<boolean>(K.sound) ?? false,
  setSound: (v: boolean) => write(K.sound, v),
};

/* ---------- sound (muted by default) ---------- */
export function beep(ok: boolean) {
  if (!store.getSound()) return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(ok ? 660 : 220, ctx.currentTime);
    if (ok) o.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.35);
  } catch {
    /* ignore */
  }
}
