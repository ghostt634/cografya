import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import type { Letter, Question } from "@/data/questions";
import { unitById } from "@/data/units";
import { DIFF_LABEL, LETTERS } from "@/lib/quiz";
import { cn } from "@/lib/utils";

const diffClass = {
  kolay: "bg-success/15 text-success",
  orta: "bg-warning/15 text-warning",
  zor: "bg-destructive/15 text-destructive",
};

export function DifficultyBadge({ d }: { d: Question["difficulty"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
        diffClass[d],
      )}
    >
      {DIFF_LABEL[d]} · {d === "kolay" ? 5 : d === "orta" ? 10 : 15} puan
    </span>
  );
}

interface Props {
  q: Question;
  selected?: Letter;
  revealed: boolean;
  onSelect?: (l: Letter) => void;
  large?: boolean;
}

export function QuestionView({ q, selected, revealed, onSelect, large }: Props) {
  return (
    <div key={q.id} className="animate-rise">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <DifficultyBadge d={q.difficulty} />
        <span>
          Ünite {q.unit} · {unitById(q.unit).name}
        </span>
      </div>
      <h2
        className={cn(
          "font-display font-semibold leading-snug",
          large ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl",
        )}
      >
        {q.question}
      </h2>
      <div role="radiogroup" aria-label="Seçenekler" className="mt-6 grid gap-3">
        {q.options.map((opt, i) => {
          const l = LETTERS[i];
          const isSel = selected === l;
          const isRight = revealed && l === q.correctAnswer;
          const isWrong = revealed && isSel && l !== q.correctAnswer;
          return (
            <button
              key={l}
              role="radio"
              aria-checked={isSel}
              disabled={revealed || !onSelect}
              onClick={() => onSelect?.(l)}
              className={cn(
                "group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                large ? "text-lg sm:text-2xl" : "text-base",
                "border-border bg-secondary/50 enabled:hover:border-accent/60 enabled:hover:bg-secondary",
                isSel && !revealed && "border-accent bg-accent/10 shadow-glow",
                isRight && "border-success bg-success/15",
                isWrong && "border-destructive bg-destructive/15",
                revealed && !isRight && !isWrong && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display font-bold",
                  isRight
                    ? "bg-success text-primary-foreground"
                    : isWrong
                      ? "bg-destructive text-destructive-foreground"
                      : isSel
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground",
                )}
              >
                {l}
              </span>
              <span className="flex-1">{opt}</span>
              {isRight && (
                <CheckCircle2 className="h-6 w-6 text-success" aria-label="Doğru cevap" />
              )}
              {isWrong && (
                <XCircle className="h-6 w-6 text-destructive" aria-label="Yanlış cevap" />
              )}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div
          className="animate-rise mt-6 flex gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4"
          role="status"
        >
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <p className="font-semibold">Doğru cevap: {q.correctAnswer}</p>
            <p className={cn("text-muted-foreground", large && "text-lg")}>{q.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
