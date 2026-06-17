"use client";

import { ArrowRight, Mail, Play, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  featuredBoots,
  heroSignals,
  newArrivals,
  popularClubs,
  trendingJerseys,
} from "@/config/home";
import { ClubMarquee } from "@/components/home/club-marquee";
import { ProductShowcaseCard } from "@/components/home/product-showcase-card";
import { SectionTitle } from "@/components/home/section-title";
import { cn } from "@/lib/utils";

const heroWords = ["Shop", "football", "gear", "built", "for", "matchday."];
const heroLayout: "fullscreen-video" | "card-video" = "fullscreen-video";
const heroVideoSrc = "/videos/hero/football-hero-720p.mp4";

const heroIntro: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const heroReveal: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.68, ease: "easeOut" },
  },
};

export function HomePage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 160]);
  const heroOpacity = useTransform(scrollY, [0, 560], [1, 0.18]);
  const isFullscreenHero = heroLayout === "fullscreen-video";

  return (
    <>
      <section className={cn("relative isolate min-h-screen overflow-hidden border-b border-slate-200 pt-20", isFullscreenHero && "bg-slate-950")}>
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 -z-10">
          {isFullscreenHero ? (
            <>
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster="/images/hero/hero-football-store.png"
                aria-label="Cinematic football ecommerce hero video"
              >
                <source src={heroVideoSrc} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.9)_0%,rgba(2,6,23,0.62)_38%,rgba(2,6,23,0.28)_72%,rgba(2,6,23,0.72)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,rgba(215,255,47,0.24),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.12)_0%,rgba(2,6,23,0.92)_100%)]" />
              <div className="stadium-lights absolute inset-0 opacity-45" />
            </>
          ) : (
            <>
              <div className="cinematic-hero absolute inset-0" />
              <div className="stadium-lights absolute inset-0" />
              <div className="animated-pitch absolute inset-x-0 bottom-0 h-[55vh]" />
              <motion.div
                className="football-orbit absolute left-[58%] top-[18%] hidden size-44 sm:block"
                animate={{ y: [0, -22, 0], rotate: [0, 12, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="football-core" />
              </motion.div>
              <motion.div
                className="absolute left-[8%] top-[22%] h-28 w-28 border border-lime-300/20 bg-lime-300/5 blur-[1px]"
                animate={{ y: [0, 18, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-[18%] right-[12%] h-20 w-20 border border-cyan-300/20 bg-cyan-300/5"
                animate={{ y: [0, -16, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              />
            </>
          )}
        </motion.div>

        <div
          className={cn(
            "container-shell grid min-h-[calc(100vh-5rem)] items-center gap-12 py-16",
            isFullscreenHero ? "lg:grid-cols-[minmax(0,0.9fr)_minmax(260px,0.45fr)]" : "lg:grid-cols-[1fr_0.9fr]",
          )}
        >
          <motion.div
            variants={heroIntro}
            initial="hidden"
            animate="show"
            className={cn("max-w-4xl", isFullscreenHero && "pt-12 sm:pt-0")}
          >
            <motion.p
              variants={heroReveal}
              className={cn(
                "inline-flex items-center gap-2 border border-lime-300 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]",
                isFullscreenHero ? "bg-lime-300 text-slate-950 shadow-lg shadow-lime-950/30" : "bg-lime-200/70 text-slate-950",
              )}
            >
              <Sparkles size={14} />
              New season energy
            </motion.p>
            <motion.h1
              variants={heroIntro}
              className={cn(
                "mt-5 flex max-w-[9ch] flex-wrap gap-x-3 gap-y-1 text-[3.85rem] font-black leading-[0.9] min-[390px]:text-[4.15rem] sm:mt-6 sm:max-w-none sm:gap-x-4 sm:text-balance sm:text-7xl sm:leading-[0.9] lg:text-8xl",
                isFullscreenHero
                  ? "max-w-[11ch] text-white [text-shadow:0_12px_42px_rgba(0,0,0,0.72)]"
                  : "text-slate-950 [text-shadow:0_8px_28px_rgba(15,23,42,0.18)]",
              )}
            >
              {heroWords.map((word) => (
                <span key={word} className="overflow-hidden pb-1">
                  <motion.span variants={heroReveal} className="inline-block">
                    {word}
                  </motion.span>
                </span>
              ))}
            </motion.h1>
            <motion.p
              variants={heroReveal}
              className={cn(
                "mt-5 max-w-2xl text-pretty text-base font-semibold leading-7 sm:mt-6 sm:text-lg sm:leading-8",
                isFullscreenHero ? "text-slate-100 [text-shadow:0_3px_20px_rgba(0,0,0,0.7)]" : "text-slate-600",
              )}
            >
              Browse elite jerseys, precision boots, training essentials, club capsules, and new arrivals in a lighter
              premium ecommerce experience.
            </motion.p>
            <motion.div variants={heroReveal} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <motion.a
                href="/products"
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex h-12 items-center justify-center gap-2 bg-lime-300 px-6 text-sm font-extrabold !text-slate-950 shadow-xl shadow-lime-950/25 transition hover:bg-white"
              >
                Explore drops
                <ArrowRight size={18} />
              </motion.a>
              <motion.a
                href="/category/boots"
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2 border px-6 text-sm font-semibold transition",
                  isFullscreenHero
                    ? "border-white/45 bg-white/18 !text-white shadow-xl shadow-slate-950/20 backdrop-blur hover:border-lime-300 hover:bg-lime-300 hover:!text-slate-950"
                    : "border-slate-300 bg-white text-slate-950 hover:border-slate-950",
                )}
              >
                <Play size={17} />
                Shop boots
              </motion.a>
            </motion.div>
          </motion.div>

          {isFullscreenHero ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
              className="hidden self-end justify-self-end border border-white/20 bg-slate-950/52 p-5 text-white shadow-2xl shadow-slate-950/40 backdrop-blur-xl lg:block"
            >
              <p className="inline-flex bg-lime-300 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-slate-950">
                Featured drop
              </p>
              <h2 className="mt-4 text-3xl font-black leading-none">Volt Strike Pack</h2>
              <p className="mt-3 max-w-xs text-sm font-semibold leading-6 text-slate-100">
                Electric kit energy for players who light up the pitch.
              </p>
              <Link href="/products" className="mt-5 inline-flex h-11 items-center justify-center gap-2 bg-lime-300 px-4 text-sm font-black !text-slate-950 shadow-lg shadow-lime-950/20 transition hover:bg-white">
                View products
                <ArrowRight size={17} />
              </Link>
            </motion.div>
          ) : (
            <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
            transition={{
              opacity: { duration: 0.75, ease: "easeOut", delay: 0.15 },
              scale: { duration: 0.75, ease: "easeOut", delay: 0.15 },
              y: { duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 },
            }}
            className="group relative mx-auto w-full max-w-[520px] overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200 transition hover:border-lime-300 sm:p-4"
          >
            <Link href="/products" aria-label="Open products page" className="block">
              <div className="relative min-h-[460px] overflow-hidden rounded-sm border border-slate-100 bg-slate-100 sm:aspect-[4/5] sm:min-h-0">
                {heroVideoSrc ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/images/hero/hero-football-store.png"
                    aria-label="Football ecommerce hero video"
                  >
                    <source src={heroVideoSrc} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src="/images/hero/hero-football-store.png"
                    alt="Football ecommerce hero collection"
                    fill
                    priority
                    sizes="(min-width: 1024px) 520px, 100vw"
                    className="hero-media-motion object-cover transition duration-700 group-hover:scale-105"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 translate-x-[-135%] skew-x-[-18deg] bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.08)_34%,rgba(255,255,255,0.78)_48%,rgba(215,255,47,0.28)_58%,transparent_72%)] opacity-0 transition duration-700 ease-out group-hover:translate-x-[135%] group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.24),transparent_42%)]" />
                <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black via-black/72 to-transparent" />
                <div className="absolute bottom-5 left-4 right-4 rounded-sm bg-black/18 p-1 backdrop-blur-[1px] sm:left-5 sm:right-5">
                  <p className="inline-flex bg-lime-300 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-slate-950 shadow-lg shadow-slate-950/20 sm:text-xs">
                    Featured drop
                  </p>
                  <h2 className="mt-3 text-3xl font-black leading-none !text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] sm:text-4xl">
                    Volt Strike Pack
                  </h2>
                  <p className="mt-2 max-w-xs text-sm font-semibold leading-5 !text-lime-100 drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] sm:text-base">
                    Electric kit energy for players who light up the pitch.
                  </p>
                </div>
              </div>
            </Link>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {heroSignals.map((signal) => (
                <div key={signal.label} className="border border-slate-200 bg-slate-50 p-3">
                  <signal.icon className="text-slate-950" size={18} />
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{signal.label}</p>
                  <p className="mt-1 text-sm font-black text-slate-950">{signal.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
          )}
        </div>
        {isFullscreenHero ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 hidden justify-center sm:flex">
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/70">Scroll for club drops</span>
          </div>
        ) : null}
      </section>

      <section id="clubs" className="container-shell py-14 sm:py-16">
        <SectionTitle
          eyebrow="Popular clubs"
          title="Club shops in motion."
          description="The infinite club animation now sits directly below the hero, with premium badge-style team marks."
        />
        <ClubMarquee clubs={popularClubs} />
      </section>

      <ShowcaseSection
        id="trending"
        eyebrow="Trending jerseys"
        title="Kits that own the tunnel."
        description="Bold club-inspired designs with speed, heritage, and street-ready energy."
        items={trendingJerseys}
      />

      <ShowcaseSection
        id="featured-boots"
        eyebrow="Featured boots"
        title="Built for first touch and final strike."
        description="A fast-moving boot wall with precision, grip, and explosive visual energy."
        items={featuredBoots}
        alternate
      />

      <section id="arrivals" className="border-y border-slate-200 bg-white py-20 sm:py-24">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionTitle
            eyebrow="New arrivals"
            title="Fresh from the training ground."
            description="Fresh layers, gloves, and matchday extras ready for cold sessions, wet pitches, and late winners."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {newArrivals.map((arrival, index) => (
              <motion.article
                key={arrival.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.06 }}
                className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm"
              >
                <Link href={arrival.href} className="block">
                <arrival.icon className="text-slate-950" size={26} />
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{arrival.category}</p>
                <h3 className="mt-2 text-xl font-black text-slate-950">{arrival.title}</h3>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="newsletter" className="container-shell py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-lg border border-lime-300/25 bg-lime-300 p-5 text-slate-950 sm:p-8 lg:p-10"
        >
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_80%_35%,rgba(15,23,42,0.28),transparent_30%),linear-gradient(135deg,transparent,rgba(15,23,42,0.18))] lg:block" />
          <div className="relative max-w-2xl">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.24em]">Clubhouse access</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">Get the next drop before kickoff.</h2>
            <p className="mt-4 text-sm font-medium leading-7 text-slate-800 sm:text-base">
              Get boot launches, jersey capsules, and club-inspired drops before the crowd sees them.
            </p>
            <form className="mt-7 grid gap-3 sm:flex sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Email address"
                className="h-14 w-full min-w-0 flex-1 border border-slate-950/20 bg-white/85 px-4 text-base font-semibold text-slate-950 outline-none placeholder:text-slate-600 focus:border-slate-950 sm:h-12 sm:text-sm"
              />
              <motion.button
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex h-14 w-full items-center justify-center gap-2 bg-slate-950 px-6 text-sm font-extrabold text-white sm:h-12 sm:w-auto"
              >
                <Mail size={18} />
                Notify me
              </motion.button>
            </form>
          </div>
        </motion.div>
      </section>
    </>
  );
}

type ShowcaseSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  items: typeof trendingJerseys;
  alternate?: boolean;
};

function ShowcaseSection({ id, eyebrow, title, description, items, alternate }: ShowcaseSectionProps) {
  return (
    <section id={id} className={cn("py-20 sm:py-24", alternate ? "border-y border-slate-200 bg-white" : "")}>
      <div className="container-shell">
        <SectionTitle eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((item, index) => (
            <ProductShowcaseCard key={item.name} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
