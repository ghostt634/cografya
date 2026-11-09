import { createFileRoute } from "@tanstack/react-router";
import { QuestionBankView } from "@/components/QuestionBankView";

export const Route = createFileRoute("/soru-bankasi")({
  head: () => ({
    meta: [
      { title: "Soru Bankası — Coğrafya Arenası" },
      {
        name: "description",
        content: "42 sorunun tamamını ünite ve zorluğa göre filtreleyerek incele.",
      },
      { property: "og:title", content: "Soru Bankası — Coğrafya Arenası" },
      { property: "og:description", content: "Ünite ve zorluk filtreli soru bankası." },
    ],
  }),
  component: QuestionBankView,
});
