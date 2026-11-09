import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Maximize, Minimize, RotateCcw, Timer } from "lucide-react";
import type { Letter } from "@/data/questions";
import { unitById } from "@/data/units";
import { beep, LETTERS, questionsFor, store, summarize, type Answers } from "@/lib/quiz";
import { QuestionView } from "@/components/QuestionView";
import { cn } from "@/lib/utils";

const TIME = 60;

export const Route = createFileRoute("/yarisma")({
  validateSearch: (s: Record<string, unknown>): { unite?: number } => {
    const n = Number(s.unite);
    return { unite: n >= 1 && n <= 7 ? n : undefined };
  },
  head: () => ({
    meta: [
      { title: "Yarışma — Coğrafya Arenası" },
      {
        name: "description",
        content: "Soruları tek tek cevapla, açıklamaları oku, puanını topla.",
      },
      { property: "og:title", content: "Yarışma — Coğrafya Arenası" },
      { property: "og:description", content: "11. sınıf coğrafya yarışması." },
    ],
  }),
  component: Quiz,
});

function Quiz() {
  const { unite } = Route.useSearch();
  const navigate = useNavigate();
  const qs = questionsFor(unite);
  const unitKey = unite ?? null;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [selected, setSelected] = useState<Letter | undefined>();
  const [timerOn, setTimerOn] = useState(false);
  const [left, setLeft] = useState(TIME);
  const [ready, setReady] = useState(false);
  const [full, setFull] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const q = qs[index];
  const revealed = answers[q.id] !== undefined;

  // restore saved progress
  useEffect(() => {
    const p = store.getProgress();
    if (p && p.unit === unitKey && p.index < qs.length) {
      setIndex(p.index);
      setAnswers(p.answers);
      setTimerOn(p.timer);
    } else {
      setIndex(0);
      setAnswers({});
    }
    setSelected(undefined);
    setReady(true);
  }, [unitKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ready) store.setProgress({ unit: unitKey, index, answers, timer: timerOn });
  }, [ready, unitKey, index, answers, timerOn]);

  useEffect(() => {
    setLeft(TIME);
  }, [index, timerOn]);

  const confirm = (choice: Letter | undefined) => {
    if (revealed) return;
    const a = choice ?? ("" as Letter); // empty = timed out, counts wrong
    setAnswers((prev) => ({ ...prev, [q.id]: a }));
    beep(a === q.correctAnswer);
  };

  useEffect(() => {
    if (!timerOn || revealed || !ready) return;
    if (left <= 0) {
      confirm(selected);
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }); // runs each render intentionally

  const next = () => {
    if (index + 1 < qs.length) {
      setIndex(index + 1);
      setSelected(undefined);
    } else {
      const s = summarize(qs, answers);
      const newBest = store.setBest(unitKey, s.score);
      store.setResult({ unit: unitKey, answers, date: new Date().toISOString() });
      store.clearProgress();
      navigate({ to: "/sonuclar", search: { rekor: newBest ? 1 : undefined } });
    }
  };

  const restart = () => {
    store.clearProgress();
    setIndex(0);
    setAnswers({});
    setSelected(undefined);
  };

  // keyboard: A–E / 1–5 select, Enter confirm/next
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest("button,a,input") &&
        e.key === "Enter"
      )
        return;
      const k = e.key.toUpperCase();
      const i =
        LETTERS.indexOf(k as Letter) >= 0
          ? LETTERS.indexOf(k as Letter)
          : ["1", "2", "3", "4", "5"].indexOf(k);
      if (i >= 0 && !revealed) {
        setSelected(LETTERS[i]);
      } else if (e.key === "Enter") {
        if (revealed) {
          next();
        } else if (selected) {
          confirm(selected);
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  useEffect(() => {
    const h = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);
  const toggleFull = () =>
    document.fullscreenElement ? document.exitFullscreen() : boxRef.current?.requestFullscreen();

  const score = summarize(qs.slice(0, index + 1), answers).score;
  const progress = ((index + (revealed ? 1 : 0)) / qs.length) * 100;

  if (!ready) return <div className="py-20 text-center text-muted-foreground">Yükleniyor…</div>;

  return (
    <div ref={boxRef} className={cn("py-8", full && "overflow-y-auto bg-background p-8")}>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {unite ? `Ünite ${unite} · ${unitById(unite).name}` : "Tüm Üniteler"}
          </p>
          <p className="font-display text-xl font-bold">
            Soru {index + 1} / {qs.length}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="glass rounded-xl px-3 py-2 font-display font-bold">
            <span className="text-gradient">{score}</span> puan
          </span>
          <button
            onClick={() => setTimerOn(!timerOn)}
            aria-pressed={timerOn}
            className={cn(
              "glass flex items-center gap-1 rounded-xl px-3 py-2 text-sm",
              timerOn && "border-accent text-accent",
            )}
          >
            <Timer className="h-4 w-4" /> {timerOn ? `${left} sn` : "Süre"}
          </button>
          <button onClick={toggleFull} className="glass rounded-xl p-2" aria-label="Tam ekran">
            {full ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
          <button onClick={restart} className="glass rounded-xl p-2" aria-label="Baştan başla">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        className="mb-8 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {timerOn && !revealed && (
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full transition-all duration-1000 ease-linear",
              left <= 10 ? "bg-destructive" : "bg-accent",
            )}
            style={{ width: `${(left / TIME) * 100}%` }}
          />
        </div>
      )}

      <div className="glass rounded-3xl p-5 sm:p-8">
        <QuestionView
          q={q}
          selected={revealed ? answers[q.id] : selected}
          revealed={revealed}
          onSelect={setSelected}
          large={full}
        />
        {revealed && answers[q.id] === ("" as Letter) && (
          <p className="mt-3 text-sm text-destructive">Süre doldu — bu soru yanlış sayıldı.</p>
        )}
        <div className="mt-6 flex justify-end">
          {!revealed ? (
            <button
              disabled={!selected}
              onClick={() => confirm(selected)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-primary-foreground transition-opacity disabled:opacity-40"
            >
              <Check className="h-5 w-5" /> Cevabı Onayla
            </button>
          ) : (
            <button
              onClick={next}
              autoFocus
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-primary-foreground"
            >
              {index + 1 < qs.length ? "Sonraki Soru" : "Sonuçları Gör"}{" "}
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Klavye: A–E veya 1–5 ile seç, Enter ile onayla / ilerle.
      </p>
    </div>
  );
}
