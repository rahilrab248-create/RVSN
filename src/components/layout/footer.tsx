import Link from "next/link";

import { siteConfig } from "@/config/site";

const footerGroups = [
  {
    title: "Shop RVSN",
    links: [
      { label: "Latest drops", href: "/#services" },
      { label: "Jerseys", href: "/category/jerseys" },
      { label: "Boot room", href: "/category/mens-football-boots" },
      { label: "Club edits", href: "/#clubs" },
    ],
  },
  {
    title: "Matchday",
    links: [
      { label: "All products", href: "/products" },
      { label: "Checkout", href: "/checkout" },
      { label: "My account", href: "/account" },
      { label: "Contact", href: "/#newsletter" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: siteConfig.phone, href: `tel:${siteConfig.phone.replace(/[^\d+]/g, "")}` },
      { label: `Instagram ${siteConfig.socials.instagram}`, href: "https://instagram.com/rvsnfootball" },
      { label: `Facebook ${siteConfig.socials.facebook}`, href: "https://facebook.com/rvsnfootmall" },
      { label: `TikTok ${siteConfig.socials.tiktok}`, href: "https://www.tiktok.com/@rvsnfootball" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="aww-footer text-white">
      <div className="container-shell">
        <div className="aww-footer-grid">
          {footerGroups.map((group) => (
            <div key={group.title} className="aww-footer-group">
              <h2>{group.title}</h2>
              <nav className="aww-footer-links" aria-label={group.title}>
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.label} <span aria-hidden="true">-&gt;</span>
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="aww-footer-bottom">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}</p>
          <p>Premium football commerce in motion.</p>
        </div>
      </div>
    </footer>
  );
}
