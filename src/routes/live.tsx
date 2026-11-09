import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Smartphone,
  Play,
  Settings as SettingsIcon,
  Check,
  Sparkles,
  ArrowLeft,
  Timer,
  Clock,
  HelpCircle,
  BarChart3,
  Award,
} from "lucide-react";
import { units } from "@/data/units";
import { questions as allQuestions } from "@/data/questions";
import { classroomRequest } from "@/features/classroom/classroom.functions";
import { saveCap } from "@/features/classroom/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Canlı Yarışma Oluştur — Coğrafya Arenası" },
      {
        name: "description",
        content: "Kahoot tarzı canlı çok oyunculu coğrafya yarışması odası kur.",
      },
    ],
  }),
  component: CreateLiveRoom,
});

function CreateLiveRoom() {
  const navigate = useNavigate();

  const [selectedUnits, setSelectedUnits] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [difficulties, setDifficulties] = useState<("kolay" | "orta" | "zor")[]>([
    "kolay",
    "orta",
    "zor",
  ]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [randomOrder, setRandomOrder] = useState<boolean>(true);
  const [seconds, setSeconds] = useState<number>(30);
  const [autoClose, setAutoClose] = useState<boolean>(true);
  const [explanations, setExplanations] = useState<boolean>(true);
  const [leaderboard, setLeaderboard] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Eligible questions count
  const eligibleCount = allQuestions.filter(
    (q) => selectedUnits.includes(q.unit) && difficulties.includes(q.difficulty),
  ).length;

  const toggleUnit = (id: number) => {
    setSelectedUnits((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((u) => u !== id);
      }
      return [...prev, id].sort((a, b) => a - b);
    });
  };

  const toggleDifficulty = (d: "kolay" | "orta" | "zor") => {
    setDifficulties((prev) => {
      if (prev.includes(d)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((item) => item !== d);
      }
      return [...prev, d];
    });
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get or create teacher workspace capability
      const wsToken = localStorage.getItem("arena-workspace");
      let capData: { id: string; token: string } | null = null;
      if (wsToken) {
        try {
          capData = JSON.parse(wsToken);
        } catch {
          capData = null;
        }
      }

      if (!capData) {
        const wsRes = await classroomRequest({ data: { op: "workspace" } });
        if (wsRes.error || !wsRes.cap) {
          throw new Error(wsRes.error || "Öğretmen oturumu başlatılamadı.");
        }
        capData = wsRes.cap;
        localStorage.setItem("arena-workspace", JSON.stringify(capData));
      }

      const effectiveCount = Math.min(questionCount, eligibleCount);

      // 2. Create room
      const res = await classroomRequest({
        data: {
          op: "create",
          cap: capData,
          data: {
            mode: "live",
            settings: {
              units: selectedUnits,
              difficulties,
              count: effectiveCount,
              random: randomOrder,
              seconds,
              autoClose,
              explanations,
              leaderboard,
              steal: false,
              manualTurn: false,
            },
          },
        },
      });

      if (res.error || !res.room || !res.cap) {
        throw new Error(res.error || "Oda oluşturulamadı.");
      }

      // Save host capability
      saveCap(`host-${res.room.id}`, res.cap);
      saveCap(`host-${res.room.pin}`, res.cap);

      // Navigate to host dashboard
      navigate({ to: `/host/${res.room.pin}` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Oda oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Ana Sayfa
        </Link>
        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
          Canlı Kahoot Modu
        </span>
      </div>

      <div className="glass rounded-3xl p-6 sm:p-10 border-border shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/20 text-accent border border-accent/30">
            <Smartphone className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
              Canlı Yarışma Odası Oluştur
            </h1>
            <p className="text-sm text-muted-foreground">
              Öğrenciler telefonlarından karekod veya PIN ile katılır, ekrandan birlikte yarışır.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-8">
          {/* Unit Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span>1. Dahil Edilecek Üniteler</span>
                <span className="text-xs font-normal text-accent">
                  ({selectedUnits.length}/7 seçili)
                </span>
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedUnits([1, 2, 3, 4, 5, 6, 7])}
                  className="text-accent hover:underline"
                >
                  Tümünü Seç
                </button>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {units.map((u) => {
                const isSelected = selectedUnits.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUnit(u.id)}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all",
                      isSelected
                        ? "border-accent bg-accent/10 shadow-sm"
                        : "border-border/60 bg-secondary/30 hover:border-border hover:bg-secondary/60 text-muted-foreground",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid h-7 w-7 place-items-center rounded-lg text-xs font-bold font-display",
                          isSelected
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {u.id}
                      </span>
                      <span className="text-sm font-semibold">{u.name}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-accent shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block mb-3">
              2. Zorluk Seviyeleri
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  {
                    id: "kolay",
                    label: "Kolay",
                    pts: "5 Puan",
                    color: "border-success bg-success/10 text-success",
                  },
                  {
                    id: "orta",
                    label: "Orta",
                    pts: "10 Puan",
                    color: "border-warning bg-warning/10 text-warning",
                  },
                  {
                    id: "zor",
                    label: "Zor",
                    pts: "15 Puan",
                    color: "border-destructive bg-destructive/10 text-destructive",
                  },
                ] as const
              ).map((d) => {
                const isSelected = difficulties.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDifficulty(d.id)}
                    className={cn(
                      "p-4 rounded-2xl border text-center transition-all",
                      isSelected
                        ? d.color
                        : "border-border/60 bg-secondary/30 opacity-40 hover:opacity-75",
                    )}
                  >
                    <div className="font-display font-bold text-base">{d.label}</div>
                    <div className="text-xs mt-1 font-medium">{d.pts}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Count & Ordering */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  3. Soru Sayısı
                </label>
                <span className="text-xs text-accent font-semibold">
                  Maksimum {eligibleCount} uygun soru
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={Math.max(1, eligibleCount)}
                  value={Math.min(questionCount, eligibleCount)}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-accent h-2 bg-secondary rounded-lg"
                />
                <span className="font-display text-xl font-bold text-accent min-w-12 text-center">
                  {Math.min(questionCount, eligibleCount)}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {[5, 10, 15, 20, eligibleCount].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuestionCount(Math.min(n, eligibleCount))}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-lg border",
                      questionCount === n
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {n === eligibleCount ? "Tümü" : n}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Selection */}
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                4. Soru Başına Süre
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { s: 15, label: "15 sn" },
                  { s: 20, label: "20 sn" },
                  { s: 30, label: "30 sn" },
                  { s: 45, label: "45 sn" },
                  { s: 60, label: "60 sn" },
                  { s: 10, label: "10 sn" },
                  { s: 0, label: "Sınırsız" },
                ]
                  .slice(0, 4)
                  .map((t) => (
                    <button
                      key={t.s}
                      type="button"
                      onClick={() => setSeconds(t.s)}
                      className={cn(
                        "p-2.5 rounded-xl border text-center text-xs font-bold transition-all",
                        seconds === t.s
                          ? "border-accent bg-accent/15 text-accent shadow-sm"
                          : "border-border/60 bg-secondary/30 hover:border-border",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { s: 45, label: "45 sn" },
                  { s: 60, label: "60 sn" },
                  { s: 0, label: "Sınırsız" },
                ].map((t) => (
                  <button
                    key={t.s}
                    type="button"
                    onClick={() => setSeconds(t.s)}
                    className={cn(
                      "p-2.5 rounded-xl border text-center text-xs font-bold transition-all",
                      seconds === t.s
                        ? "border-accent bg-accent/15 text-accent shadow-sm"
                        : "border-border/60 bg-secondary/30 hover:border-border",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Game Rules & Toggles */}
          <div className="rounded-2xl border border-border/80 bg-secondary/20 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              5. Yarışma Kuralları
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center justify-between p-3 rounded-xl glass border-border/60 cursor-pointer">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span>Soruları Karışık Sırayla Sor</span>
                </span>
                <input
                  type="checkbox"
                  checked={randomOrder}
                  onChange={(e) => setRandomOrder(e.target.checked)}
                  className="rounded text-accent h-5 w-5 focus:ring-accent"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl glass border-border/60 cursor-pointer">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Herkes Cevaplayınca Otomatik Kapat</span>
                </span>
                <input
                  type="checkbox"
                  checked={autoClose}
                  onChange={(e) => setAutoClose(e.target.checked)}
                  className="rounded text-primary h-5 w-5 focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl glass border-border/60 cursor-pointer">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-electric" />
                  <span>Soru Sonrası Açıklamayı Göster</span>
                </span>
                <input
                  type="checkbox"
                  checked={explanations}
                  onChange={(e) => setExplanations(e.target.checked)}
                  className="rounded text-electric h-5 w-5 focus:ring-electric"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl glass border-border/60 cursor-pointer">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-warning" />
                  <span>Sorular Arası Liderlik Tablosu</span>
                </span>
                <input
                  type="checkbox"
                  checked={leaderboard}
                  onChange={(e) => setLeaderboard(e.target.checked)}
                  className="rounded text-warning h-5 w-5 focus:ring-warning"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading || eligibleCount === 0}
              className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-brand py-4 text-lg font-bold text-primary-foreground shadow-glow transition-all hover:scale-[1.01] hover:opacity-95 disabled:opacity-40"
            >
              {loading ? (
                <span>Oda Kuruluyor...</span>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current" />
                  <span>ODA OLUŞTUR VE LOBİYE GEÇ</span>
                </>
              )}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Oda kurulduktan sonra akıllı tahtada QR kod ve 6 haneli PIN gösterilecektir. Tek
              öğrenciyle dahi başlayabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
