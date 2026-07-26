import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Flame, Shield, Sparkles, Star, Zap } from "lucide-react";

export type ShowcaseItem = {
  name: string;
  label: string;
  tone: string;
  imageTone: string;
  meta: string;
  href: string;
  imageUrl: string;
};

export type ClubItem = {
  name: string;
  country: string;
  initials: string;
  logoUrl: string;
  accent: string;
  glow: string;
  pattern: string;
};

export type ArrivalItem = {
  title: string;
  category: string;
  icon: LucideIcon;
  href: string;
};

export const trendingJerseys: ShowcaseItem[] = [
  {
    name: "Volt Strike Jersey",
    label: "Home kit",
    tone: "from-lime-300 via-emerald-300 to-white",
    imageTone: "bg-[linear-gradient(135deg,#d7ff2f_0%,#f7f7f2_46%,#101820_47%,#101820_54%,#25d0a5_55%,#25d0a5_100%)]",
    meta: "Breathable match fit",
    href: "/products/volt-strike-jersey",
    imageUrl: "/images/products/volt-strike-jersey.webp",
  },
  {
    name: "Night Derby Jersey",
    label: "Away kit",
    tone: "from-sky-300 via-white to-fuchsia-300",
    imageTone: "bg-[linear-gradient(135deg,#111827_0%,#111827_42%,#38bdf8_43%,#38bdf8_50%,#f0f9ff_51%,#f472b6_100%)]",
    meta: "City edition",
    href: "/products/night-derby-jersey",
    imageUrl: "/images/products/night-derby-jersey.avif",
  },
  {
    name: "Heritage Gold Jersey",
    label: "Third kit",
    tone: "from-amber-300 via-white to-red-400",
    imageTone: "bg-[linear-gradient(135deg,#fbbf24_0%,#fef3c7_35%,#7f1d1d_36%,#7f1d1d_44%,#ef4444_45%,#111827_100%)]",
    meta: "Limited capsule",
    href: "/products/heritage-gold-jersey",
    imageUrl: "/images/products/heritage-gold-jersey.webp",
  },
];

export const featuredBoots: ShowcaseItem[] = [
  {
    name: "Nike Phantom 6 Low Pro",
    label: "Pro turf",
    tone: "from-cyan-300 via-lime-200 to-white",
    imageTone: "bg-[radial-gradient(circle_at_25%_20%,#ecfeff_0%,#67e8f9_26%,#111827_27%,#111827_42%,#d7ff2f_43%,#0f172a_100%)]",
    meta: "Sharp turf control",
    href: "/products/nike-phantom-6-low-pro-hj4123-446",
    imageUrl: "/images/products/nike-phantom-6-low-pro-hj4123-446-1.jpg",
  },
  {
    name: "Nike Tiempo Ligera Pro",
    label: "Leather touch",
    tone: "from-violet-300 via-white to-lime-200",
    imageTone: "bg-[radial-gradient(circle_at_70%_28%,#ddd6fe_0%,#8b5cf6_24%,#f8fafc_25%,#f8fafc_38%,#0f172a_39%,#0f172a_100%)]",
    meta: "Premium turf build",
    href: "/products/nike-tiempo-ligera-pro-ib4477-100",
    imageUrl: "/images/products/nike-tiempo-ligera-pro-ib4477-100-1.jpg",
  },
  {
    name: "Nike Phantom Haaland",
    label: "Signature",
    tone: "from-red-400 via-orange-300 to-white",
    imageTone: "bg-[radial-gradient(circle_at_35%_26%,#fed7aa_0%,#fb7185_24%,#111827_25%,#111827_46%,#f97316_47%,#fefce8_100%)]",
    meta: "Haaland edition",
    href: "/products/nike-phantom-6-low-pro-erling-haaland-ih1788-603",
    imageUrl: "/images/products/nike-phantom-6-low-pro-erling-haaland-ih1788-603-1.jpg",
  },
];

export const popularClubs: ClubItem[] = [
  {
    name: "Real Madrid",
    country: "Spain",
    initials: "RM",
    logoUrl: "/images/clubs/real-madrid.svg",
    accent: "bg-yellow-300",
    glow: "shadow-[0_0_48px_rgba(253,224,71,0.22)]",
    pattern: "from-yellow-300/25 via-white/10 to-violet-400/20",
  },
  {
    name: "Barcelona",
    country: "Spain",
    initials: "FCB",
    logoUrl: "/images/clubs/barcelona.svg",
    accent: "bg-red-500",
    glow: "shadow-[0_0_48px_rgba(239,68,68,0.22)]",
    pattern: "from-red-500/25 via-blue-500/20 to-yellow-300/15",
  },
  {
    name: "Arsenal",
    country: "England",
    initials: "AFC",
    logoUrl: "/images/clubs/arsenal.svg",
    accent: "bg-red-500",
    glow: "shadow-[0_0_48px_rgba(239,68,68,0.2)]",
    pattern: "from-red-500/28 via-white/10 to-rose-300/10",
  },
  {
    name: "Liverpool",
    country: "England",
    initials: "LFC",
    logoUrl: "/images/clubs/liverpool.svg",
    accent: "bg-rose-500",
    glow: "shadow-[0_0_48px_rgba(244,63,94,0.2)]",
    pattern: "from-rose-500/28 via-red-400/12 to-emerald-300/10",
  },
  {
    name: "PSG",
    country: "France",
    initials: "PSG",
    logoUrl: "/images/clubs/psg.svg",
    accent: "bg-blue-500",
    glow: "shadow-[0_0_48px_rgba(59,130,246,0.22)]",
    pattern: "from-blue-500/28 via-red-400/14 to-white/10",
  },
  {
    name: "Chelsea",
    country: "England",
    initials: "CFC",
    logoUrl: "/images/clubs/chelsea.svg",
    accent: "bg-sky-500",
    glow: "shadow-[0_0_48px_rgba(14,165,233,0.2)]",
    pattern: "from-sky-500/25 via-blue-400/16 to-white/10",
  },
  {
    name: "Bayern Munich",
    country: "Germany",
    initials: "FCB",
    logoUrl: "/images/clubs/bayern-munich.svg",
    accent: "bg-red-600",
    glow: "shadow-[0_0_48px_rgba(220,38,38,0.22)]",
    pattern: "from-red-600/28 via-sky-300/12 to-white/10",
  },
  {
    name: "Manchester City",
    country: "England",
    initials: "MCI",
    logoUrl: "/images/clubs/manchester-city.svg",
    accent: "bg-cyan-300",
    glow: "shadow-[0_0_48px_rgba(103,232,249,0.2)]",
    pattern: "from-cyan-300/25 via-sky-400/14 to-white/10",
  },
  {
    name: "Inter Miami",
    country: "United States",
    initials: "IM",
    logoUrl: "/images/clubs/inter-miami.svg",
    accent: "bg-pink-300",
    glow: "shadow-[0_0_48px_rgba(249,168,212,0.2)]",
    pattern: "from-pink-300/28 via-black/20 to-white/10",
  },
];

export const newArrivals: ArrivalItem[] = [
  { title: "Rain-ready training layers", category: "Apparel", icon: Shield, href: "/products/rain-ready-training-layer" },
  { title: "Elite grip goalkeeper gloves", category: "Equipment", icon: BadgeCheck, href: "/products/elite-grip-gloves" },
  { title: "Street cage capsule", category: "Lifestyle", icon: Sparkles, href: "/category/training" },
  { title: "Matchday boot bag", category: "Accessories", icon: Zap, href: "/products" },
];

export const heroSignals = [
  { label: "Drop status", value: "Live soon", icon: Flame },
  { label: "Match fit", value: "Elite", icon: Star },
  { label: "Club energy", value: "Global", icon: Sparkles },
];
