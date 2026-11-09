import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Layers } from "lucide-react";
import { units } from "@/data/units";
import { questionsFor } from "@/lib/quiz";

export const Route = createFileRoute("/uniteler")({
  head: () => ({
    meta: [
      { title: "Üniteler — Coğrafya Arenası" },
      {
        name: "description",
        content: "11. sınıf coğrafyanın 7 ünitesinden birini seç ya da tüm 42 soruyu çöz.",
      },
      { property: "og:title", content: "Üniteler — Coğrafya Arenası" },
      { property: "og:description", content: "7 ünite, her birinde 6 soru." },
    ],
  }),
  component: Units,
});

function Units() {
  return (
    <section className="py-10">
      <h1 className="text-4xl font-bold">Üniteler</h1>
      <p className="mt-2 text-muted-foreground">
        Bir ünite seç ya da tüm soruları tek seferde çöz.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/yarisma"
          search={{ unite: undefined }}
          className="group rounded-3xl bg-brand p-6 text-primary-foreground shadow-glow transition-transform hover:-translate-y-1"
        >
          <Layers className="h-8 w-8" />
          <h2 className="mt-4 text-xl font-bold">Tüm Üniteler</h2>
          <p className="mt-1 opacity-80">Bütün konuları kapsayan tam yarışma.</p>
          <p className="mt-4 flex items-center gap-1 font-semibold">
            42 soru · 420 puan{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </p>
        </Link>
        {units.map((u, i) => (
          <Link
            key={u.id}
            to="/yarisma"
            search={{ unite: u.id }}
            className="glass group animate-rise rounded-3xl p-6 transition-all hover:-translate-y-1 hover:border-accent/50"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-accent">
                <u.icon className="h-6 w-6" />
              </span>
              <span className="font-display text-4xl font-bold text-muted/80">{u.id}</span>
            </div>
            <h2 className="mt-4 text-lg font-bold">{u.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{u.description}</p>
            <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
              {questionsFor(u.id).length} soru{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
