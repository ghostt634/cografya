import { describe, expect, it } from "vitest";
import { questions } from "@/data/questions";
import { maxScore, summarize, scoreFor } from "@/lib/quiz";
import { calculateCoinReward, JOKER_PRICES } from "@/features/classroom/types";

describe("question bank", () => {
  it("has 42 unique questions, 6 per unit (2/2/2), 5 options each", () => {
    expect(questions).toHaveLength(42);
    expect(new Set(questions.map((q) => q.id)).size).toBe(42);
    for (let u = 1; u <= 7; u++) {
      const qs = questions.filter((q) => q.unit === u);
      expect(qs).toHaveLength(6);
      for (const d of ["kolay", "orta", "zor"])
        expect(qs.filter((q) => q.difficulty === d)).toHaveLength(2);
    }
    questions.forEach((q) => {
      expect(q.options).toHaveLength(5);
      expect(typeof q.hint).toBe("string");
      expect(q.hint?.length).toBeGreaterThan(5);
    });
  });

  it("max score is 420", () => expect(maxScore(questions)).toBe(420));

  it("scores 5/10/15 for correct, 0 for wrong", () => {
    const q1 = questions.find((q) => q.id === 1)!;
    expect(q1.correctAnswer).toBe("B");
    expect(scoreFor(q1, "B")).toBe(5);
    expect(scoreFor(q1, "A")).toBe(0);
    expect(
      scoreFor(
        questions.find((q) => q.id === 3)!,
        "A",
      ),
    ).toBe(10);
    expect(
      scoreFor(
        questions.find((q) => q.id === 5)!,
        "E",
      ),
    ).toBe(15);
  });

  it("all correct gives 420 and 100%", () => {
    const answers = Object.fromEntries(questions.map((q) => [q.id, q.correctAnswer]));
    const s = summarize(questions, answers);
    expect(s.score).toBe(420);
    expect(s.accuracy).toBe(100);
  });

  it("calculates coin rewards based on speed schedule", () => {
    expect(calculateCoinReward(3)).toBe(30);
    expect(calculateCoinReward(5)).toBe(30);
    expect(calculateCoinReward(6)).toBe(25);
    expect(calculateCoinReward(10)).toBe(25);
    expect(calculateCoinReward(15)).toBe(20);
    expect(calculateCoinReward(20)).toBe(20);
    expect(calculateCoinReward(25)).toBe(15);
    expect(calculateCoinReward(30)).toBe(15);
    expect(calculateCoinReward(35)).toBe(10);
  });

  it("has valid joker prices", () => {
    expect(JOKER_PRICES.doubleAnswer).toBe(60);
    expect(JOKER_PRICES.halfAndHalf).toBe(40);
    expect(JOKER_PRICES.extraTime).toBe(25);
    expect(JOKER_PRICES.hint).toBe(35);
  });
});
