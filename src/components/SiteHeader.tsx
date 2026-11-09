import { Link } from "@tanstack/react-router";
import { Globe2, Volume2, VolumeX, Smartphone, Users, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { store } from "@/lib/quiz";

const nav = [
  { to: "/live", label: "Canlı Yarışma", icon: Smartphone },
  { to: "/teams", label: "Grup Yarışması", icon: Users },
  { to: "/join", label: "Katıl (PIN)", icon: null },
  { to: "/questions", label: "Soru Bankası", icon: BookOpen },
  { to: "/ogretmen", label: "Öğretmen Paneli", icon: null },
] as const;

export function SiteHeader() {
  const [sound, setSound] = useState(false);

  useEffect(() => {
    setSound(store.getSound());
  }, []);

  const toggleSound = () => {
    const v = !sound;
    setSound(v);
    store.setSound(v);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display text-lg font-extrabold shrink-0"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-primary-foreground shadow-glow">
            <Globe2 className="h-5 w-5" />
          </span>
          <span className="tracking-tight">
            Coğrafya <span className="text-gradient">Arenası</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto py-1 text-sm">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-accent font-bold" }}
            >
              {n.icon && <n.icon className="h-4 w-4 hidden md:inline" />}
              <span>{n.label}</span>
            </Link>
          ))}

          <button
            onClick={toggleSound}
            className="ml-1 rounded-xl p-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"
            aria-label={sound ? "Sesi kapat" : "Sesi aç"}
            aria-pressed={sound}
            title={sound ? "Ses Efektleri Açık" : "Ses Efektleri Kapalı (Sessiz)"}
          >
            {sound ? <Volume2 className="h-4 w-4 text-accent" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
