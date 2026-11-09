import { createFileRoute, useParams, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import {
  Users,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Maximize,
  Minimize,
  Trophy,
  Trash2,
  Download,
  RotateCcw,
  Home,
  Check,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { classroomRequest } from "@/features/classroom/classroom.functions";
import { loadCap } from "@/features/classroom/storage";
import type { RoomView, Capability, Player } from "@/features/classroom/types";
import { LETTERS, DIFF_LABEL } from "@/lib/quiz";
import { soundFx } from "@/lib/sound";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/host/$roomCode")({
  head: () => ({
    meta: [
      { title: "Öğretmen Canlı Yarışma Ekranı — Coğrafya Arenası" },
      { name: "description", content: "Canlı yarışmayı akıllı tahtadan yönetin." },
    ],
  }),
  component: HostDashboard,
});

function HostDashboard() {
  const { roomCode } = useParams({ from: "/host/$roomCode" });
  const navigate = useNavigate();

  const [room, setRoom] = useState<RoomView | null>(null);
  const [cap, setCap] = useState<Capability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [joinUrl, setJoinUrl] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load capability and set URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/join/${roomCode}`);
    }
    let storedCap = loadCap(`host-${roomCode}`);
    if (!storedCap) {
      storedCap = loadCap("workspace");
    }
    if (storedCap) {
      setCap(storedCap);
    } else {
      setError(
        "Bu odayı yönetmek için öğretmen yetki oturumu bulunamadı. Lütfen odayı oluşturduğunuz tarayıcı sekmesini kullanın veya yeni bir oda açın.",
      );
      setLoading(false);
    }
  }, [roomCode]);

  // Polling room state every 1000ms
  useEffect(() => {
    if (!cap) return;
    let isMounted = true;

    const fetchView = async () => {
      try {
        const res = await classroomRequest({
          data: {
            op: "view",
            key: roomCode,
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
        if (isMounted) {
          console.warn("[HostPolling] fetch error", err);
        }
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
  }, [roomCode, cap]);

  // Countdown timer effect
  useEffect(() => {
    if (!room?.deadline || room.paused || room.phase !== "open") {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((Date.parse(room.deadline!) - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 5 && remaining > 0) {
        soundFx.tick();
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 500);
    return () => clearInterval(timerInterval);
  }, [room?.deadline, room?.paused, room?.phase]);

  // Play sound on phase change
  useEffect(() => {
    if (room?.phase === "closed") {
      soundFx.correct();
    } else if (room?.phase === "finished") {
      soundFx.fanfare();
    }
  }, [room?.phase]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleHostAction = async (action: string, extraData: Record<string, unknown> = {}) => {
    if (!cap) return;
    try {
      setActionLoading(true);
      const res = await classroomRequest({
        data: {
          op: "action",
          key: roomCode,
          cap,
          data: {
            role: "host",
            action,
            ...extraData,
          },
        },
      });

      if (res.error) {
        setError(res.error);
      } else if (res.room) {
        setRoom(res.room);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    } finally {
      setActionLoading(false);
    }
  };

  // CSV export
  const exportResultsCSV = () => {
    if (!room) return;
    const rows = [
      ["Sıra", "Öğrenci Adı", "Toplam Puan", "Doğru Sayısı", "Katılım Durumu"],
      ...room.players.map((p) => [
        p.rank,
        `"${p.name.replace(/"/g, '""')}"`,
        p.score,
        p.correct,
        p.connected ? "Bağlı" : "Ayrıldı",
      ]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Cografya-Arenasi-Oda-${room.pin}-Sonuclari.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-accent border-r-transparent mb-4" />
        <p className="text-muted-foreground font-semibold">Oda yükleniyor...</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="py-16 max-w-md mx-auto text-center">
        <div className="p-6 rounded-3xl glass border-destructive/40 text-destructive mb-6">
          <AlertCircle className="h-10 w-10 mx-auto mb-3" />
          <h2 className="text-xl font-bold">Odaya Erişilemedi</h2>
          <p className="mt-2 text-sm text-foreground/80">{error}</p>
        </div>
        <Link
          to="/live"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-primary-foreground"
        >
          Yeni Oda Oluştur
        </Link>
      </div>
    );
  }

  if (!room) return null;

  const currentQ = room.question;
  const answeredCount = room.players.filter((p) => p.answered).length;
  const totalPlayers = room.players.length;

  return (
    <div
      ref={containerRef}
      className={cn(
        "py-6 transition-all",
        isFullscreen &&
          "min-h-screen bg-[#08111F] text-foreground p-8 flex flex-col justify-between overflow-y-auto",
      )}
    >
      {/* Top Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-xl text-gradient">
              Coğrafya Arenası
            </span>
            <span className="rounded-lg bg-secondary px-2.5 py-1 font-mono text-sm font-bold text-accent">
              PIN: {room.pin}
            </span>
          </div>

          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
              room.phase === "lobby"
                ? "bg-accent/15 text-accent"
                : room.phase === "open"
                  ? "bg-success/15 text-success animate-pulse"
                  : room.phase === "closed"
                    ? "bg-warning/15 text-warning"
                    : "bg-primary/15 text-primary",
            )}
          >
            {room.phase === "lobby"
              ? "Bekleme Lobisi"
              : room.phase === "open"
                ? "Soru Açık"
                : room.phase === "closed"
                  ? "Soru Kapandı"
                  : "Yarışma Bitti"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-2 rounded-xl glass px-3.5 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            title="Akıllı Tahta Tam Ekran"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="hidden sm:inline">{isFullscreen ? "Pencereye Dön" : "Tam Ekran"}</span>
          </button>
        </div>
      </div>

      {/* PHASE 1: WAITING LOBBY */}
      {room.phase === "lobby" && (
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          {/* Left: Huge QR Code and PIN */}
          <div className="lg:col-span-5 glass rounded-3xl p-8 border-border text-center shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Öğrenci Katılım Kodu
            </p>
            <div className="font-mono text-6xl sm:text-7xl font-extrabold text-gradient tracking-widest my-3">
              {room.pin}
            </div>
            <p className="text-sm text-foreground/80 mb-6 font-medium">
              Telefonunuzdan{" "}
              <span className="text-accent underline font-mono">
                {joinUrl || `/join/${room.pin}`}
              </span>{" "}
              adresine gidin veya QR kodu okutun.
            </p>

            <div className="mx-auto inline-block p-4 rounded-2xl bg-white shadow-xl">
              <QRCodeDisplay
                value={joinUrl || `https://ais-dev.run.app/join/${room.pin}`}
                size={200}
              />
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success animate-ping" />
              <span>Oda canlı ve katılıma açık</span>
            </div>
          </div>

          {/* Right: Connected Students & Start Button */}
          <div className="lg:col-span-7 glass rounded-3xl p-8 border-border flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold flex items-center gap-3">
                    <Users className="h-6 w-6 text-accent" />
                    <span>Katılan Öğrenciler</span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {totalPlayers > 0
                      ? `${totalPlayers} öğrenci katıldı`
                      : "Öğrencilerin bağlanması bekleniyor..."}
                  </p>
                </div>

                <span className="font-display text-3xl font-extrabold text-accent">
                  {totalPlayers}
                </span>
              </div>

              {/* Student chips */}
              {totalPlayers === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/20">
                  <p className="text-sm text-muted-foreground">
                    Öğrenciler PIN ile bağlandıkça burada belirecektir.
                  </p>
                  <p className="text-xs text-accent mt-2 font-semibold">
                    (Not: Sistemi 1 telefon ile test edebilirsiniz. 1 öğrenci yeterlidir!)
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {room.players.map((p) => (
                    <div
                      key={p.id}
                      className="group flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3.5 py-2 text-sm font-semibold transition-all hover:border-accent"
                    >
                      <span className="h-2 w-2 rounded-full bg-success" />
                      <span>{p.name}</span>
                      <button
                        type="button"
                        onClick={() => handleHostAction("remove", { player: p.id })}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity ml-1"
                        title="Öğrenciyi Odadan Çıkar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Start Button: MUST BE AVAILABLE FOR 1 OR MORE PARTICIPANTS */}
            <div className="mt-8 pt-6 border-t border-border/60">
              <button
                type="button"
                onClick={() => handleHostAction("start")}
                disabled={actionLoading || totalPlayers < 1}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-3 rounded-2xl py-4 text-xl font-extrabold transition-all shadow-glow",
                  totalPlayers >= 1
                    ? "bg-brand text-primary-foreground hover:scale-[1.01] hover:opacity-95"
                    : "bg-secondary text-muted-foreground cursor-not-allowed opacity-50",
                )}
              >
                <Play className="h-6 w-6 fill-current" />
                <span>
                  {totalPlayers >= 1
                    ? `YARIŞMAYI BAŞLAT (${totalPlayers} Katılımcı)`
                    : "YARIŞMAYI BAŞLAT (Öğrenci Bekleniyor)"}
                </span>
              </button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                En az 1 öğrenci katıldığında yarışma hemen başlatılabilir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2 & 3: LIVE QUESTION & CLOSURE */}
      {(room.phase === "open" || room.phase === "closed") && currentQ && (
        <div className="space-y-6">
          {/* Question HUD */}
          <div className="glass rounded-3xl p-6 sm:p-8 border-border shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="font-display font-extrabold text-xl sm:text-2xl text-accent">
                  Soru {room.index + 1} / {room.total}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">
                  Ünite {currentQ.unit}
                </span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold uppercase",
                    currentQ.difficulty === "kolay"
                      ? "bg-success/15 text-success"
                      : currentQ.difficulty === "orta"
                        ? "bg-warning/15 text-warning"
                        : "bg-destructive/15 text-destructive",
                  )}
                >
                  {DIFF_LABEL[currentQ.difficulty]} · {currentQ.points} Puan
                </span>
              </div>

              {/* Countdown or Status */}
              <div className="flex items-center gap-4">
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

                {/* Answered Counter */}
                <div className="glass rounded-2xl px-4 py-2 text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span>
                    {answeredCount} / {totalPlayers} Cevapladı
                  </span>
                </div>
              </div>
            </div>

            {/* Question Text */}
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug text-foreground my-6">
              {currentQ.question}
            </h1>

            {/* Five Options A - E */}
            <div className="grid gap-3 sm:grid-cols-2 mt-6">
              {currentQ.options.map((opt, i) => {
                const letter = LETTERS[i];
                const isCorrect = room.phase === "closed" && currentQ.correctAnswer === letter;
                const countForThisChoice =
                  room.phase === "closed" ? (room.distribution[i] ?? 0) : 0;

                return (
                  <div
                    key={letter}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                      isCorrect
                        ? "border-success bg-success/20 text-foreground ring-2 ring-success shadow-lg"
                        : room.phase === "closed"
                          ? "border-border/40 bg-secondary/20 opacity-60"
                          : "border-border bg-secondary/40 text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display font-extrabold text-lg",
                        isCorrect
                          ? "bg-success text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 text-base sm:text-lg font-medium">{opt}</span>

                    {/* Show distribution bar if question closed */}
                    {room.phase === "closed" && (
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold">{countForThisChoice} Oy</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation when closed */}
            {room.phase === "closed" && currentQ.explanation && (
              <div className="mt-6 rounded-2xl border border-success/30 bg-success/10 p-5 text-sm text-foreground">
                <div className="font-bold text-success flex items-center gap-2 mb-1.5">
                  <Lightbulb className="h-4 w-4" />
                  <span>Eğitici Açıklama</span>
                </div>
                <p className="leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}
          </div>

          {/* Participant Answer Status Grid & Teacher Control Bar */}
          <div className="glass rounded-3xl p-6 border-border flex flex-wrap items-center justify-between gap-4">
            {/* Student Response Chips */}
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Öğrenci Yanıt Durumları
              </p>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {room.players.map((p) => (
                  <span
                    key={p.id}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border",
                      p.answered
                        ? "border-success/50 bg-success/15 text-success"
                        : "border-border bg-secondary/40 text-muted-foreground",
                    )}
                  >
                    {p.answered ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    <span>{p.name}</span>
                    {room.phase === "closed" && p.choice && (
                      <span className="ml-1 font-mono font-bold">({p.choice})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {room.phase === "open" ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleHostAction(room.paused ? "resume" : "pause")}
                    className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2.5 font-bold text-sm hover:bg-secondary transition-colors"
                  >
                    {room.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    <span>{room.paused ? "Devam Et" : "Duraklat"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHostAction("close")}
                    className="inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 font-bold text-sm text-destructive-foreground hover:opacity-90 transition-opacity"
                  >
                    <span>Soruyu Kapat</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleHostAction("next")}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-extrabold text-base text-primary-foreground shadow-glow transition-all hover:scale-[1.02]"
                >
                  <span>{room.index + 1 >= room.total ? "Sonuçları Göster" : "Sonraki Soru"}</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Inter-question Leaderboard (when closed) */}
          {room.phase === "closed" && room.settings.leaderboard && room.players.length > 0 && (
            <div className="glass rounded-3xl p-6 border-border">
              <h3 className="font-display text-lg font-bold flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-warning" />
                <span>Güncel Sıralama</span>
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {room.players.slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/30"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-display font-extrabold text-sm text-accent">
                        #{p.rank}
                      </span>
                      <span className="font-semibold text-sm">{p.name}</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-success">{p.score} P</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 4: FINAL RESULTS & PODIUM */}
      {room.phase === "finished" && (
        <div className="glass rounded-3xl p-8 sm:p-12 border-border shadow-2xl text-center space-y-10">
          <div>
            <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-3xl bg-warning/20 text-warning border border-warning/40 shadow-glow animate-bounce">
              <Trophy className="h-10 w-10" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-foreground">
              Yarışma Tamamlandı!
            </h1>
            <p className="mt-2 text-muted-foreground text-base">
              Tüm sorular yanıtlandı. Tebrikler!
            </p>
          </div>

          {/* Podium for 2+ players, or Single Winner Card for 1 player */}
          {room.players.length === 1 ? (
            <div className="max-w-md mx-auto p-6 rounded-3xl glass border-accent/40 bg-accent/10 shadow-glow text-center">
              <div className="font-mono text-sm font-bold text-accent uppercase tracking-wider mb-1">
                Yarışma Şampiyonu
              </div>
              <h2 className="font-display text-3xl font-extrabold text-foreground">
                {room.players[0].name}
              </h2>
              <div className="mt-3 font-mono text-2xl font-bold text-success">
                {room.players[0].score} Puan
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {room.players[0].correct} / {room.total} Doğru
              </p>
            </div>
          ) : (
            <div className="flex items-end justify-center gap-3 sm:gap-6 pt-6 pb-4">
              {/* 2nd Place */}
              {room.players[1] && (
                <div className="flex flex-col items-center">
                  <div className="font-semibold text-sm mb-2 text-foreground/90 max-w-28 truncate">
                    {room.players[1].name}
                  </div>
                  <div className="h-32 w-24 sm:w-32 rounded-t-2xl bg-secondary/80 border-t-4 border-slate-400 flex flex-col items-center justify-center p-2">
                    <span className="font-display text-2xl font-bold text-slate-300">2.</span>
                    <span className="font-mono font-bold text-sm text-foreground">
                      {room.players[1].score} P
                    </span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {room.players[0] && (
                <div className="flex flex-col items-center">
                  <div className="font-bold text-base mb-2 text-warning flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span className="max-w-32 truncate">{room.players[0].name}</span>
                  </div>
                  <div className="h-44 w-28 sm:w-36 rounded-t-2xl bg-warning/20 border-t-4 border-warning flex flex-col items-center justify-center p-2 shadow-glow">
                    <span className="font-display text-4xl font-extrabold text-warning">1.</span>
                    <span className="font-mono font-extrabold text-lg text-foreground mt-1">
                      {room.players[0].score} P
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {room.players[0].correct} Doğru
                    </span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {room.players[2] && (
                <div className="flex flex-col items-center">
                  <div className="font-semibold text-sm mb-2 text-foreground/90 max-w-28 truncate">
                    {room.players[2].name}
                  </div>
                  <div className="h-24 w-24 sm:w-32 rounded-t-2xl bg-secondary/80 border-t-4 border-amber-600 flex flex-col items-center justify-center p-2">
                    <span className="font-display text-2xl font-bold text-amber-500">3.</span>
                    <span className="font-mono font-bold text-sm text-foreground">
                      {room.players[2].score} P
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="max-w-2xl mx-auto rounded-2xl border border-border/80 overflow-hidden">
            <div className="bg-secondary/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
              <span>Sıra / Öğrenci</span>
              <span>Puan / Doğru</span>
            </div>
            <div className="divide-y divide-border/60">
              {room.players.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-accent min-w-6">#{p.rank}</span>
                    <span className="font-semibold">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{p.correct} Doğru</span>
                    <span className="font-mono font-extrabold text-success">{p.score} P</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-border/60">
            <button
              type="button"
              onClick={exportResultsCSV}
              className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-semibold text-sm hover:bg-secondary transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Sonuçları CSV İndir</span>
            </button>

            <Link
              to="/live"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-primary-foreground shadow-glow hover:opacity-95 transition-opacity"
            >
              <RotateCcw className="h-4 w-4" />
              <span>TEKRAR OYNA</span>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-semibold text-sm hover:bg-secondary transition-colors"
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
