"use client";

import { LayoutDashboard, LogOut, Menu, Search, ShoppingBag, Truck, UserRound, X } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
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
  const [navHighlight, setNavHighlight] = useState({ x: 0, width: 0, visible: false });
  const [isBrandCompact, setIsBrandCompact] = useState(false);
  const navLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout, profile } = useAuth();
  const { itemCount, openCart } = useCart();
  const isHome = pathname === "/";
  const homeReadableStyle = { color: "#ffffff" };

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

  useEffect(() => {
    function updateBrandState() {
      setIsBrandCompact(window.scrollY > 90);
    }

    updateBrandState();
    window.addEventListener("scroll", updateBrandState, { passive: true });
    return () => window.removeEventListener("scroll", updateBrandState);
  }, []);

  const activeNavHref = navItems.find((item) => isNavItemActive(pathname, item.href, currentHash))?.href ?? navItems[0]?.href;

  function moveNavHighlight(href: string | undefined, visible = true) {
    if (!href) {
      setNavHighlight((value) => ({ ...value, visible: false }));
      return;
    }

    const link = navLinkRefs.current[href];

    if (!link) {
      return;
    }

    setNavHighlight({
      x: link.offsetLeft,
      width: link.offsetWidth,
      visible,
    });
  }

  useEffect(() => {
    moveNavHighlight(activeNavHref, Boolean(activeNavHref));

    function handleResize() {
      moveNavHighlight(activeNavHref, Boolean(activeNavHref));
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeNavHref]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 py-3 sm:px-4">
      <nav className="mx-auto grid w-full max-w-[1900px] grid-cols-[auto_1fr_auto] items-start gap-3">
        <Link
          href="/"
          className={cn("ft-brand-link pointer-events-auto", isBrandCompact && "is-compact")}
          aria-label={`${siteConfig.name} home`}
        >
          <span className="ft-brand-mark" aria-hidden="true">
            <Image
              src="/images/brand/rvsn-logo-mark.png"
              alt=""
              width={48}
              height={48}
              priority
              className="h-full w-full object-cover"
            />
          </span>
          <motion.span
            className="ft-brand-word"
            animate={{
              width: isBrandCompact ? 0 : "auto",
              opacity: isBrandCompact ? 0 : 1,
              x: isBrandCompact ? -8 : 0,
            }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            RVSN
          </motion.span>
        </Link>

        <div
          className="aww-nav-pill pointer-events-auto mx-auto hidden h-16 w-full max-w-[865px] items-center justify-center gap-2 rounded-[18px] border border-white/10 px-2 shadow-[inset_0_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl lg:flex"
          onPointerLeave={() => moveNavHighlight(activeNavHref, Boolean(activeNavHref))}
        >
          <span
            className="aww-nav-highlight"
            style={{
              transform: `translateX(${navHighlight.x}px)`,
              width: `${navHighlight.width}px`,
              opacity: navHighlight.visible ? 1 : 0,
            }}
            aria-hidden="true"
          />
          {navItems.map((item) => {
            const isActive = isNavItemActive(pathname, item.href, currentHash);

            return (
              <a
                key={item.href}
                href={item.href}
                ref={(node) => {
                  navLinkRefs.current[item.href] = node;
                }}
                className={cn(
                  "aww-nav-link group relative inline-flex h-11 items-center justify-center overflow-hidden px-6 text-base font-medium transition",
                  isActive ? "!text-white" : "!text-white/84 hover:!text-white",
                )}
                style={homeReadableStyle}
                onPointerEnter={() => moveNavHighlight(item.href)}
                onFocus={() => moveNavHighlight(item.href)}
              >
                <span className="relative z-10" style={homeReadableStyle}>{item.label}</span>
              </a>
            );
          })}
        </div>

        <div className="pointer-events-auto hidden items-center justify-end gap-2 lg:flex">
          <button
            className={cn(
              "grid size-10 place-items-center rounded-[14px] border border-white/10 bg-white/8 shadow-[inset_0_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl transition",
              "!text-white hover:bg-white/14 hover:!text-white",
            )}
            style={homeReadableStyle}
            aria-label="Search"
            onClick={() => setIsSearchOpen((value) => !value)}
          >
            <Search size={18} />
          </button>
          <button
            className={cn(
              "relative grid size-10 place-items-center rounded-[14px] border border-white/10 bg-white/8 shadow-[inset_0_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl transition",
              "!text-white hover:bg-white/14 hover:!text-white",
            )}
            style={homeReadableStyle}
            aria-label="Open cart"
            onClick={openCart}
          >
            <ShoppingBag size={18} />
            {itemCount ? (
              <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-violet-300 text-[10px] font-black text-black">
                {itemCount}
              </span>
            ) : null}
          </button>
          {!isLoading && isAuthenticated ? (
            <>
              <Link
                href="/account"
                className={cn(
                  "grid size-10 place-items-center rounded-[14px] border border-white/10 bg-white/8 shadow-[inset_0_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl transition",
                  "!text-white hover:bg-white/14 hover:!text-white",
                )}
                style={homeReadableStyle}
                aria-label="Account"
              >
                <UserRound size={18} />
              </Link>
              {profile?.role === "admin" || profile?.role === "shipper" ? (
                <Link
                  href="/shipper"
                  className={cn(
                    "grid size-10 place-items-center rounded-[14px] border border-white/10 bg-white/8 shadow-[inset_0_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl transition",
                    "!text-white hover:bg-white/14 hover:!text-white",
                  )}
                  style={homeReadableStyle}
                  aria-label="Delivery desk"
                >
                  <Truck size={18} />
                </Link>
              ) : null}
              {profile?.role === "admin" ? (
                <Link
                  href="/admin"
                  className={cn(
                    "grid size-10 place-items-center rounded-[14px] border border-white/10 bg-white/8 shadow-[inset_0_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl transition",
                    "!text-white hover:bg-white/14 hover:!text-white",
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
                  "rounded-[14px] border-white/10 bg-white/8 !text-white shadow-[inset_0_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl hover:bg-white/14 hover:!text-white",
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
              className="inline-flex h-10 items-center justify-center rounded-[14px] border border-white/14 bg-white/10 px-5 text-sm font-extrabold !text-white shadow-[inset_0_1px_rgba(255,255,255,0.12),0_18px_42px_rgba(0,0,0,0.24)] backdrop-blur-2xl transition hover:border-white/28 hover:bg-white/18 hover:!text-white"
              style={homeReadableStyle}
            >
              Login
            </Link>
          )}
        </div>

        <div className="pointer-events-auto flex items-center justify-end gap-2 lg:hidden">
          <button
            className={cn(
              "grid size-10 place-items-center border",
              "rounded-[14px] border-white/10 bg-white/8 !text-white backdrop-blur-2xl",
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
              "rounded-[14px] border-white/10 bg-white/8 !text-white backdrop-blur-2xl",
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
            initial={{ height: 0, opacity: 0, y: -10, scale: 0.985 }}
            animate={{ height: "auto", opacity: 1, y: 0, scale: 1 }}
            exit={{ height: 0, opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSearch}
            className="pointer-events-auto mx-auto mt-2 w-[min(calc(100%_-_1.5rem),920px)] overflow-hidden rounded-[24px] border border-white/14 bg-white/8 shadow-[inset_0_1px_rgba(255,255,255,0.14),0_28px_80px_rgba(0,0,0,0.42),0_0_70px_rgba(124,58,237,0.14)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 p-2.5 sm:p-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-[16px] border border-white/10 bg-white/8 text-violet-100 shadow-[inset_0_1px_rgba(255,255,255,0.1)]">
                <Search size={18} />
              </span>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search jerseys, boots, training gear..."
                className={cn(
                  "h-11 min-w-0 flex-1 rounded-[16px] border border-white/10 bg-black/20 px-4 text-sm font-semibold outline-none transition",
                  "text-white placeholder:text-violet-100/42 focus:border-violet-200/70 focus:bg-black/28 focus:ring-4 focus:ring-violet-300/10",
                )}
              />
              <button className="h-11 shrink-0 rounded-[16px] bg-white px-4 text-sm font-extrabold !text-black shadow-[0_14px_36px_rgba(124,58,237,0.22)] transition hover:bg-violet-100 sm:px-6" type="submit">
                Search
              </button>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0, y: -12, scale: 0.985 }}
            animate={{ height: "auto", opacity: 1, y: 0, scale: 1 }}
            exit={{ height: 0, opacity: 0, y: -10, scale: 0.985 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="aww-mobile-menu pointer-events-auto lg:hidden"
          >
            <motion.div
              className="grid gap-3"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
                closed: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
              }}
            >
              {navItems.map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  variants={mobileMenuItemVariants}
                  className={cn(
                    "aww-mobile-menu-item",
                    isHome
                      ? isNavItemActive(pathname, item.href, currentHash)
                        ? "is-active"
                        : ""
                      : isNavItemActive(pathname, item.href, currentHash)
                        ? "is-active"
                        : "",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.button
                variants={mobileMenuItemVariants}
                className={cn(
                  "aww-mobile-menu-item flex items-center justify-between text-left",
                )}
                onClick={() => {
                  setIsOpen(false);
                  openCart();
                }}
              >
                <span>Cart</span>
                <span className="rounded-full bg-violet-200 px-2.5 py-0.5 text-xs font-black text-black shadow-[0_0_18px_rgba(196,181,253,0.42)]">{itemCount}</span>
              </motion.button>
              {!isLoading && isAuthenticated ? (
                <>
                  <motion.div variants={mobileMenuItemVariants}>
                    <Link
                    href="/account"
                    className={cn(
                      "aww-mobile-menu-item",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    Account
                    </Link>
                  </motion.div>
                  {profile?.role === "admin" || profile?.role === "shipper" ? (
                    <motion.div variants={mobileMenuItemVariants}>
                      <Link
                        href="/shipper"
                        className={cn(
                          "aww-mobile-menu-item",
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        Delivery desk
                      </Link>
                    </motion.div>
                  ) : null}
                  {profile?.role === "admin" ? (
                    <motion.div variants={mobileMenuItemVariants}>
                      <Link
                        href="/admin"
                        className={cn(
                          "aww-mobile-menu-item",
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        Admin dashboard
                      </Link>
                    </motion.div>
                  ) : null}
                  <motion.button
                    variants={mobileMenuItemVariants}
                    className={cn(
                      "aww-mobile-menu-item text-left",
                    )}
                    onClick={() => {
                      setIsOpen(false);
                      void logout();
                    }}
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <motion.div variants={mobileMenuItemVariants}>
                  <Link
                    href="/login"
                    className="aww-mobile-menu-item is-active"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                </motion.div>
              )}
              <motion.div variants={mobileMenuItemVariants}>
                <CountryCurrencySelect isHome={isHome} compact className="aww-mobile-menu-select pt-1" />
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

const mobileMenuItemVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.46, ease: [0.16, 1, 0.3, 1] },
  },
  closed: {
    opacity: 0,
    y: -10,
    scale: 0.985,
    filter: "blur(4px)",
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

function isNavItemActive(pathname: string, href: string, currentHash: string) {
  if (href === "/products") {
    return pathname.startsWith("/products");
  }

  if (href.startsWith("/#")) {
    return pathname === "/" && currentHash === href.replace("/", "");
  }

  return pathname === href;
}
