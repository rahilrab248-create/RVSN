"use client";

import { LayoutDashboard, LogOut, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CountryCurrencySelect } from "@/components/layout/country-currency-select";
import { navItems, siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [currentHash, setCurrentHash] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout, profile } = useAuth();
  const { itemCount, openCart } = useCart();
  const isHome = pathname === "/";
  const homeReadableStyle = isHome ? { color: "#ffffff" } : undefined;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    router.push(trimmedQuery ? `/products?search=${encodeURIComponent(trimmedQuery)}` : "/products");
    setIsSearchOpen(false);
    setIsOpen(false);
  }

  useEffect(() => {
    function syncHash() {
      setCurrentHash(window.location.hash);
    }

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b backdrop-blur-2xl transition-colors",
        isHome
          ? "border-white/15 bg-slate-950/88 shadow-2xl shadow-slate-950/35"
          : "border-slate-200 bg-white/92 shadow-sm shadow-slate-200/50",
      )}
    >
      <nav className="container-shell flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label={`${siteConfig.name} home`}>
          <span className="grid size-10 place-items-center bg-lime-300 text-sm font-black text-slate-950 shadow-lg shadow-lime-950/20">
            FT
          </span>
          <span className={cn("text-lg font-black uppercase tracking-[0.18em]", isHome ? "text-white" : "text-slate-950")}>{siteConfig.name}</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => {
            const isActive = isNavItemActive(pathname, item.href, currentHash);

            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative inline-flex h-10 items-center overflow-hidden px-1 text-sm font-black transition",
                  isHome
                    ? isActive
                      ? "!text-white"
                      : "!text-white hover:!text-lime-200"
                    : isActive
                      ? "text-slate-950"
                      : "text-slate-600 hover:text-slate-950",
                )}
                style={homeReadableStyle}
              >
                <span className="relative z-10" style={homeReadableStyle}>{item.label}</span>
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-1 h-1 origin-left bg-lime-300 transition-transform duration-300",
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
                <span className="absolute inset-x-[-0.4rem] bottom-0 h-7 translate-y-2 rounded-full bg-lime-300/0 blur-xl transition group-hover:bg-lime-300/35" />
              </a>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <CountryCurrencySelect isHome={isHome} />
          <button
            className={cn(
              "grid size-10 place-items-center border transition",
              isHome
                ? "border-white/30 bg-white/15 !text-white hover:border-white hover:bg-white/25 hover:!text-white"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-lime-300 hover:bg-lime-100 hover:text-slate-950",
            )}
            style={homeReadableStyle}
            aria-label="Search"
            onClick={() => setIsSearchOpen((value) => !value)}
          >
            <Search size={18} />
          </button>
          <button
            className={cn(
              "relative grid size-10 place-items-center border transition",
              isHome
                ? "border-white/30 bg-white/15 !text-white hover:border-white hover:bg-white/25 hover:!text-white"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-lime-300 hover:bg-lime-100 hover:text-slate-950",
            )}
            style={homeReadableStyle}
            aria-label="Open cart"
            onClick={openCart}
          >
            <ShoppingBag size={18} />
            {itemCount ? (
              <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-lime-300 text-[10px] font-black text-slate-950">
                {itemCount}
              </span>
            ) : null}
          </button>
          {!isLoading && isAuthenticated ? (
            <>
              <Link
                href="/account"
                className={cn(
                  "grid size-10 place-items-center border transition",
                  isHome
                    ? "border-white/30 bg-white/15 !text-white hover:border-white hover:bg-white/25 hover:!text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-lime-300 hover:bg-lime-100 hover:text-slate-950",
                )}
                style={homeReadableStyle}
                aria-label="Account"
              >
                <UserRound size={18} />
              </Link>
              {profile?.role === "admin" ? (
                <Link
                  href="/admin"
                  className={cn(
                    "grid size-10 place-items-center border transition",
                    isHome
                      ? "border-white/30 bg-white/15 !text-white hover:border-white hover:bg-white/25 hover:!text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-lime-400 hover:bg-lime-100 hover:text-slate-950",
                  )}
                  style={homeReadableStyle}
                  aria-label="Admin dashboard"
                >
                  <LayoutDashboard size={18} />
                </Link>
              ) : null}
              <button
                className={cn(
                  "grid size-10 place-items-center border transition",
                  isHome
                    ? "border-white/30 bg-white/15 !text-white hover:border-white hover:bg-white/25 hover:!text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-lime-300 hover:bg-lime-100 hover:text-slate-950",
                )}
                style={homeReadableStyle}
                aria-label="Logout"
                onClick={logout}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center bg-lime-300 px-5 text-sm font-extrabold text-slate-950 shadow-lg shadow-lime-950/20 transition hover:bg-white"
            >
              Login
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            className={cn(
              "grid size-10 place-items-center border",
              isHome ? "border-white/30 bg-white/15 !text-white" : "border-slate-200 bg-slate-50 text-slate-950",
            )}
            style={homeReadableStyle}
            aria-label="Search"
            aria-expanded={isSearchOpen}
            onClick={() => {
              setIsSearchOpen((value) => !value);
              setIsOpen(false);
            }}
          >
            <Search size={19} />
          </button>
          <button
            className={cn(
              "grid size-10 place-items-center border",
              isHome ? "border-white/30 bg-white/15 !text-white" : "border-slate-200 bg-slate-50 text-slate-950",
            )}
            style={homeReadableStyle}
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            onClick={() => {
              setIsOpen((value) => !value);
              setIsSearchOpen(false);
            }}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isSearchOpen ? (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSearch}
            className={cn("overflow-hidden border-t", isHome ? "border-white/10 bg-slate-950/92" : "border-slate-200 bg-white")}
          >
            <div className="container-shell flex items-center gap-3 py-3">
              <Search size={18} className={isHome ? "text-lime-200" : "text-slate-500"} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search jerseys, boots, training gear..."
                className={cn(
                  "h-11 flex-1 bg-transparent text-sm font-semibold outline-none",
                  isHome ? "text-white placeholder:text-slate-400" : "text-slate-950 placeholder:text-slate-500",
                )}
              />
              <button className="h-10 bg-lime-300 px-4 text-sm font-extrabold !text-slate-950 transition hover:bg-white sm:px-5" type="submit">
                Search
              </button>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn("overflow-hidden border-t lg:hidden", isHome ? "border-white/10 bg-slate-950/95" : "border-slate-200 bg-white")}
          >
            <div className="container-shell grid gap-2 py-4">
              <CountryCurrencySelect isHome={isHome} compact className="mb-2" />
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "border px-4 py-3 text-sm font-black transition",
                    isHome
                      ? isNavItemActive(pathname, item.href, currentHash)
                        ? "border-lime-300 bg-lime-300 !text-slate-950"
                        : "border-white/15 bg-white/[0.1] !text-white hover:border-white hover:bg-white/[0.18] hover:!text-white"
                      : isNavItemActive(pathname, item.href, currentHash)
                        ? "border-lime-300 bg-lime-100 text-slate-950"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-lime-300 hover:bg-lime-50 hover:text-slate-950",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <button
                className={cn(
                  "flex items-center justify-between border px-4 py-3 text-left text-sm font-semibold transition",
                  isHome
                    ? "border-white/15 bg-white/[0.1] !text-white hover:border-white hover:bg-white/[0.18] hover:!text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700",
                )}
                onClick={() => {
                  setIsOpen(false);
                  openCart();
                }}
              >
                <span>Cart</span>
                <span className="rounded-full bg-lime-300 px-2 py-0.5 text-xs font-black text-slate-950">{itemCount}</span>
              </button>
              {!isLoading && isAuthenticated ? (
                <>
                  <Link
                    href="/account"
                    className={cn(
                      "border px-4 py-3 text-sm font-semibold transition",
                      isHome ? "border-white/15 bg-white/[0.1] !text-white hover:border-white hover:bg-white/[0.18] hover:!text-white" : "border-slate-200 bg-slate-50 text-slate-700",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    Account
                  </Link>
                  {profile?.role === "admin" ? (
                    <Link
                      href="/admin"
                      className={cn(
                        "border px-4 py-3 text-sm font-semibold transition",
                        isHome ? "border-white/15 bg-white/[0.1] !text-white hover:border-white hover:bg-white/[0.18] hover:!text-white" : "border-slate-200 bg-slate-50 text-slate-700",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      Admin dashboard
                    </Link>
                  ) : null}
                  <button
                    className={cn(
                      "border px-4 py-3 text-left text-sm font-semibold transition",
                      isHome ? "border-white/15 bg-white/[0.1] !text-white hover:border-white hover:bg-white/[0.18] hover:!text-white" : "border-slate-200 bg-slate-50 text-slate-700",
                    )}
                    onClick={() => {
                      setIsOpen(false);
                      void logout();
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="border border-lime-300/30 bg-lime-300 px-4 py-3 text-sm font-extrabold !text-slate-950"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function isNavItemActive(pathname: string, href: string, currentHash: string) {
  if (href === "/products") {
    return pathname.startsWith("/products");
  }

  if (href.startsWith("/#")) {
    return pathname === "/" && currentHash === href.replace("/", "");
  }

  return pathname === href;
}
