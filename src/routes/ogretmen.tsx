import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Smartphone,
  Users,
  BookOpen,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Presentation,
  ShieldCheck,
} from "lucide-react";
import { units } from "@/data/units";
import { questionsFor } from "@/lib/quiz";
import { QuestionView } from "@/components/QuestionView";
import { classroomRequest } from "@/features/classroom/classroom.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ogretmen")({
  head: () => ({
    meta: [
      { title: "Öğretmen Kontrol Paneli — Coğrafya Arenası" },
      {
        name: "description",
        content: "Yarışma odalarını yönetin, soru bankasını düzenleyin veya sınıfa sunum yapın.",
      },
    ],
  }),
  component: TeacherHub,
});

function TeacherHub() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "presenter">("dashboard");

  // Presenter mode state
  const [unit, setUnit] = useState<number | undefined>();
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const [full, setFull] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qs = questionsFor(unit);
  const q = qs[i];

  // Recent rooms state
  const [rooms, setRooms] = useState<{ id: string; pin: string; mode: string; phase: string }[]>(
    [],
  );
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    const wsToken = localStorage.getItem("arena-workspace");
    if (!wsToken) return;
    try {
      const cap = JSON.parse(wsToken);
      setLoadingRooms(true);
      classroomRequest({ data: { op: "rooms", cap } })
        .then((res) => {
          if (res.rooms) setRooms(res.rooms);
        })
        .finally(() => setLoadingRooms(false));
    } catch {
      // ignore
    }
  }, []);

  const go = (d: number) => {
    setI((x) => Math.min(qs.length - 1, Math.max(0, x + d)));
    setShow(false);
  };

  useEffect(() => {
    if (activeTab !== "presenter") return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " " && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        setShow((s) => !s);
      }
    };
    window.addEventListener("keydown", h);
    const f = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", f);
    return () => {
      window.removeEventListener("keydown", h);
      document.removeEventListener("fullscreenchange", f);
    };
  }, [activeTab, qs.length]);

  return (
    <div className="py-8 max-w-5xl mx-auto space-y-8">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">
            Öğretmen Kontrol Paneli
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Canlı yarışmaları yönetin, grup oyunları kurun veya soru sunum moduna geçin.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass border-border">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === "dashboard"
                ? "bg-brand text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Yönetim Paneli
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("presenter")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
              activeTab === "presenter"
                ? "bg-brand text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Presentation className="h-3.5 w-3.5" />
            <span>Sınıf Sunum Modu</span>
          </button>
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <div className="space-y-8">
          {/* Quick Launch Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Live Competition Card */}
            <div className="glass rounded-3xl p-6 border-border flex flex-col justify-between hover:border-accent transition-all">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/20 text-accent border border-accent/30 mb-4">
                  <Smartphone className="h-6 w-6" />
                </span>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Canlı Yarışma (Kahoot)
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Öğrenciler telefonlarından bağlanır. Anlık cevap dağılımı, zamanlayıcı ve podyum.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/40">
                <Link
                  to="/live"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Yeni Canlı Oda Kur</span>
                </Link>
              </div>
            </div>

            {/* Smartboard Team Competition Card */}
            <div className="glass rounded-3xl p-6 border-border flex flex-col justify-between hover:border-primary transition-all">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/20 text-primary border border-primary/30 mb-4">
                  <Users className="h-6 w-6" />
                </span>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Grup Yarışması (Akıllı Tahta)
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Telefonsuz 2–8 takım, Jeopardy soru panosu, altın ödülleri ve 4 farklı joker.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/40">
                <Link
                  to="/teams"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95"
                >
                  <Play className="h-4 w-4" />
                  <span>Grup Yarışması Başlat</span>
                </Link>
              </div>
            </div>

            {/* Question Bank & Editor Card */}
            <div className="glass rounded-3xl p-6 border-border flex flex-col justify-between hover:border-electric transition-all">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-electric/20 text-electric border border-electric/30 mb-4">
                  <BookOpen className="h-6 w-6" />
                </span>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Soru Bankası & Düzenleyici
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  42 soruyu inceleyin, soru metinlerini, seçenekleri, açıklamaları ve ipuçlarını
                  özelleştirin.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/40">
                <Link
                  to="/questions"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl glass py-2.5 text-xs font-bold text-foreground hover:bg-secondary"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Soruları Yönet</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Active / Recent Rooms */}
          <div className="glass rounded-3xl p-6 border-border">
            <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Oluşturulan Odalarınız</span>
            </h3>

            {loadingRooms ? (
              <p className="text-xs text-muted-foreground">Odalar listeleniyor...</p>
            ) : rooms.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Henüz bu tarayıcıda oluşturulmuş kayıtlı bir oda bulunmuyor. Yukarıdan yeni bir
                yarışma kurabilirsiniz.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {rooms.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl border border-border/60 bg-secondary/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-base font-extrabold text-accent">
                        PIN: {r.pin}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {r.mode === "live" ? "Canlı Kahoot" : "Akıllı Tahta Grubu"} ·{" "}
                        <span className="capitalize">{r.phase}</span>
                      </div>
                    </div>
                    <Link
                      to={r.mode === "live" ? `/host/${r.pin}` : `/teams/${r.id}`}
                      className="px-3 py-1.5 rounded-xl bg-brand text-xs font-bold text-primary-foreground shadow-sm"
                    >
                      Aç
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* PRESENTER MODE: Fullscreen presentation slides with keyboard support */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <select
              value={unit ?? ""}
              onChange={(e) => {
                setUnit(e.target.value ? Number(e.target.value) : undefined);
                setI(0);
                setShow(false);
              }}
              className="glass rounded-xl px-3 py-2 text-sm font-semibold"
              aria-label="Ünite seç"
            >
              <option value="" className="bg-popover">
                Tüm Üniteler (42 soru)
              </option>
              {units.map((u) => (
                <option key={u.id} value={u.id} className="bg-popover">
                  {u.id}. {u.name}
                </option>
              ))}
            </select>

            <span className="text-xs text-muted-foreground">
              İpucu: Klavyeden{" "}
              <kbd className="px-1.5 py-0.5 bg-secondary rounded text-foreground">Sol/Sağ</kbd> ile
              ilerleyin,{" "}
              <kbd className="px-1.5 py-0.5 bg-secondary rounded text-foreground">Boşluk</kbd> ile
              cevabı gösterin.
            </span>
          </div>

          <div
            ref={ref}
            className={cn(
              "glass rounded-3xl p-6 sm:p-10 transition-all",
              full &&
                "flex flex-col justify-center overflow-y-auto rounded-none bg-background p-12 min-h-screen",
            )}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-xl font-bold text-accent">
                Soru {i + 1} / {qs.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  document.fullscreenElement
                    ? document.exitFullscreen()
                    : ref.current?.requestFullscreen()
                }
                className="glass flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
              >
                {full ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                {full ? "Çık" : "Tam Ekran"}
              </button>
            </div>

            {q && (
              <QuestionView
                key={q.id}
                q={q}
                revealed={show}
                selected={show ? q.correctAnswer : undefined}
                large
              />
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-6">
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={i === 0}
                className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Önceki
              </button>

              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {show ? "Cevabı Gizle" : "Cevabı Göster"}
              </button>

              <button
                type="button"
                onClick={() => go(1)}
                disabled={i >= qs.length - 1}
                className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-40"
              >
                Sonraki <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
