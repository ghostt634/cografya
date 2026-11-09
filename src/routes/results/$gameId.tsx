import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Download, Home, RotateCcw, Award, CheckCircle2, AlertCircle } from "lucide-react";
import { classroomRequest } from "@/features/classroom/classroom.functions";
import { loadCap } from "@/features/classroom/storage";
import type { RoomView, Capability } from "@/features/classroom/types";

export const Route = createFileRoute("/results/$gameId")({
  head: () => ({
    meta: [
      { title: "Yarışma Sonuçları — Coğrafya Arenası" },
      { name: "description", content: "Yarışma sıralaması ve detaylı istatistikler." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { gameId } = useParams({ from: "/results/$gameId" });

  const [room, setRoom] = useState<RoomView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hostCap = loadCap(`host-${gameId}`);
    const playerCap = loadCap(`player-${gameId}`);
    const cap = hostCap || playerCap;

    classroomRequest({
      data: {
        op: "view",
        key: gameId,
        cap: cap || undefined,
        data: { role: hostCap ? "host" : "player" },
      },
    })
      .then((res) => {
        if (res.error) {
          setError(res.error);
        } else if (res.room) {
          setRoom(res.room);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Sonuçlar yüklenemedi.");
      })
      .finally(() => setLoading(false));
  }, [gameId]);

  const exportResultsCSV = () => {
    if (!room) return;
    const isTeams = room.mode === "teams";
    const rows = isTeams
      ? [
          [
            "Sıra",
            "Takım Adı",
            "Skor",
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
        ]
      : [
          ["Sıra", "Öğrenci Adı", "Skor", "Doğru Sayısı", "Katılım Durumu"],
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
    link.setAttribute("download", `Cografya-Arenasi-Sonuclar-${gameId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-accent border-r-transparent mb-4" />
        <p className="text-muted-foreground font-semibold">Sonuçlar yükleniyor...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="py-16 max-w-md mx-auto text-center">
        <div className="p-6 rounded-3xl glass border-destructive/40 text-destructive mb-6">
          <AlertCircle className="h-10 w-10 mx-auto mb-3" />
          <h2 className="text-xl font-bold">Sonuç Bulunamadı</h2>
          <p className="mt-2 text-sm text-foreground/80">
            {error || "Bu odaya ait sonuçlar mevcut değil."}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-primary-foreground"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const isTeams = room.mode === "teams";

  return (
    <div className="py-10 max-w-3xl mx-auto space-y-8 animate-rise">
      <div className="glass rounded-3xl p-8 sm:p-12 border-border shadow-2xl text-center space-y-6">
        <div className="mx-auto mb-2 grid h-20 w-20 place-items-center rounded-3xl bg-warning/20 text-warning border border-warning/40 shadow-glow">
          <Trophy className="h-10 w-10" />
        </div>

        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
            {isTeams ? "Grup Yarışması Sonuçları" : "Canlı Yarışma Sıralaması"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Oda Kodu: <span className="font-mono font-bold text-accent">{room.pin}</span>
          </p>
        </div>

        {/* Results Table */}
        <div className="rounded-2xl border border-border/80 overflow-hidden text-sm text-left">
          <div className="bg-secondary/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
            <span>Sıra / {isTeams ? "Takım" : "Öğrenci"}</span>
            <span>Puan / Doğru</span>
          </div>
          <div className="divide-y divide-border/60">
            {isTeams
              ? room.teams.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-accent min-w-6">#{t.rank}</span>
                      <span className="font-semibold">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {room.settings.coins && (
                        <span className="text-xs font-mono text-warning font-bold">
                          {t.coins} Altın
                        </span>
                      )}
                      <span className="font-mono font-extrabold text-success text-base">
                        {t.score} P
                      </span>
                    </div>
                  </div>
                ))
              : room.players.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-accent min-w-6">#{p.rank}</span>
                      <span className="font-semibold">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">{p.correct} Doğru</span>
                      <span className="font-mono font-extrabold text-success text-base">
                        {p.score} P
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-border/60">
          <button
            type="button"
            onClick={exportResultsCSV}
            className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-semibold text-sm hover:bg-secondary"
          >
            <Download className="h-4 w-4" />
            <span>CSV Olarak İndir</span>
          </button>

          <Link
            to={isTeams ? "/teams" : "/live"}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-primary-foreground shadow-glow"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Yeni Yarışma Kur</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-semibold text-sm hover:bg-secondary"
          >
            <Home className="h-4 w-4" />
            <span>Ana Sayfa</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
