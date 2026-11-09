import { createFileRoute } from "@tanstack/react-router";
import { QuestionBankView } from "@/components/QuestionBankView";

export const Route = createFileRoute("/questions")({
  head: () => ({
    meta: [
      { title: "Soru Bankası — Coğrafya Arenası" },
      {
        name: "description",
        content: "42 soruluk 11. sınıf coğrafya soru bankası, çözümler ve ipuçları.",
      },
    ],
  }),
  component: QuestionBankView,
});
