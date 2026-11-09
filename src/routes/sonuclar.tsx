import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, RotateCcw, SearchCheck, Trophy } from "lucide-react";
import { units } from "@/data/units";
import { DIFF_LABEL, questionsFor, store, summarize, type LastResult } from "@/lib/quiz";
import { QuestionView } from "@/components/QuestionView";

export const Route = createFileRoute("/sonuclar")({
  validateSearch: (s: Record<string, unknown>): { rekor?: number } => ({
    rekor: s.rekor ? 1 : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sonuçlar — Coğrafya Arenası" },
      {
        name: "description",
        content: "Puanını, doğruluk oranını ve ünite bazlı performansını gör.",
      },
      { property: "og:title", content: "Sonuçlar — Coğrafya Arenası" },
      { property: "og:description", content: "Yarışma sonuçların ve yanlış soruların." },
    ],
  }),
  component: Results,
});

function useCount(target: number) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1200);
      setV(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

function Bar({ label, c, t }: { label: string; c: number; t: number }) {
  const pct = t ? (c / t) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {c}/{t}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Results() {
  const { rekor } = Route.useSearch();
  const [r, setR] = useState<LastResult | null | undefined>(undefined);
  const [review, setReview] = useState(false);
  useEffect(() => setR(store.getResult()), []);

  const qs = questionsFor(r?.unit ?? undefined);
  const s = summarize(qs, r?.answers ?? {});
  const shown = useCount(r ? s.score : 0);

  if (r === undefined) return null;
  if (!r)
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold">Henüz sonuç yok</h1>
        <p className="mt-2 text-muted-foreground">
          Bir yarışmayı tamamladığında sonuçların burada görünecek.
        </p>
        <Link
          to="/yarisma"
          search={{ unite: undefined }}
          className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 font-bold text-primary-foreground"
        >
          Yarışmaya Başla
        </Link>
      </div>
    );

  const best = store.getBest()[r.unit ? `u${r.unit}` : "all"] ?? s.score;

  return (
    <section className="py-10">
      <div className="glass animate-rise rounded-3xl p-8 text-center">
        <Trophy className="mx-auto h-12 w-12 text-warning" />
        <p className="mt-2 text-muted-foreground">{r.unit ? `Ünite ${r.unit}` : "Tüm Üniteler"}</p>
        <p className="font-display text-7xl font-extrabold text-gradient">{shown}</p>
        <p className="text-muted-foreground">
          / {s.max} puan · En iyi: {best}
        </p>
        {rekor && <p className="mt-2 font-semibold text-success">Yeni kişisel rekor!</p>}
        <div className="mx-auto mt-6 grid max-w-lg grid-cols-3 gap-3">
          <div className="rounded-2xl bg-secondary p-3">
            <p className="text-2xl font-bold">%{s.accuracy}</p>
            <p className="text-xs text-muted-foreground">Doğruluk</p>
          </div>
          <div className="rounded-2xl bg-success/15 p-3">
            <p className="text-2xl font-bold text-success">{s.correct}</p>
            <p className="text-xs text-muted-foreground">Doğru</p>
          </div>
          <div className="rounded-2xl bg-destructive/15 p-3">
            <p className="text-2xl font-bold text-destructive">{s.wrong}</p>
            <p className="text-xs text-muted-foreground">Yanlış</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/yarisma"
            search={{ unite: r.unit ?? undefined }}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-primary-foreground"
          >
            <RotateCcw className="h-4 w-4" /> Tekrar Oyna
          </Link>
          <button
            onClick={() => {
              setReview(true);
              setTimeout(
                () => document.getElementById("yanlislar")?.scrollIntoView({ behavior: "smooth" }),
                50,
              );
            }}
            disabled={!s.wrong}
            className="glass inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold disabled:opacity-40"
          >
            <SearchCheck className="h-4 w-4" /> Yanlışlarımı İncele
          </button>
          <Link
            to="/"
            className="glass inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold"
          >
            <Home className="h-4 w-4" /> Ana Sayfaya Dön
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <h2 className="mb-4 text-lg font-bold">Zorluğa Göre</h2>
          <div className="space-y-4">
            {(["kolay", "orta", "zor"] as const).map((d) => (
              <Bar
                key={d}
                label={DIFF_LABEL[d]}
                c={s.byDifficulty[d].correct}
                t={s.byDifficulty[d].total}
              />
            ))}
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <h2 className="mb-4 text-lg font-bold">Üniteye Göre</h2>
          <div className="space-y-4">
            {units
              .filter((u) => s.byUnit[u.id])
              .map((u) => (
                <Bar
                  key={u.id}
                  label={`${u.id}. ${u.name}`}
                  c={s.byUnit[u.id].correct}
                  t={s.byUnit[u.id].total}
                />
              ))}
          </div>
        </div>
      </div>

      {review && (
        <div id="yanlislar" className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Yanlış Cevaplanan Sorular ({s.wrong})</h2>
          {s.wrongQuestions.map((q) => (
            <div key={q.id} className="glass rounded-3xl p-6">
              <QuestionView q={q} selected={r.answers[q.id] || undefined} revealed />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
