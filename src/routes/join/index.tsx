import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Smartphone, Sparkles } from "lucide-react";

export const Route = createFileRoute("/join/")({
  head: () => ({
    meta: [
      { title: "Yarışmaya Katıl — Coğrafya Arenası" },
      {
        name: "description",
        content: "Öğretmeninizin paylaştığı 6 haneli PIN koduyla canlı yarışmaya bağlanın.",
      },
    ],
  }),
  component: JoinIndex,
});

function JoinIndex() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pin.trim().replace(/\D/g, "");
    if (clean.length !== 6) {
      setError("Lütfen 6 haneli sayısal oda PIN kodunu girin.");
      return;
    }
    navigate({ to: `/join/${clean}` });
  };

  return (
    <div className="py-12 max-w-md mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Ana Sayfa
        </Link>
      </div>

      <div className="glass rounded-3xl p-8 border-border shadow-2xl text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand/20 text-accent border border-accent/30 shadow-glow">
          <Smartphone className="h-8 w-8" />
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
          Yarışmaya Katıl
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Akıllı tahtada veya öğretmen ekranında görünen 6 haneli oda PIN kodunu yazın.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="pin-input" className="sr-only">
              Oda PIN Kodu
            </label>
            <input
              id="pin-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              value={pin}
              onChange={(e) => {
                setError(null);
                setPin(e.target.value.replace(/\D/g, ""));
              }}
              placeholder="000000"
              className="w-full rounded-2xl border border-border bg-secondary/40 py-4 text-center font-mono text-4xl font-extrabold tracking-[0.3em] text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <button
            type="submit"
            disabled={pin.length !== 6}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-lg font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95 disabled:opacity-40"
          >
            <span>Devam Et</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-8 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <p className="flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>Karekod taradıysanız doğrudan adınızı girip bağlanabilirsiniz.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
