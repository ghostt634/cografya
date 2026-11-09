import { createFileRoute, useParams, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Smartphone,
  CheckCircle2,
  Clock,
  Award,
  Trophy,
  ArrowRight,
  Home,
  Check,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { classroomRequest } from "@/features/classroom/classroom.functions";
import { loadCap } from "@/features/classroom/storage";
import type { RoomView, Capability } from "@/features/classroom/types";
import { LETTERS, DIFF_LABEL } from "@/lib/quiz";
import type { Letter } from "@/data/questions";
import { soundFx } from "@/lib/sound";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/$roomCode")({
  head: () => ({
    meta: [
      { title: "Canlı Yarışma — Coğrafya Arenası" },
      { name: "description", content: "Öğrenci canlı cevaplama ekranı." },
    ],
  }),
  component: PlayMobile,
});

function PlayMobile() {
  const { roomCode } = useParams({ from: "/play/$roomCode" });
  const navigate = useNavigate();

  const [room, setRoom] = useState<RoomView | null>(null);
  const [cap, setCap] = useState<Capability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<Letter | null>(null);
  const [submittedChoice, setSubmittedChoice] = useState<Letter | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Load player capability
  useEffect(() => {
    const storedCap = loadCap(`player-${roomCode}`);
    if (storedCap) {
      setCap(storedCap);
    } else {
      // If no stored capability, redirect to join screen
      navigate({ to: `/join/${roomCode}` });
    }
  }, [roomCode, navigate]);

  // Polling room state every 800ms
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
            data: { role: "player" },
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
          console.warn("[PlayerPolling] fetch error", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchView();
    const interval = setInterval(fetchView, 800);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [roomCode, cap]);

  // Reset selected choice when question index changes
  useEffect(() => {
    setSelectedOption(null);
    setSubmittedChoice(null);
  }, [room?.index]);

  // If student already answered current question according to room view
  useEffect(() => {
    if (room?.mine?.answered && !submittedChoice) {
      setSubmittedChoice(room.mine.choice ?? "A");
    }
  }, [room?.mine, submittedChoice]);

  // Countdown timer
  useEffect(() => {
    if (!room?.deadline || room.paused || room.phase !== "open") {
      setTimeLeft(null);
      return;
    }
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((Date.parse(room.deadline!) - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    updateTimer();
    const timerInterval = setInterval(updateTimer, 500);
    return () => clearInterval(timerInterval);
  }, [room?.deadline, room?.paused, room?.phase]);

  // Handle submit answer
  const handleConfirmAnswer = async () => {
    if (!selectedOption || !cap || !room?.question) return;
    try {
      setIsSubmitting(true);
      const res = await classroomRequest({
        data: {
          op: "action",
          key: roomCode,
          cap,
          data: {
            role: "player",
            action: "answer",
            choice: selectedOption,
            questionId: room.question.id,
          },
        },
      });

      if (res.error) {
        setError(res.error);
      } else if (res.room) {
        setRoom(res.room);
        setSubmittedChoice(selectedOption);
        soundFx.tick();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cevap kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-accent border-r-transparent mb-4" />
        <p className="text-muted-foreground font-semibold">Odaya bağlanılıyor...</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="py-16 max-w-md mx-auto text-center">
        <div className="p-6 rounded-3xl glass border-destructive/40 text-destructive mb-6">
          <AlertCircle className="h-10 w-10 mx-auto mb-3" />
          <h2 className="text-xl font-bold">Bağlantı Hatası</h2>
          <p className="mt-2 text-sm text-foreground/80">{error}</p>
        </div>
        <Link
          to={`/join/${roomCode}`}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-primary-foreground"
        >
          Yeniden Bağlan
        </Link>
      </div>
    );
  }

  if (!room) return null;

  const currentQ = room.question;
  const isAnswered = Boolean(submittedChoice || room.mine?.answered);
  const myPlayer = room.mine;

  return (
    <div className="py-4 max-w-lg mx-auto min-h-[85vh] flex flex-col justify-between">
      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
          <span className="font-bold text-sm text-foreground truncate max-w-36">
            {myPlayer?.name || "Öğrenci"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
            PIN: {room.pin}
          </span>
          <span className="font-mono text-sm font-extrabold text-accent">
            {myPlayer?.score ?? 0} P
          </span>
        </div>
      </div>

      {/* PHASE 1: LOBBY */}
      {room.phase === "lobby" && (
        <div className="glass rounded-3xl p-8 border-border text-center shadow-xl my-auto">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand/20 text-accent border border-accent/30 shadow-glow animate-pulse">
            <Smartphone className="h-8 w-8" />
          </div>

          <h2 className="font-display text-2xl font-bold text-foreground">Odaya Katıldınız!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Öğretmenin yarışmayı başlatması bekleniyor. Lütfen bu ekranı kapatmayın.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-secondary/40 border border-border/60">
            <div className="text-xs text-muted-foreground">Katılımcı Adınız</div>
            <div className="font-display text-xl font-extrabold text-accent mt-0.5">
              {myPlayer?.name}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: OPEN QUESTION */}
      {room.phase === "open" && currentQ && (
        <div className="space-y-4 my-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold text-accent">
              Soru {room.index + 1} / {room.total}
            </span>
            {timeLeft !== null && (
              <span
                className={cn(
                  "font-mono font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1",
                  timeLeft <= 5
                    ? "bg-destructive/20 text-destructive animate-pulse"
                    : "bg-accent/10 text-accent",
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{timeLeft} sn</span>
              </span>
            )}
          </div>

          {/* Question Text */}
          <div className="glass rounded-2xl p-5 border-border">
            <div className="text-xs font-semibold text-muted-foreground mb-1">
              Ünite {currentQ.unit} · {DIFF_LABEL[currentQ.difficulty]} ({currentQ.points} Puan)
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options Buttons */}
          {!isAnswered ? (
            <div className="space-y-2.5">
              {currentQ.options.map((opt, i) => {
                const letter = LETTERS[i];
                const isSelected = selectedOption === letter;

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setSelectedOption(letter)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.98]",
                      isSelected
                        ? "border-accent bg-accent/20 ring-2 ring-accent shadow-glow text-foreground font-bold"
                        : "border-border bg-secondary/50 text-foreground/90 hover:border-accent/60",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display font-extrabold text-base",
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 text-sm sm:text-base leading-snug">{opt}</span>
                  </button>
                );
              })}

              {/* Confirm Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConfirmAnswer}
                  disabled={!selectedOption || isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-extrabold text-primary-foreground shadow-glow transition-all disabled:opacity-40"
                >
                  <Check className="h-5 w-5" />
                  <span>{isSubmitting ? "Kaydediliyor..." : "CEVABI ONAYLA"}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Locked / Waiting other students */
            <div className="glass rounded-3xl p-8 border-border text-center shadow-xl space-y-4">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-success/20 text-success border border-success/30 shadow-glow">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                CEVABIN KAYDEDİLDİ!
              </h3>
              <div className="inline-block px-4 py-2 rounded-xl bg-secondary/60 font-mono font-bold text-lg text-accent">
                Seçiminiz: {submittedChoice || myPlayer?.choice}
              </div>
              <p className="text-xs text-muted-foreground">
                Diğer öğrenciler ve süre bekleniyor... Doğru cevap süre bitince açıklanacaktır.
              </p>
            </div>
          )}
        </div>
      )}

      {/* PHASE 3: QUESTION CLOSED / FEEDBACK */}
      {room.phase === "closed" && currentQ && (
        <div className="glass rounded-3xl p-6 sm:p-8 border-border shadow-2xl text-center my-auto space-y-6">
          {(() => {
            const myChoice = submittedChoice || myPlayer?.choice;
            const isCorrect = myChoice === currentQ.correctAnswer;

            return (
              <>
                <div
                  className={cn(
                    "mx-auto grid h-16 w-16 place-items-center rounded-2xl border shadow-glow",
                    isCorrect
                      ? "bg-success/20 text-success border-success/40"
                      : "bg-destructive/20 text-destructive border-destructive/40",
                  )}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="h-8 w-8" />
                  ) : (
                    <AlertCircle className="h-8 w-8" />
                  )}
                </div>

                <div>
                  <h2
                    className={cn(
                      "font-display text-2xl font-extrabold",
                      isCorrect ? "text-success" : "text-destructive",
                    )}
                  >
                    {isCorrect ? `TEBRİKLER! (+${currentQ.points} Puan)` : "YANLIŞ CEVAP"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Doğru Seçenek:{" "}
                    <span className="font-bold text-success font-mono">
                      {currentQ.correctAnswer}
                    </span>
                    {myChoice && ` · Sizin Seçiminiz: ${myChoice}`}
                  </p>
                </div>

                {currentQ.explanation && (
                  <div className="text-left p-4 rounded-2xl bg-secondary/30 border border-border/60 text-xs text-foreground/90 leading-relaxed">
                    <div className="font-bold text-accent mb-1 flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>Açıklama:</span>
                    </div>
                    {currentQ.explanation}
                  </div>
                )}

                <div className="pt-2 text-xs text-muted-foreground">
                  Öğretmenin sıradaki soruya geçmesi bekleniyor...
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* PHASE 4: COMPETITION FINISHED */}
      {room.phase === "finished" && (
        <div className="glass rounded-3xl p-8 border-border text-center shadow-2xl my-auto space-y-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-warning/20 text-warning border border-warning/40 shadow-glow animate-bounce">
            <Trophy className="h-8 w-8" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
            Yarışma Bitti!
          </h2>

          <div className="p-5 rounded-2xl bg-secondary/40 border border-border/60 space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Sıralamanız
            </div>
            <div className="font-display text-4xl font-extrabold text-accent">
              #{myPlayer?.rank ?? 1}
            </div>
            <div className="font-mono text-xl font-bold text-success">
              {myPlayer?.score ?? 0} Puan
            </div>
            <div className="text-xs text-muted-foreground">
              {myPlayer?.correct ?? 0} / {room.total} Doğru Yanıt
            </div>
          </div>

          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 font-bold text-primary-foreground shadow-glow"
          >
            <Home className="h-4 w-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      )}

      {/* Bottom Status */}
      <div className="text-center text-[11px] text-muted-foreground pt-4">
        Coğrafya Arenası · 11. Sınıf Canlı Yarışma
      </div>
    </div>
  );
}
