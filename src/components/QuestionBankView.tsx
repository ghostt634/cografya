import { useState, useEffect } from "react";
import {
  BookOpen,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Edit3,
  Check,
  HelpCircle,
} from "lucide-react";
import {
  questions as defaultQuestions,
  type Difficulty,
  type Question,
  type Letter,
} from "@/data/questions";
import { units } from "@/data/units";
import { DIFF_LABEL, LETTERS } from "@/lib/quiz";
import { DifficultyBadge } from "@/components/QuestionView";
import { classroomRequest } from "@/features/classroom/classroom.functions";
import { cn } from "@/lib/utils";

export function QuestionBankView() {
  const [questionList, setQuestionList] = useState<Question[]>(defaultQuestions);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [selectedDiff, setSelectedDiff] = useState<Difficulty | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Teacher edit modal state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editText, setEditText] = useState("");
  const [editOptions, setEditOptions] = useState<[string, string, string, string, string]>([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [editCorrect, setEditCorrect] = useState<Letter>("A");
  const [editExplanation, setEditExplanation] = useState("");
  const [editHint, setEditHint] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load custom edits from backend if teacher session exists
  useEffect(() => {
    const wsToken = localStorage.getItem("arena-workspace");
    if (!wsToken) return;
    try {
      const cap = JSON.parse(wsToken);
      classroomRequest({ data: { op: "bank", cap } }).then((res) => {
        if (res.bank && res.bank.length === 42) {
          setQuestionList(res.bank);
        }
      });
    } catch {
      // ignore
    }
  }, []);

  const filteredQuestions = questionList.filter((q) => {
    if (selectedUnit && q.unit !== selectedUnit) return false;
    if (selectedDiff && q.difficulty !== selectedDiff) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const inText = q.question.toLowerCase().includes(query);
      const inOptions = q.options.some((o) => o.toLowerCase().includes(query));
      const inExplanation = q.explanation.toLowerCase().includes(query);
      return inText || inOptions || inExplanation;
    }
    return true;
  });

  const openEditor = (q: Question) => {
    setEditingQuestion(q);
    setEditText(q.question);
    setEditOptions([...q.options] as [string, string, string, string, string]);
    setEditCorrect(q.correctAnswer);
    setEditExplanation(q.explanation);
    setEditHint(q.hint || "");
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    // Validate 5 distinct options
    const trimmedOpts = editOptions.map((o) => o.trim());
    if (trimmedOpts.some((o) => !o)) {
      setSaveError("Tüm 5 seçenek dolu olmalıdır.");
      return;
    }
    const unique = new Set(trimmedOpts.map((o) => o.toLowerCase()));
    if (unique.size !== 5) {
      setSaveError("Seçenekler birbirinden farklı olmalıdır.");
      return;
    }

    try {
      setSaveLoading(true);
      setSaveError(null);

      // Get workspace cap
      const wsToken = localStorage.getItem("arena-workspace");
      let capData = wsToken ? JSON.parse(wsToken) : null;
      if (!capData) {
        const wsRes = await classroomRequest({ data: { op: "workspace" } });
        if (wsRes.error || !wsRes.cap) throw new Error("Öğretmen oturumu açılamadı.");
        capData = wsRes.cap;
        localStorage.setItem("arena-workspace", JSON.stringify(capData));
      }

      const res = await classroomRequest({
        data: {
          op: "edit",
          cap: capData,
          data: {
            id: editingQuestion.id,
            question: editText.trim(),
            options: trimmedOpts,
            correctAnswer: editCorrect,
            explanation: editExplanation.trim(),
            hint: editHint.trim() || undefined,
          },
        },
      });

      if (res.error) throw new Error(res.error);
      if (res.bank) {
        setQuestionList(res.bank);
      } else {
        setQuestionList((prev) =>
          prev.map((item) =>
            item.id === editingQuestion.id
              ? {
                  ...item,
                  question: editText.trim(),
                  options: trimmedOpts as [string, string, string, string, string],
                  correctAnswer: editCorrect,
                  explanation: editExplanation.trim(),
                  hint: editHint.trim() || undefined,
                }
              : item,
          ),
        );
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setEditingQuestion(null);
      }, 700);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Soru kaydedilemedi.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="py-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/20 text-accent border border-accent/30">
            <BookOpen className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
              Soru Bankası
            </h1>
            <p className="text-sm text-muted-foreground">
              MEB 11. Sınıf Coğrafya müfredatından 7 ünite, tam 42 soru ve eğitici açıklamalar.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass rounded-3xl p-6 border-border space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Soru metninde veya seçeneklerde arama yapın..."
            className="w-full rounded-2xl border border-border bg-secondary/40 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none"
          />
        </div>

        {/* Unit Filters */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-accent" />
            <span>Ünite Filtresi:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedUnit(null)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                selectedUnit === null
                  ? "border-accent bg-accent/20 text-accent font-bold"
                  : "border-border/60 bg-secondary/30 text-muted-foreground hover:border-border",
              )}
            >
              Tüm Üniteler (42)
            </button>
            {units.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedUnit(selectedUnit === u.id ? null : u.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                  selectedUnit === u.id
                    ? "border-accent bg-accent/20 text-accent font-bold"
                    : "border-border/60 bg-secondary/30 text-muted-foreground hover:border-border",
                )}
              >
                {u.id}. {u.name}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Zorluk:
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedDiff(null)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold border",
                  selectedDiff === null
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-border text-muted-foreground",
                )}
              >
                Tümü
              </button>
              {(["kolay", "orta", "zor"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDiff(selectedDiff === d ? null : d)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold border",
                    selectedDiff === d
                      ? d === "kolay"
                        ? "border-success bg-success/20 text-success"
                        : d === "orta"
                          ? "border-warning bg-warning/20 text-warning"
                          : "border-destructive bg-destructive/20 text-destructive"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {DIFF_LABEL[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {filteredQuestions.length} soru listeleniyor
          </div>
        </div>
      </div>

      {/* Question List Accordion */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const isExpanded = expandedId === q.id;

          return (
            <div
              key={q.id}
              className="glass rounded-3xl border border-border/80 overflow-hidden transition-all hover:border-accent/40"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="p-6 cursor-pointer flex items-start justify-between gap-4 select-none"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-extrabold text-accent">#{q.id}</span>
                    <DifficultyBadge d={q.difficulty} />
                    <span className="text-muted-foreground">
                      Ünite {q.unit} · {units.find((u) => u.id === q.unit)?.name}
                    </span>
                  </div>

                  <h3 className="font-display text-base sm:text-lg font-bold text-foreground leading-snug">
                    {q.question}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditor(q);
                    }}
                    className="p-2 rounded-xl glass hover:bg-secondary text-muted-foreground hover:text-accent transition-colors"
                    title="Soruyu Düzenle (Öğretmen)"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <div className="p-2 text-muted-foreground">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-border/40 space-y-4 animate-rise">
                  {/* Options */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, i) => {
                      const letter = LETTERS[i];
                      const isCorrect = q.correctAnswer === letter;

                      return (
                        <div
                          key={letter}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border text-sm",
                            isCorrect
                              ? "border-success bg-success/15 font-semibold text-foreground ring-1 ring-success"
                              : "border-border bg-secondary/30 text-muted-foreground",
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-7 w-7 shrink-0 place-items-center rounded-lg font-display font-bold text-xs",
                              isCorrect ? "bg-success text-primary-foreground" : "bg-muted",
                            )}
                          >
                            {letter}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrect && <Check className="h-4 w-4 text-success" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation & Hint */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 text-xs">
                      <div className="font-bold text-success flex items-center gap-1.5 mb-1">
                        <Lightbulb className="h-4 w-4" />
                        <span>Eğitici Açıklama:</span>
                      </div>
                      <p className="leading-relaxed text-foreground/90">{q.explanation}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 text-xs">
                      <div className="font-bold text-accent flex items-center gap-1.5 mb-1">
                        <HelpCircle className="h-4 w-4" />
                        <span>Öğretmen İpucu (Joker):</span>
                      </div>
                      <p className="leading-relaxed text-foreground/90">
                        {q.hint || "İpucu tanımlanmamış."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* TEACHER QUESTION EDITOR MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-rise overflow-y-auto">
          <div className="glass rounded-3xl p-6 sm:p-8 border-border max-w-2xl w-full my-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-accent" />
                <h3 className="font-display text-xl font-bold">
                  Soruyu Düzenle (#{editingQuestion.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                Kapat
              </button>
            </div>

            {saveError && (
              <div className="p-3 rounded-xl border border-destructive/40 bg-destructive/10 text-xs font-semibold text-destructive">
                {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 rounded-xl border border-success/40 bg-success/10 text-xs font-semibold text-success flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Değişiklikler başarıyla kaydedildi!</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {/* Question Text */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                  Soru Metni:
                </label>
                <textarea
                  rows={3}
                  required
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/50 p-3 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              {/* 5 Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground block">
                  5 Seçenek (A, B, C, D, E):
                </label>
                {LETTERS.map((letter, i) => (
                  <div key={letter} className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs w-6 text-center text-accent">
                      {letter}
                    </span>
                    <input
                      type="text"
                      required
                      value={editOptions[i]}
                      onChange={(e) => {
                        const copy = [...editOptions] as [string, string, string, string, string];
                        copy[i] = e.target.value;
                        setEditOptions(copy);
                      }}
                      className="flex-1 rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm focus:border-accent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setEditCorrect(letter)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors",
                        editCorrect === letter
                          ? "bg-success text-primary-foreground border-success"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {editCorrect === letter ? "Doğru Cevap" : "Doğru Yap"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                  Eğitici Çözüm Açıklaması:
                </label>
                <textarea
                  rows={2}
                  required
                  value={editExplanation}
                  onChange={(e) => setEditExplanation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/50 p-3 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              {/* Hint */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                  Öğretmen İpucu (İpucu Jokeri):
                </label>
                <input
                  type="text"
                  value={editHint}
                  onChange={(e) => setEditHint(e.target.value)}
                  placeholder="Doğrudan cevabı vermeden öğrenciye yol gösteren bir ipucu..."
                  className="w-full rounded-xl border border-border bg-secondary/50 p-3 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl glass text-xs font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2.5 rounded-xl bg-brand text-xs font-bold text-primary-foreground shadow-glow"
                >
                  {saveLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
