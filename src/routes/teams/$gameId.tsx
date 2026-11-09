import { createFileRoute, useParams, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Users,
  Trophy,
  Coins,
  ShoppingBag,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Maximize,
  Minimize,
  Lightbulb,
  ShieldAlert,
  Edit3,
  HelpCircle,
  Download,
  Home,
  Check,
  AlertCircle,
} from "lucide-react";
import { units, unitById } from "@/data/units";
import { classroomRequest } from "@/features/classroom/classroom.functions";
import { loadCap } from "@/features/classroom/storage";
import type { RoomView, Capability, Team, JokerType } from "@/features/classroom/types";
import { LETTERS, DIFF_LABEL } from "@/lib/quiz";
import type { Letter } from "@/data/questions";
import { soundFx } from "@/lib/sound";
import { JOKER_DETAILS, JOKER_PRICES } from "@/features/classroom/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teams/$gameId")({
  head: () => ({
    meta: [
      { title: "Akıllı Tahta Grup Yarışması — Coğrafya Arenası" },
      { name: "description", content: "Sınıf akıllı tahtası Jeopardy grup yarışması ekranı." },
    ],
  }),
  component: SmartboardGameScreen,
});

function SmartboardGameScreen() {
  const { gameId } = useParams({ from: "/teams/$gameId" });
  const navigate = useNavigate();

  const [room, setRoom] = useState<RoomView | null>(null);
  const [cap, setCap] = useState<Capability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Intro animation states (3, 2, 1, GO)
  const [showIntro, setShowIntro] = useState(true);
  const [introStep, setIntroStep] = useState<number>(0);

  // Question interaction states
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [secondLetter, setSecondLetter] = useState<Letter | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Joker shop modal & confirmation
  const [showShopModal, setShowShopModal] = useState(false);
  const [buyingJoker, setBuyingJoker] = useState<JokerType | null>(null);

  // Score adjustment modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustTeamId, setAdjustTeamId] = useState<string>("");
  const [adjustDelta, setAdjustDelta] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>("Öğretmen Puan Düzenlemesi");

  const boardRef = useRef<HTMLDivElement>(null);

  // Load capability
  useEffect(() => {
    const storedCap = loadCap(`host-${gameId}`);
    if (storedCap) {
      setCap(storedCap);
    } else {
      setError("Bu yarışmayı yönetmek için oturum bulunamadı.");
    }
  }, [gameId]);

  // Polling room state every 1000ms
  useEffect(() => {
    if (!cap) return;
    let isMounted = true;

    const fetchView = async () => {
      try {
        const res = await classroomRequest({
          data: {
            op: "view",
            key: gameId,
            cap,
            data: { role: "host" },
          },
        });

        if (!isMounted) return;
        if (res.error) {
          setError(res.error);
        } else if (res.room) {
          setRoom(res.room);
          setError(null);
        }
      } catch (err) {
        if (isMounted) console.warn("[TeamsPolling] error", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchView();
    const interval = setInterval(fetchView, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [gameId, cap]);

  // Intro animation sequence (3, 2, 1)
  useEffect(() => {
    if (!showIntro) return;
    const t1 = setTimeout(() => setIntroStep(1), 800);
    const t2 = setTimeout(() => setIntroStep(2), 1800);
    const t3 = setTimeout(() => setIntroStep(3), 2800);
    const t4 = setTimeout(() => {
      setIntroStep(4);
      soundFx.fanfare();
    }, 3800);
    const t5 = setTimeout(() => setShowIntro(false), 5200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [showIntro]);

  // Countdown timer
  useEffect(() => {
    if (!room?.deadline || room.paused || room.phase !== "open") {
      setTimeLeft(null);
      return;
    }
    const update = () => {
      const remaining = Math.max(0, Math.ceil((Date.parse(room.deadline!) - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 5 && remaining > 0) {
        soundFx.tick();
      }
    };
    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [room?.deadline, room?.paused, room?.phase]);

  // Reset selections on index change
  useEffect(() => {
    setSelectedLetter(null);
    setSecondLetter(null);
  }, [room?.index]);

  // Sound triggers on state changes
  useEffect(() => {
    if (room?.lastCoinAward) {
      soundFx.coin();
    }
  }, [room?.lastCoinAward?.timestamp]);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      boardRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleAction = async (action: string, extra: Record<string, unknown> = {}) => {
    if (!cap) return;
    try {
      const res = await classroomRequest({
        data: {
          op: "action",
          key: gameId,
          cap,
          data: {
            role: "host",
            action,
            ...extra,
          },
        },
      });

      if (res.error) {
        setError(res.error);
        soundFx.incorrect();
      } else if (res.room) {
        setRoom(res.room);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    }
  };

  // Option selection on smartboard
  const handleOptionTap = (letter: Letter) => {
    const isDouble = room?.activeJokers?.doubleAnswer;
    if (isDouble) {
      if (!selectedLetter) {
        setSelectedLetter(letter);
      } else if (selectedLetter === letter) {
        setSelectedLetter(null);
      } else if (!secondLetter) {
        setSecondLetter(letter);
      } else if (secondLetter === letter) {
        setSecondLetter(null);
      } else {
        setSecondLetter(letter);
      }
    } else {
      setSelectedLetter(letter);
      setSecondLetter(null);
    }
  };

  // Submit Answer on Smartboard
  const handleConfirmTeamAnswer = () => {
    if (!selectedLetter) return;
    handleAction("teamAnswer", { choice: selectedLetter });
  };

  // Buy Joker
  const handleBuyJokerConfirm = (joker: JokerType) => {
    handleAction("buyJoker", { joker });
    setShowShopModal(false);
    setBuyingJoker(null);
    soundFx.joker();
  };

  // Use Joker
  const handleUseJoker = (joker: JokerType) => {
    handleAction("useJoker", { joker });
    soundFx.joker();
  };

  // CSV export
  const exportResultsCSV = () => {
    if (!room) return;
    const rows = [
      [
        "Sıra",
        "Takım Adı",
        "Toplam Skor",
        "Kazanılan Altın",
        "Harcanan Altın",
        "Kullanılan Jokerler",
        "Doğru Sayısı",
      ],
      ...room.teams.map((t) => [
        t.rank,
        `"${t.name.replace(/"/g, '""')}"`,
        t.score,
        t.coinsEarned ?? 0,
        t.coinsSpent ?? 0,
        t.jokersUsed ?? 0,
        t.correct,
      ]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Cografya-Arenasi-Grup-Yarismasi-${room.pin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-r-transparent mb-4" />
        <p className="text-muted-foreground font-semibold">Grup yarışması yükleniyor...</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="py-16 max-w-md mx-auto text-center">
        <div className="p-6 rounded-3xl glass border-destructive/40 text-destructive mb-6">
          <AlertCircle className="h-10 w-10 mx-auto mb-3" />
          <h2 className="text-xl font-bold">Oyun Açılamadı</h2>
          <p className="mt-2 text-sm text-foreground/80">{error}</p>
        </div>
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-primary-foreground"
        >
          Yeni Grup Yarışması Kur
        </Link>
      </div>
    );
  }

  if (!room) return null;

  const currentQ = room.question;
  const activeTeam = room.teams[room.active] || room.teams[0];

  return (
    <div
      ref={boardRef}
      className={cn(
        "py-4 transition-all relative",
        isFullscreen && "min-h-screen bg-[#08111F] text-foreground p-6 overflow-y-auto",
      )}
    >
      {/* 1. INTRO ANIMATION OVERLAY */}
      {showIntro && (
        <div className="fixed inset-0 z-50 bg-[#08111F]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none animate-rise">
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="absolute top-6 right-6 glass px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            Animasyonu Geç
          </button>

          <p className="text-accent font-display text-sm uppercase tracking-widest font-extrabold mb-4">
            Coğrafya Arenası · Akıllı Tahta Grup Yarışması
          </p>

          {introStep < 4 ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-center gap-4">
                {room.teams.map((t, idx) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl glass border-primary/40 bg-secondary/60 text-center min-w-36 animate-pulse"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <div className="text-xs text-muted-foreground font-bold">Takım {idx + 1}</div>
                    <div className="font-display text-xl font-black text-foreground mt-1">
                      {t.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Countdown Numbers */}
              <div className="font-display text-8xl sm:text-9xl font-black text-gradient my-6 animate-ping">
                {introStep === 0 ? "3" : introStep === 1 ? "2" : introStep === 2 ? "1" : "3"}
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-bounce">
              <h1 className="font-display text-5xl sm:text-7xl font-black text-gradient">
                YARIŞMA BAŞLIYOR!
              </h1>
              <p className="text-xl font-bold text-foreground/90">
                İlk Sırada: <span className="text-accent font-extrabold">{activeTeam?.name}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Top Smartboard Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-display font-extrabold text-xl text-gradient">
            Coğrafya Arenası
          </Link>
          <span className="rounded-lg bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
            Akıllı Tahta Grup Modu
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAction("undo")}
            className="inline-flex items-center gap-1.5 rounded-xl glass px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
            title="Son Hamleyi Geri Al"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Geri Al</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAdjustModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl glass px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
            title="Öğretmen Skor Düzenlemesi"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Puan Düzenle</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 rounded-xl glass px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            {isFullscreen ? (
              <Minimize className="h-3.5 w-3.5" />
            ) : (
              <Maximize className="h-3.5 w-3.5" />
            )}
            <span>{isFullscreen ? "Küçült" : "Tam Ekran"}</span>
          </button>
        </div>
      </div>

      {/* TEAM SCOREBOARD BAR */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {room.teams.map((t, idx) => {
          const isActive = room.active === idx;
          return (
            <div
              key={t.id}
              onClick={() => {
                if (room.settings.manualTurn && room.phase === "board") {
                  handleAction("turn", { team: t.id });
                }
              }}
              className={cn(
                "p-3 rounded-2xl border transition-all relative flex flex-col justify-between",
                isActive
                  ? "border-accent bg-accent/15 ring-2 ring-accent shadow-glow scale-[1.02]"
                  : "border-border/60 bg-secondary/30 hover:border-border",
                room.settings.manualTurn && room.phase === "board" && "cursor-pointer",
              )}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground mb-1">
                  <span>#{t.rank}</span>
                  {isActive && <span className="text-accent animate-pulse">SIRA</span>}
                </div>
                <div
                  className="font-display text-sm font-bold truncate text-foreground"
                  title={t.name}
                >
                  {t.name}
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between">
                <span className="font-mono text-base font-extrabold text-foreground">
                  {t.score} P
                </span>
                {room.settings.coins && (
                  <span className="flex items-center gap-1 font-mono text-xs font-bold text-warning">
                    <Coins className="h-3 w-3 text-warning" />
                    <span>{t.coins}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Team Banner (during board phase) */}
      {room.phase === "board" && activeTeam && (
        <div className="mb-5 p-4 rounded-2xl glass border-accent/40 bg-accent/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground font-display font-extrabold">
              {room.active + 1}
            </span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-accent">
                SIRA SENDE!
              </div>
              <div className="font-display text-xl font-extrabold text-foreground">
                {activeTeam.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground hidden sm:inline">
              Panodan dilediğiniz bir soru kutucuğuna dokunun:
            </p>
            {room.settings.jokerShop && (
              <button
                type="button"
                onClick={() => setShowShopModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2 text-xs font-bold text-stone-900 shadow-md hover:opacity-95"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Joker Mağazası ({activeTeam.coins} Altın)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* JEOPARDY QUESTION SELECTION BOARD */}
      {room.phase === "board" && (
        <div className="glass rounded-3xl p-4 sm:p-6 border-border shadow-2xl overflow-x-auto">
          <div className="min-w-[800px] grid grid-cols-7 gap-3">
            {units.map((u) => {
              const unitQs = room.board.filter((b) => b.unit === u.id);
              return (
                <div key={u.id} className="flex flex-col gap-2.5">
                  {/* Column Header */}
                  <div className="h-16 rounded-xl border border-border/80 bg-secondary/50 p-2 flex flex-col items-center justify-center text-center">
                    <span className="font-mono text-xs font-extrabold text-accent">
                      ÜNİTE {u.id}
                    </span>
                    <span className="text-[11px] font-semibold text-foreground/80 leading-tight line-clamp-2">
                      {u.name}
                    </span>
                  </div>

                  {/* 6 Tiles per unit */}
                  {unitQs.map((q) => {
                    const isUsed = room.used.includes(q.id);
                    return (
                      <button
                        key={q.id}
                        type="button"
                        disabled={isUsed}
                        onClick={() => handleAction("tile", { questionId: q.id })}
                        className={cn(
                          "h-14 rounded-xl border flex flex-col items-center justify-center transition-all select-none font-display",
                          isUsed
                            ? "border-border/30 bg-secondary/20 text-muted-foreground/30 line-through cursor-not-allowed opacity-30"
                            : q.difficulty === "kolay"
                              ? "border-success/50 bg-success/15 text-success hover:scale-[1.03] hover:bg-success/25 hover:shadow-glow cursor-pointer"
                              : q.difficulty === "orta"
                                ? "border-warning/50 bg-warning/15 text-warning hover:scale-[1.03] hover:bg-warning/25 hover:shadow-glow cursor-pointer"
                                : "border-destructive/50 bg-destructive/15 text-destructive hover:scale-[1.03] hover:bg-destructive/25 hover:shadow-glow cursor-pointer",
                        )}
                      >
                        <span className="text-base font-extrabold">+{q.points}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider">
                          {DIFF_LABEL[q.difficulty]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. FULLSCREEN QUESTION INTERFACE */}
      {(room.phase === "open" || room.phase === "closed" || room.phase === "steal") && currentQ && (
        <div className="glass rounded-3xl p-6 sm:p-10 border-border shadow-2xl space-y-6">
          {/* Header HUD: Active Team & Timer */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent">
                {room.phase === "steal" ? "ÇALMA AŞAMASI" : "SORU AÇIK"}
              </span>
              <span className="font-display text-xl font-bold text-foreground">
                Sıra:{" "}
                <span className="text-gradient">
                  {room.stealing
                    ? room.teams.find((t) => t.id === room.stealing)?.name
                    : activeTeam.name}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {room.phase === "open" && timeLeft !== null && (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-2xl px-4 py-2 font-mono font-extrabold text-xl",
                    timeLeft <= 5
                      ? "bg-destructive/20 text-destructive animate-pulse"
                      : "bg-accent/15 text-accent",
                  )}
                >
                  <Clock className="h-5 w-5" />
                  <span>{timeLeft} sn</span>
                </div>
              )}

              {/* Cancel Button before confirmation */}
              {room.phase === "open" && !selectedLetter && (
                <button
                  type="button"
                  onClick={() => handleAction("cancelTile")}
                  className="rounded-xl glass px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
                >
                  Soruyu İptal Et (Panoya Dön)
                </button>
              )}
            </div>
          </div>

          {/* Question Text */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground mb-2">
              <span>{unitById(currentQ.unit)?.name}</span>
              <span>·</span>
              <span
                className={cn(
                  currentQ.difficulty === "kolay"
                    ? "text-success"
                    : currentQ.difficulty === "orta"
                      ? "text-warning"
                      : "text-destructive",
                )}
              >
                {DIFF_LABEL[currentQ.difficulty]} (+{currentQ.points} Puan)
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold leading-snug text-foreground">
              {currentQ.question}
            </h2>
          </div>

          {/* JOKER ACTIONS BAR (while open) */}
          {room.phase === "open" && room.settings.jokerShop && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-secondary/30 border border-border/60">
              <span className="text-xs font-bold text-muted-foreground mr-1">
                Aktif Takım Jokerleri:
              </span>

              {/* Double Answer */}
              <button
                type="button"
                disabled={
                  Boolean(room.activeJokers?.doubleAnswer) ||
                  (activeTeam.jokers?.doubleAnswer ?? 0) < 1
                }
                onClick={() => handleUseJoker("doubleAnswer")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                  room.activeJokers?.doubleAnswer
                    ? "border-accent bg-accent text-accent-foreground shadow-sm"
                    : (activeTeam.jokers?.doubleAnswer ?? 0) > 0
                      ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
                      : "border-border/40 opacity-40 cursor-not-allowed",
                )}
              >
                Çift Cevap ({activeTeam.jokers?.doubleAnswer ?? 0})
              </button>

              {/* 50-50 */}
              <button
                type="button"
                disabled={
                  Boolean(room.activeJokers?.eliminatedOptions) ||
                  (activeTeam.jokers?.halfAndHalf ?? 0) < 1
                }
                onClick={() => handleUseJoker("halfAndHalf")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                  room.activeJokers?.eliminatedOptions
                    ? "border-accent bg-accent text-accent-foreground shadow-sm"
                    : (activeTeam.jokers?.halfAndHalf ?? 0) > 0
                      ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
                      : "border-border/40 opacity-40 cursor-not-allowed",
                )}
              >
                Yarı Yarıya ({activeTeam.jokers?.halfAndHalf ?? 0})
              </button>

              {/* Extra Time */}
              <button
                type="button"
                disabled={
                  Boolean(room.activeJokers?.extraTime) || (activeTeam.jokers?.extraTime ?? 0) < 1
                }
                onClick={() => handleUseJoker("extraTime")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                  room.activeJokers?.extraTime
                    ? "border-accent bg-accent text-accent-foreground shadow-sm"
                    : (activeTeam.jokers?.extraTime ?? 0) > 0
                      ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
                      : "border-border/40 opacity-40 cursor-not-allowed",
                )}
              >
                Ek Süre +20s ({activeTeam.jokers?.extraTime ?? 0})
              </button>

              {/* Hint */}
              <button
                type="button"
                disabled={
                  Boolean(room.activeJokers?.hintRevealed) || (activeTeam.jokers?.hint ?? 0) < 1
                }
                onClick={() => handleUseJoker("hint")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                  room.activeJokers?.hintRevealed
                    ? "border-accent bg-accent text-accent-foreground shadow-sm"
                    : (activeTeam.jokers?.hint ?? 0) > 0
                      ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
                      : "border-border/40 opacity-40 cursor-not-allowed",
                )}
              >
                İpucu ({activeTeam.jokers?.hint ?? 0})
              </button>

              {/* Open Joker Shop */}
              <button
                type="button"
                onClick={() => setShowShopModal(true)}
                className="ml-auto flex items-center gap-1 text-xs font-bold text-warning hover:underline"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Joker Satın Al</span>
              </button>
            </div>
          )}

          {/* Hint Card if revealed */}
          {room.activeJokers?.hintRevealed && currentQ.hint && (
            <div className="p-4 rounded-2xl border border-accent/40 bg-accent/10 text-sm text-foreground flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-accent">Öğretmen İpucu: </span>
                <span>{currentQ.hint}</span>
              </div>
            </div>
          )}

          {/* Five Answer Choices A - E */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            {currentQ.options.map((opt, i) => {
              const letter = LETTERS[i];
              const isEliminated = room.activeJokers?.eliminatedOptions?.includes(letter);
              const isSelected = selectedLetter === letter || secondLetter === letter;
              const isRevealedCorrect =
                room.phase === "closed" && currentQ.correctAnswer === letter;

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={room.phase === "closed" || Boolean(isEliminated)}
                  onClick={() => handleOptionTap(letter)}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border text-left transition-all text-lg",
                    isEliminated
                      ? "opacity-20 line-through border-dashed border-border cursor-not-allowed bg-transparent"
                      : isRevealedCorrect
                        ? "border-success bg-success/20 ring-4 ring-success font-bold text-foreground shadow-glow"
                        : isSelected
                          ? "border-accent bg-accent/25 ring-2 ring-accent font-bold text-foreground shadow-glow"
                          : "border-border bg-secondary/50 hover:border-accent/60 hover:bg-secondary text-foreground/90 cursor-pointer",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display font-extrabold text-xl",
                      isRevealedCorrect
                        ? "bg-success text-primary-foreground"
                        : isSelected
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {letter}
                  </span>
                  <span className="flex-1 font-medium leading-snug">{opt}</span>
                  {isRevealedCorrect && <CheckCircle2 className="h-7 w-7 text-success shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Bottom Confirmation or Next Action Bar */}
          <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
            {room.phase === "open" ? (
              <div className="w-full flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">
                  Seçilen Seçenek:{" "}
                  <span className="font-mono font-bold text-accent text-lg">
                    {selectedLetter || "Henüz seçilmedi"}
                    {secondLetter ? ` & ${secondLetter}` : ""}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={handleConfirmTeamAnswer}
                  disabled={!selectedLetter}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand px-8 py-4 font-extrabold text-lg text-primary-foreground shadow-glow transition-all hover:scale-[1.02] disabled:opacity-40"
                >
                  <Check className="h-6 w-6" />
                  <span>CEVABI ONAYLA</span>
                </button>
              </div>
            ) : room.phase === "steal" ? (
              /* Answer Stealing Phase */
              <div className="w-full p-4 rounded-2xl border border-warning/50 bg-warning/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-warning flex items-center gap-2 text-base">
                    <ShieldAlert className="h-5 w-5" />
                    <span>Çalma Hakkı Devrede! Hangi takım çalacak?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAction("skipSteal")}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground underline"
                  >
                    Çalmayı Pas Geç
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {room.teams
                    .filter((t) => t.id !== activeTeam.id)
                    .map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleAction("steal", { team: t.id })}
                        className="px-4 py-2 rounded-xl bg-warning/20 border border-warning/40 font-bold text-xs text-warning hover:bg-warning/30 transition-colors"
                      >
                        {t.name} Çalsın
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              /* Question Closed: Show Explanation & Return to Board */
              <div className="w-full space-y-4">
                {currentQ.explanation && (
                  <div className="p-4 rounded-2xl border border-success/30 bg-success/10 text-sm text-foreground">
                    <div className="font-bold text-success flex items-center gap-1.5 mb-1">
                      <Lightbulb className="h-4 w-4" />
                      <span>Eğitici Çözüm:</span>
                    </div>
                    <p className="leading-relaxed">{currentQ.explanation}</p>
                  </div>
                )}

                {/* Coin Reward Banner if awarded */}
                {room.lastCoinAward && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 flex items-center justify-between animate-rise">
                    <div className="flex items-center gap-3">
                      <Coins className="h-6 w-6 text-warning animate-bounce" />
                      <div>
                        <div className="font-bold text-warning text-sm">
                          Hızlı Cevap Ödülü: +{room.lastCoinAward.amount} Altın!
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {room.lastCoinAward.teamName} soruyu {room.lastCoinAward.seconds} saniyede
                          doğru yanıtladı.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAction("board")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand px-8 py-3.5 font-extrabold text-base text-primary-foreground shadow-glow hover:scale-[1.02] transition-transform"
                  >
                    <span>Panoya Dön (Sıradaki Takım)</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. JOKER SHOP MODAL */}
      {showShopModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-rise">
          <div className="glass rounded-3xl p-6 sm:p-8 border-border max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-6 w-6 text-warning" />
                <h3 className="font-display text-xl font-bold">Joker Mağazası</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShopModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                Kapat
              </button>
            </div>

            <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-center justify-between">
              <span className="text-sm font-semibold">{activeTeam.name}</span>
              <span className="flex items-center gap-1.5 font-mono font-bold text-warning text-base">
                <Coins className="h-4 w-4" />
                <span>{activeTeam.coins} Altın</span>
              </span>
            </div>

            <div className="space-y-3">
              {(Object.keys(JOKER_DETAILS) as JokerType[]).map((jKey) => {
                const j = JOKER_DETAILS[jKey];
                const canAfford = activeTeam.coins >= j.price;
                return (
                  <div
                    key={jKey}
                    className="p-4 rounded-2xl border border-border bg-secondary/30 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-sm text-foreground flex items-center gap-2">
                        <span>{j.name}</span>
                        <span className="font-mono text-xs font-bold text-warning">
                          ({j.price} Altın)
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{j.description}</div>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleBuyJokerConfirm(jKey)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0",
                        canAfford
                          ? "bg-warning text-stone-900 hover:opacity-90 shadow-sm"
                          : "bg-secondary text-muted-foreground opacity-40 cursor-not-allowed",
                      )}
                    >
                      Satın Al
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. SCORE ADJUSTMENT MODAL */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-rise">
          <div className="glass rounded-3xl p-6 sm:p-8 border-border max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="font-display text-xl font-bold">Öğretmen Skor Düzenlemesi</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                  Takım Seçin:
                </label>
                <select
                  value={adjustTeamId || activeTeam.id}
                  onChange={(e) => setAdjustTeamId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary p-3 text-sm font-semibold"
                >
                  {room.teams.map((t) => (
                    <option key={t.id} value={t.id} className="bg-popover">
                      {t.name} (Mevcut: {t.score} P)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                  Eklenecek / Çıkarılacak Puan (-50 ile +50):
                </label>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-secondary p-3 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                  Gerekçe:
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary p-3 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-2 rounded-xl glass text-xs font-bold"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAction("adjust", {
                    team: adjustTeamId || activeTeam.id,
                    delta: adjustDelta,
                    reason: adjustReason,
                  });
                  setShowAdjustModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-brand text-xs font-bold text-primary-foreground"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FINAL RESULTS SCREEN */}
      {room.phase === "finished" && (
        <div className="glass rounded-3xl p-8 sm:p-12 border-border shadow-2xl text-center space-y-8 animate-rise">
          <div className="mx-auto mb-2 grid h-20 w-20 place-items-center rounded-3xl bg-warning/20 text-warning border border-warning/40 shadow-glow animate-bounce">
            <Trophy className="h-10 w-10" />
          </div>
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-black text-foreground">
              Yarışma Bitti!
            </h1>
            <p className="mt-2 text-muted-foreground text-base">
              Şampiyon:{" "}
              <span className="text-warning font-bold text-xl">{room.teams[0]?.name}</span>
            </p>
          </div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-4 py-6">
            {room.teams[1] && (
              <div className="flex flex-col items-center">
                <div className="font-bold text-sm mb-2">{room.teams[1].name}</div>
                <div className="h-32 w-28 rounded-t-2xl bg-secondary/80 border-t-4 border-slate-400 flex flex-col items-center justify-center p-2">
                  <span className="font-display text-2xl font-bold text-slate-300">2.</span>
                  <span className="font-mono font-bold text-sm text-foreground">
                    {room.teams[1].score} P
                  </span>
                </div>
              </div>
            )}

            {room.teams[0] && (
              <div className="flex flex-col items-center">
                <div className="font-extrabold text-base mb-2 text-warning flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>{room.teams[0].name}</span>
                </div>
                <div className="h-44 w-32 rounded-t-2xl bg-warning/20 border-t-4 border-warning flex flex-col items-center justify-center p-2 shadow-glow">
                  <span className="font-display text-4xl font-extrabold text-warning">1.</span>
                  <span className="font-mono font-extrabold text-lg text-foreground mt-1">
                    {room.teams[0].score} P
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {room.teams[0].coins} Altın
                  </span>
                </div>
              </div>
            )}

            {room.teams[2] && (
              <div className="flex flex-col items-center">
                <div className="font-bold text-sm mb-2">{room.teams[2].name}</div>
                <div className="h-24 w-28 rounded-t-2xl bg-secondary/80 border-t-4 border-amber-600 flex flex-col items-center justify-center p-2">
                  <span className="font-display text-2xl font-bold text-amber-500">3.</span>
                  <span className="font-mono font-bold text-sm text-foreground">
                    {room.teams[2].score} P
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Full Table */}
          <div className="max-w-2xl mx-auto rounded-2xl border border-border/80 overflow-hidden text-sm">
            <div className="bg-secondary/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
              <span>Sıra / Takım</span>
              <span>Skor / Altın / Joker</span>
            </div>
            <div className="divide-y divide-border/60">
              {room.teams.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-accent min-w-6">#{t.rank}</span>
                    <span className="font-semibold">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-warning">{t.coins} Altın</span>
                    <span className="font-mono font-extrabold text-success">{t.score} P</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={exportResultsCSV}
              className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-semibold text-sm hover:bg-secondary"
            >
              <Download className="h-4 w-4" />
              <span>Sonuçları CSV İndir</span>
            </button>

            <Link
              to="/teams"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-primary-foreground shadow-glow"
            >
              <RotateCcw className="h-4 w-4" />
              <span>YENİ GRUP YARIŞMASI</span>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-semibold text-sm hover:bg-secondary"
            >
              <Home className="h-4 w-4" />
              <span>ANA SAYFA</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
