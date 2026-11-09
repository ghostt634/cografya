import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, User, Sparkles, LogIn } from "lucide-react";
import { classroomRequest } from "@/features/classroom/classroom.functions";
import { loadCap, saveCap } from "@/features/classroom/storage";

export const Route = createFileRoute("/join/$roomCode")({
  head: () => ({
    meta: [
      { title: "Giriş Yap — Coğrafya Arenası" },
      { name: "description", content: "Canlı yarışmaya katılmak için adınızı girin." },
    ],
  }),
  component: JoinWithRoomCode,
});

function JoinWithRoomCode() {
  const { roomCode } = useParams({ from: "/join/$roomCode" });
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    const existingCap = loadCap(`player-${roomCode}`);
    if (existingCap) {
      // Already has a session, navigate straight to play screen
      navigate({ to: `/play/${roomCode}` });
    }
  }, [roomCode, navigate]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || cleanName.length > 30) {
      setError("Adınız 1 ile 30 karakter arasında olmalıdır.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await classroomRequest({
        data: {
          op: "join",
          key: roomCode,
          name: cleanName,
        },
      });

      if (res.error || !res.cap) {
        throw new Error(res.error || "Odaya katılım sağlanamadı.");
      }

      // Save capability
      saveCap(`player-${roomCode}`, res.cap);
      if (res.room?.id) {
        saveCap(`player-${res.room.id}`, res.cap);
      }

      navigate({ to: `/play/${roomCode}` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Katılım sağlanamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-md mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/join"
          className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> PIN Değiştir
        </Link>
        <span className="font-mono text-sm font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
          PIN: {roomCode}
        </span>
      </div>

      <div className="glass rounded-3xl p-8 border-border shadow-2xl">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand/20 text-accent border border-accent/30 shadow-glow">
          <User className="h-8 w-8" />
        </div>

        <h1 className="font-display text-2xl font-extrabold text-foreground text-center">
          Adını Gir
        </h1>
        <p className="mt-1 text-sm text-muted-foreground text-center">
          Öğretmen ve sınıf arkadaşlarının ekranda göreceği adınızı veya takma adınızı yazın.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="student-name"
              className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
            >
              Öğrenci Adı / Takma Ad
            </label>
            <input
              id="student-name"
              type="text"
              required
              maxLength={30}
              autoFocus
              value={name}
              onChange={(e) => {
                setError(null);
                setName(e.target.value);
              }}
              placeholder="Örn: Mert, Ayşe 11-A, Gezgin..."
              className="w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3.5 text-lg font-semibold text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-lg font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95 disabled:opacity-40"
          >
            <LogIn className="h-5 w-5" />
            <span>{loading ? "Bağlanıyor..." : "Yarışmaya Katıl"}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Kişisel şifre veya hesap oluşturma gerekmez.</span>
        </div>
      </div>
    </div>
  );
}
