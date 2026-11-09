import {
  Compass,
  Satellite,
  Mountain,
  Users,
  Factory,
  ShieldAlert,
  Globe2,
  type LucideIcon,
} from "lucide-react";

export interface Unit {
  id: number;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const units: Unit[] = [
  {
    id: 1,
    name: "Coğrafyanın Doğası",
    description: "Mekânsal sorunlar, bütüncül yaklaşım ve coğrafi düşünme.",
    icon: Compass,
  },
  {
    id: 2,
    name: "Mekânsal Bilgi Teknolojileri",
    description: "CBS, uzaktan algılama ve mekânsal veri analizi.",
    icon: Satellite,
  },
  {
    id: 3,
    name: "Doğal Sistemler ve Süreçler",
    description: "Su döngüsü, akarsu rejimleri ve yer altı suları.",
    icon: Mountain,
  },
  {
    id: 4,
    name: "Beşerî Sistemler ve Süreçler",
    description: "Yerleşmeler, etki alanları ve erişilebilirlik.",
    icon: Users,
  },
  {
    id: 5,
    name: "Ekonomik Faaliyetler ve Etkileri",
    description: "Tarım, gıda güvencesi ve ekonomik etkiler.",
    icon: Factory,
  },
  {
    id: 6,
    name: "Afetler ve Sürdürülebilir Çevre",
    description: "Doğal afetler, risk yönetimi ve sürdürülebilirlik.",
    icon: ShieldAlert,
  },
  {
    id: 7,
    name: "Bölgeler, Ülkeler ve Küresel Bağlantılar",
    description: "Ülkelerin uzmanlaşması ve küresel ilişkiler.",
    icon: Globe2,
  },
];

export const unitById = (id: number) => units.find((u) => u.id === id)!;
