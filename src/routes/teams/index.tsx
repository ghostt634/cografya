import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users,
  Play,
  Coins,
  ArrowLeft,
  ShoppingBag,
  Clock,
  RotateCcw,
  Check,
  Palette,
  Sparkles,
  Zap,
} from "lucide-react";
import { units } from "@/data/units";
import { classroomRequest } from "@/features/classroom/classroom.functions";
import { saveCap } from "@/features/classroom/storage";
import {
  TEAM_COLORS,
  DEFAULT_ACTIVE_JOKERS,
  JOKER_DETAILS,
  type JokerType,
} from "@/features/classroom/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teams/")({
  head: () => ({
    meta: [
      { title: "Grup Yarışması Kur — Coğrafya Arenası" },
      {
        name: "description",
        content: "Telefonsuz akıllı tahta grup yarışması: Takımları özelleştir, Jeopardy panosunu başlat.",
      },
    ],
  }),
  component: TeamsConfigScreen,
});

interface TeamDraft {
  name: string;
  members: string;
  color: string;
}

const DEFAULT_TEAM_TEMPLATES: TeamDraft[] = [
  { name: "Atlas Takımı", members: "", color: "emerald" },
  { name: "Coğrafya Kaşifleri", members: "", color: "cyan" },
  { name: "Mavi Gezegen", members: "", color: "amber" },
  { name: "Kutup Yıldızı", members: "", color: "purple" },
  { name: "Toros Kartalları", members: "", color: "coral" },
  { name: "Ekvator Rüzgarı", members: "", color: "pink" },
  { name: "Bozkır Kartalları", members: "", color: "blue" },
  { name: "Akdeniz Martıları", members: "", color: "teal" },
];

function TeamsConfigScreen() {
  const navigate = useNavigate();

  const [teamCount, setTeamCount] = useState<number>(3);
  const [teams, setTeams] = useState<TeamDraft[]>(DEFAULT_TEAM_TEMPLATES.slice(0, 3));
  const [activeTeamIndex, setActiveTeamIndex] = useState<number>(0);

  const [selectedUnits, setSelectedUnits] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [difficulties] = useState<("kolay" | "orta" | "zor")[]>([
    "kolay",
    "orta",
    "zor",
  ]);
  const [seconds, setSeconds] = useState<number>(30);
  const [coins, setCoins] = useState<boolean>(true);
  const [jokerShop, setJokerShop] = useState<boolean>(true);
  const [activeJokers, setActiveJokers] = useState<JokerType[]>([...DEFAULT_ACTIVE_JOKERS]);
  const [manualTurn, setManualTurn] = useState<boolean>(false);
  const [skipAnimations, setSkipAnimations] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateTeamCount = (count: number) => {
    const clamped = Math.max(2, Math.min(8, count));
    setTeamCount(clamped);
    setTeams((prev) => {
      const next = [...prev];
      while (next.length < clamped) {
        const fallback = DEFAULT_TEAM_TEMPLATES[next.length] || {
          name: `Takım ${next.length + 1}`,
          members: "",
          color: TEAM_COLORS[next.length % TEAM_COLORS.length].id,
        };
        next.push({ ...fallback });
      }
      return next.slice(0, clamped);
    });
    if (activeTeamIndex >= clamped) {
      setActiveTeamIndex(0);
    }
  };

  const updateTeamField = (index: number, field: keyof TeamDraft, val: string) => {
    setTeams((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const toggleJoker = (jokerKey: JokerType) => {
    setActiveJokers((prev) =>
      prev.includes(jokerKey)
        ? prev.length > 1
          ? prev.filter((j) => j !== jokerKey)
          : prev
        : [...prev, jokerKey],
    );
  };

  const handleStartGame = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate team names
      const trimmed = teams.map((t) => ({
        name: t.name.trim(),
        members: t.members
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
        color: t.color,
      }));

      if (trimmed.some((t) => !t.name)) {
        throw new Error("Lütfen tüm takımlara bir isim verin.");
      }
      const unique = new Set(trimmed.map((t) => t.name.toLocaleLowerCase("tr")));
      if (unique.size !== trimmed.length) {
        throw new Error("Takım isimleri birbirinden farklı olmalıdır.");
      }

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

      // 2. Create teams room
      const res = await classroomRequest({
        data: {
          op: "create",
          cap: capData,
          data: {
            mode: "teams",
            active: activeTeamIndex,
            settings: {
              units: selectedUnits,
              difficulties,
              count: 42,
              random: false,
              seconds,
              explanations: true,
              autoClose: true,
              leaderboard: true,
              steal: false, // Çalma hakkı kesinlikle kaldırıldı
              manualTurn,
              coins,
              jokerShop,
              activeJokersList: activeJokers,
              skipAnimations,
              sound: false,
            },
            teams: trimmed,
          },
        },
      });

      if (res.error || !res.room || !res.cap) {
        throw new Error(res.error || "Grup yarışması başlatılamadı.");
      }

      // Save capability
      saveCap(`host-${res.room.id}`, res.cap);
      saveCap(`host-${res.room.pin}`, res.cap);

      navigate({ to: `/teams/${res.room.id}` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Grup yarışması başlatılamadı.");
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
        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
          Telefonsuz Akıllı Tahta Modu
        </span>
      </div>

      <div className="glass rounded-3xl p-6 sm:p-10 border-border shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Users className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Grup Yarışması Ayarları
            </h1>
            <p className="text-sm text-muted-foreground">
              Öğrencilerin telefona ihtiyacı yoktur. Tüm takımlar sınıf tahtasından yarışır.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-8">
          {/* 1. Takım Sayısı ve Özelleştirme */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                1. Takım Sayısı ve Özelleştirme (2 – 8 Takım)
              </label>
              <div className="flex items-center gap-1.5">
                {[2, 3, 4, 5, 6, 8].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateTeamCount(c)}
                    className={cn(
                      "h-8 w-8 rounded-lg font-bold text-xs border transition-all",
                      teamCount === c
                        ? "border-emerald-500 bg-emerald-500 text-slate-950 shadow-sm"
                        : "border-border bg-secondary/30 hover:border-border text-muted-foreground",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Team input list */}
            <div className="grid gap-3 sm:grid-cols-2">
              {teams.map((t, i) => {
                const colorObj =
                  TEAM_COLORS.find((tc) => tc.id === t.color) || TEAM_COLORS[i % TEAM_COLORS.length];
                const isFirst = activeTeamIndex === i;

                return (
                  <div
                    key={i}
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all space-y-2.5",
                      isFirst
                        ? `${colorObj.borderClass} ${colorObj.bgClass} ring-1`
                        : "border-border/60 bg-secondary/25",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-xl font-bold text-xs text-white"
                        style={{ backgroundColor: colorObj.hex }}
                      >
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={t.name}
                        onChange={(e) => updateTeamField(i, "name", e.target.value)}
                        placeholder={`Takım ${i + 1} İsmi`}
                        maxLength={30}
                        className="flex-1 bg-transparent text-sm font-bold text-foreground focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setActiveTeamIndex(i)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors shrink-0",
                          isFirst
                            ? "bg-emerald-500 text-slate-950"
                            : "text-muted-foreground hover:text-foreground bg-secondary/50",
                        )}
                        title="Yarışmaya ilk başlayacak takım"
                      >
                        {isFirst ? "İlk Başlayan" : "Sıra Ver"}
                      </button>
                    </div>

                    {/* Üyeler ve Renk Seçimi */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                      <input
                        type="text"
                        value={t.members}
                        onChange={(e) => updateTeamField(i, "members", e.target.value)}
                        placeholder="Öğrenci üyeleri (isteğe bağlı)..."
                        maxLength={80}
                        className="text-xs bg-transparent text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none flex-1"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        {TEAM_COLORS.map((tc) => (
                          <button
                            key={tc.id}
                            type="button"
                            onClick={() => updateTeamField(i, "color", tc.id)}
                            className={cn(
                              "w-4 h-4 rounded-full transition-transform hover:scale-125",
                              t.color === tc.id && "ring-2 ring-white scale-110",
                            )}
                            style={{ backgroundColor: tc.hex }}
                            title={tc.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Yarışılacak Üniteler */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                2. Yarışılacak Üniteler ({selectedUnits.length}/7)
              </label>
              <button
                type="button"
                onClick={() => setSelectedUnits([1, 2, 3, 4, 5, 6, 7])}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                Tümünü Dahil Et
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {units.map((u) => {
                const isSelected = selectedUnits.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUnits((prev) =>
                        prev.includes(u.id)
                          ? prev.length > 1
                            ? prev.filter((id) => id !== u.id)
                            : prev
                          : [...prev, u.id].sort((a, b) => a - b),
                      );
                    }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border text-left text-xs font-semibold transition-all",
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/10 text-foreground"
                        : "border-border/60 bg-secondary/20 text-muted-foreground",
                    )}
                  >
                    <span>
                      {u.id}. {u.name}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Joker Seçimi — Öğretmen Hangi Jokerlerin Aktif Olacağını Belirler */}
          <div className="rounded-2xl border border-border/80 bg-secondary/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-amber-400" />
                  <span>3. Joker Mağazası Seçenekleri ({activeJokers.length}/6 Aktif)</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Yarışmada takımların satın alabileceği jokerleri belirleyin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveJokers([...DEFAULT_ACTIVE_JOKERS])}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Tümünü Aç
              </button>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {(Object.keys(JOKER_DETAILS) as JokerType[]).map((jKey) => {
                const j = JOKER_DETAILS[jKey];
                const isChecked = activeJokers.includes(jKey);
                return (
                  <label
                    key={jKey}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                      isChecked
                        ? "border-amber-500/50 bg-amber-500/10"
                        : "border-border/60 bg-secondary/20 opacity-60",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleJoker(jKey)}
                        className="rounded text-amber-500 h-4 w-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-2">
                          <span>{j.name}</span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            {j.price} Coin
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {j.description}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Oyun Dinamikleri ve Süre */}
          <div className="rounded-2xl border border-border/80 bg-secondary/20 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              4. Oyun Dinamikleri ve Sunum
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl glass border-border/60 cursor-pointer">
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-400" />
                    <span>Altın Ekonomisi</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Hızlı cevaba +10 ile +30 coin kazandırır
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={coins}
                  onChange={(e) => setCoins(e.target.checked)}
                  className="rounded text-amber-400 h-5 w-5"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl glass border-border/60 cursor-pointer">
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-cyan-400" />
                    <span>Manuel Sıra Değişimi</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Öğretmenin sıradaki takımı seçmesine izin ver
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={manualTurn}
                  onChange={(e) => setManualTurn(e.target.checked)}
                  className="rounded text-cyan-400 h-5 w-5"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl glass border-border/60 cursor-pointer">
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    <span>Animasyonları Atla</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Giriş ve geçiş animasyonlarını devre dışı bırak
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={skipAnimations}
                  onChange={(e) => setSkipAnimations(e.target.checked)}
                  className="rounded text-emerald-400 h-5 w-5"
                />
              </label>
            </div>

            {/* Timer setting */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Soru Başına Süre:</span>
              </span>
              <div className="flex gap-1.5">
                {[
                  { s: 20, l: "20 sn" },
                  { s: 30, l: "30 sn" },
                  { s: 45, l: "45 sn" },
                  { s: 60, l: "60 sn" },
                  { s: 0, l: "Sınırsız" },
                ].map((t) => (
                  <button
                    key={t.s}
                    type="button"
                    onClick={() => setSeconds(t.s)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors",
                      seconds === t.s
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                        : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartGame}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-500 py-4 text-xl font-bold text-slate-950 shadow-glow transition-all hover:scale-[1.01] hover:opacity-95"
            >
              <Play className="h-6 w-6 fill-current" />
              <span>{loading ? "Yarışma Kuruluyor..." : "GRUP YARIŞMASINI BAŞLAT"}</span>
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Doğrudan Jeopardy soru panosu ve oyun gösterisi girişi açılacaktır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
