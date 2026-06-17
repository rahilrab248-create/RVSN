import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";
import { navItems, siteConfig } from "@/config/site";

const socialLinks = [
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "Twitter", href: "#", icon: Twitter },
  { label: "Facebook", href: "#", icon: Facebook },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1fr_auto]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label={`${siteConfig.name} home`}>
            <span className="grid size-10 place-items-center bg-lime-300 text-sm font-black text-slate-950">
              FT
            </span>
            <span className="text-lg font-black uppercase tracking-[0.18em] text-slate-950">{siteConfig.name}</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">{siteConfig.description}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Explore</p>
            <div className="mt-4 grid gap-3">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="text-sm text-slate-600 transition hover:text-slate-950">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Social</p>
            <div className="mt-4 flex gap-2">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="grid size-10 place-items-center border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                >
                  <item.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5">
        <div className="container-shell flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>Foundation build. Commerce modules intentionally excluded.</p>
        </div>
      </div>
    </footer>
  );
}
