export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Fooltball",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Elite football gear, matchday drops, club-inspired style, and boots built for players who live for the final whistle.",
};

export const navItems = [
  { label: "Shop", href: "/products" },
  { label: "Jerseys", href: "/#trending" },
  { label: "Boots", href: "/#featured-boots" },
  { label: "Clubs", href: "/#clubs" },
  { label: "Arrivals", href: "/#arrivals" },
];
