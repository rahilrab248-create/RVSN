export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "RVSN",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Elite football gear, matchday drops, club-inspired style, and boots built for players who live for the final whistle.",
  phone: "+94 (072) 1666552",
  socials: {
    instagram: "@rvsnfootball",
    facebook: "rvsnfootmall",
    tiktok: "rvsnfootball",
  },
};

export const navItems = [
  { label: "Drops", href: "/#services" },
  { label: "Shop", href: "/products" },
  { label: "Clubs", href: "/#clubs" },
  { label: "Journal", href: "/#arrivals" },
  { label: "Contact", href: "/#newsletter" },
];
