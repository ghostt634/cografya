import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users,
  Smartphone,
  BookOpen,
  ArrowRight,
  Sparkles,
  Trophy,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { Globe } from "@/components/Globe";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coğrafya Arenası — 11. Sınıf İnteraktif Coğrafya Yarışması" },
      {
        name: "description",
        content:
          "Canlı Kahoot tarzı yarışma, akıllı tahta grup modu ve 42 soruluk soru bankasıyla 11. sınıf interaktif coğrafya yarışması.",
      },
      { property: "og:title", content: "Coğrafya Arenası" },
      {
        property: "og:description",
        content: "11. Sınıf İnteraktif Coğrafya Yarışması — Canlı ve Akıllı Tahta Grup Modu",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");

  const handleJoinPin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pin.trim();
    if (clean.length === 6) {
      navigate({ to: `/join/${clean}` });
    } else if (clean.length > 0) {
      navigate({ to: `/join/${clean}` });
    }
  };

  return (
    <div className="py-8 sm:py-12">
      {/* Hero Header */}
      <section className="grid items-center gap-10 lg:grid-cols-12 mb-16">
        <div className="lg:col-span-7 animate-rise">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>MEB Müfredatı · 11. Sınıf</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
            COĞRAFYA <span className="text-gradient">ARENASI</span>
          </h1>

          <p className="mt-4 text-xl sm:text-2xl font-medium text-foreground/90">
            11. Sınıf İnteraktif Coğrafya Yarışması
          </p>

          <p className="mt-3 text-base text-muted-foreground max-w-xl">
            Sınıfta telefonlarla canlı çok oyunculu yarışın veya telefonsuz akıllı tahta modunda
            takımlar halinde Jeopardy usulü yarışın.
          </p>

          {/* Quick PIN input for students */}
          <form
            onSubmit={handleJoinPin}
            className="mt-8 flex flex-wrap sm:flex-nowrap items-center gap-3 max-w-md p-1.5 rounded-2xl glass border-border shadow-lg"
          >
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="6 Haneli Oda PIN'i Girin..."
              className="w-full bg-transparent px-4 py-3 text-lg font-mono font-bold tracking-wider placeholder:text-muted-foreground/60 focus:outline-none"
              aria-label="Oda PIN Kodu"
            />
            <button
              type="submit"
              disabled={pin.length < 4}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-primary-foreground shadow-glow transition-all disabled:opacity-40 hover:opacity-95"
            >
              <span>Katıl</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Statistics */}
          <dl className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
            {[
              ["7", "Ünite"],
              ["42", "Soru"],
              ["3", "Zorluk Seviyesi"],
            ].map(([n, l]) => (
              <div
                key={l}
                className="glass rounded-2xl p-4 border-border/60 hover:border-accent/40 transition-colors text-center"
              >
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-3xl font-extrabold text-gradient">{n}</dd>
                <dd className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md">
            <Globe />
          </div>
        </div>
      </section>

      {/* Three Major Sections / Game Modes */}
      <section className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            Yarışma Modunu <span className="text-gradient">Seçin</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            Sınıfınızın imkanlarına ve ders planınıza göre 2 farklı oyun deneyimi
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: CANLI YARIŞMA */}
          <div className="group relative rounded-3xl border border-border/80 bg-card p-7 transition-all duration-300 hover:border-accent hover:shadow-glow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/20 text-accent border border-accent/30 group-hover:scale-105 transition-transform">
                  <Smartphone className="h-7 w-7" />
                </span>
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
                  Kahoot Tarzı
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">CANLI YARIŞMA</h3>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                Karekodla katıl, arkadaşlarınla yarış! Öğretmen akıllı tahtadan yönetir, öğrenciler
                telefonlarından A–E seçeneklerini eşzamanlı işaretler.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <span>Tek telefondan bile anında test edilebilir</span>
                </li>
                <li className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-warning" />
                  <span>Anlık skor tablosu ve podyum animasyonu</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-border/60 flex flex-col gap-2">
              <Link
                to="/live"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-primary-foreground transition-all hover:opacity-95 shadow-md"
              >
                <span>Oda Oluştur</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/join"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>PIN Koduyla Öğrenci Girişi</span>
              </Link>
            </div>
          </div>

          {/* Card 2: GRUP YARIŞMASI */}
          <div className="group relative rounded-3xl border border-border/80 bg-card p-7 transition-all duration-300 hover:border-primary hover:shadow-glow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/20 text-primary border border-primary/30 group-hover:scale-105 transition-transform">
                  <Users className="h-7 w-7" />
                </span>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                  Telefonsuz
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">GRUP YARIŞMASI</h3>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                Takımını oluştur, sorunu seç, puanları kazan! Telefon gerektirmez; tüm yarışma
                doğrudan sınıfın akıllı tahtasından oynanır.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-warning" />
                  <span>2–8 takım, Jeopardy panosu ve çalma hakkı</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span>Altın ekonomisi ve 4 farklı joker mağazası</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-border/60">
              <Link
                to="/teams"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3 font-bold text-primary-foreground transition-all hover:opacity-95 shadow-md"
              >
                <span>Grup Yarışması Başlat</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: SORU BANKASI */}
          <div className="group relative rounded-3xl border border-border/80 bg-card p-7 transition-all duration-300 hover:border-electric hover:shadow-glow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-electric/20 text-electric border border-electric/30 group-hover:scale-105 transition-transform">
                  <BookOpen className="h-7 w-7" />
                </span>
                <span className="rounded-full bg-electric/15 px-3 py-1 text-xs font-bold text-electric">
                  7 Ünite · 42 Soru
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">SORU BANKASI</h3>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                42 soruyu incele ve cevaplarını öğren. Ünite ve zorluk seviyelerine göre filtrele,
                eğitici açıklamaları ve ipuçlarını detaylıca keşfet.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-accent" />
                  <span>14 Kolay (5p), 14 Orta (10p), 14 Zor (15p)</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <span>Öğretmen soru düzenleme ve ipucu yönetimi</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-border/60 flex flex-col gap-2">
              <Link
                to="/questions"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl glass px-5 py-3 font-bold text-foreground transition-colors hover:bg-secondary"
              >
                <span>Soruları İncele</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/uniteler"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <span>Ünite Kazanımlarını Gör</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
