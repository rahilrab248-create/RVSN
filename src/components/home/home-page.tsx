"use client";

import { ArrowRight, Footprints, Mail, PackageCheck, Shirt, Trophy } from "lucide-react";
import { motion, useMotionTemplate, useScroll, useTransform, type MotionValue, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ClubMarquee } from "@/components/home/club-marquee";
import { ProductShowcaseCard } from "@/components/home/product-showcase-card";
import { popularClubs, trendingJerseys, type ShowcaseItem } from "@/config/home";

const ease = [0.16, 1, 0.3, 1] as const;
const approachStatement = "We combine football taste, product clarity and cinematic motion to create a store that feels built for the tunnel.";
const mobileHeroSlideDuration = 7800;
const mobileHeroSlides = [
  {
    title: "Purple speed",
    image: "/images/hero/mobile-hero-purple-boots.png",
    position: "center",
  },
  {
    title: "For the players",
    image: "/images/hero/mobile-hero-player-socks.jpeg",
    position: "center",
  },
  {
    title: "Rocha jersey",
    image: "/images/hero/mobile-hero-rocha-jersey.png",
    position: "center",
  },
];

const reveal: Variants = {
  hidden: { opacity: 0, y: 70, scale: 0.975 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1.05, ease },
  },
};

const lineReveal: Variants = {
  hidden: { opacity: 0, y: "120%", rotateX: 18 },
  show: (index: number) => ({
    opacity: 1,
    y: "0%",
    rotateX: 0,
    transition: { duration: 1.05, delay: 0.18 + index * 0.1, ease },
  }),
};

const serviceTiles = [
  {
    title: "Jersey Strategy",
    count: "/6 drops",
    href: "/category/jerseys",
    image: "/images/products/heritage-gold-jersey.webp",
    icon: Shirt,
    tags: ["Club editions", "Elite fit", "Limited kits", "Street layers", "Heritage colorways"],
  },
  {
    title: "Boot Identity",
    count: "/34 boots",
    href: "/category/astro-turf-football-boots",
    image: "/images/products/nike-phantom-6-low-pro-hj4123-446-1.jpg",
    icon: Footprints,
    tags: ["Speed plates", "Touch zones", "Firm ground", "Power strikes", "Control builds"],
  },
  {
    title: "Matchday Design",
    count: "/6 edits",
    href: "/products",
    image: "/images/hero/hero-football-store.png",
    icon: Trophy,
    tags: ["Drop curation", "Club energy", "Tunnel looks", "Game-ready layers", "Premium capsules"],
  },
  {
    title: "Training Content",
    count: "/3 packs",
    href: "/category/training",
    image: "/images/products/rain-ready-training-layer.webp",
    icon: PackageCheck,
    tags: ["Rain shells", "Grip gloves", "Recovery fits", "Cold sessions", "Travel gear"],
  },
];

const projects = [
  {
    title: "Volt Strike Pack",
    href: "/products",
    image: "/images/hero/hero-football-store.png",
    description:
      "A high-energy launch capsule shaped around electric kit color, precision boots, and the visual pressure of a night match.",
    details: [
      ["Location", "Global"],
      ["Industry", "Football retail"],
      ["Services", "Kits, boots, drops"],
    ],
  },
  {
    title: "Nike Phantom 6 Low Pro",
    href: "/products/nike-phantom-6-low-pro-hj4123-446",
    image: "/images/products/nike-phantom-6-low-pro-hj4123-446-1.jpg",
    description:
      "A darker boot story for players who build the match through touch, control, and quick changes on astro turf.",
    details: [
      ["Category", "Boot room"],
      ["Fit", "Control"],
      ["Surface", "Firm ground"],
    ],
  },
  {
    title: "Night Derby Jersey",
    href: "/products/night-derby-jersey",
    image: "/images/products/night-derby-purple-pantera.jpeg",
    description:
      "An away-day jersey system with sharp contrast, club attitude, and enough polish to move from pitch to street.",
    details: [
      ["Category", "Jerseys"],
      ["Drop", "Derby night"],
      ["Mood", "Editorial"],
    ],
  },
];

const testimonials = [
  {
    quote:
      "The store feels like a football campaign now. Every section has movement, but the products are still easy to understand.",
    name: "Academy Player",
    role: "Boot rotation",
  },
  {
    quote:
      "The kit cards and club motion make browsing feel premium. It has the confidence of a launch page, not a basic catalog.",
    name: "Matchday Buyer",
    role: "Club supporter",
  },
  {
    quote:
      "The new rhythm gives the brand a real point of view while keeping checkout and product discovery clear.",
    name: "Store Admin",
    role: "Operations",
  },
  {
    quote:
      "The darker purple grading and large rounded sections give the whole store a more expensive football identity.",
    name: "Creative Lead",
    role: "Visual direction",
  },
];

const insights = [
  {
    title: "How to Build a Matchday Rotation",
    date: "Kit guide",
    href: "/category/jerseys",
    image: "/images/products/mexico_heritage_jersey.webp",
  },
  {
    title: "Speed, Control, Power: Choosing the Right Boot",
    date: "Boot room",
    href: "/category/mens-football-boots",
    image: "/images/products/nike-phantom-6-low-pro-erling-haaland-ih1788-603-1.jpg",
  },
];

const approachImages = [
  {
    title: "Jersey edits",
    label: "01",
    image: "/images/approach/rvsn-approach-jersey-drops.png",
    className: "is-primary",
  },
  {
    title: "Boot room",
    label: "02",
    image: "/images/approach/rvsn-approach-boot-room.png",
    className: "is-secondary",
  },
  {
    title: "Club energy",
    label: "03",
    image: "/images/approach/rvsn-approach-club-energy.png",
    className: "is-tertiary",
  },
];

type ApproachSpotlightState = {
  currentX: number;
  currentY: number;
  currentSpread: number;
  currentSkew: number;
  currentMainW: number;
  currentMainH: number;
  currentSideW: number;
  currentSideH: number;
  isActive: boolean;
  targetX: number;
  targetY: number;
  targetSpread: number;
  targetSkew: number;
  targetMainW: number;
  targetMainH: number;
  targetSideW: number;
  targetSideH: number;
  frame: number | null;
};

const approachSpotlights = new WeakMap<HTMLElement, ApproachSpotlightState>();

function getApproachSpotlightState(element: HTMLElement) {
  let state = approachSpotlights.get(element);

  if (!state) {
    state = {
      currentX: 50,
      currentY: 50,
      currentSpread: 1,
      currentSkew: 0,
      currentMainW: 9.4,
      currentMainH: 6.4,
      currentSideW: 5.1,
      currentSideH: 3.8,
      isActive: false,
      targetX: 50,
      targetY: 50,
      targetSpread: 1,
      targetSkew: 0,
      targetMainW: 9.4,
      targetMainH: 6.4,
      targetSideW: 5.1,
      targetSideH: 3.8,
      frame: null,
    };
    approachSpotlights.set(element, state);
  }

  return state;
}

function animateApproachSpotlight(element: HTMLElement, state: ApproachSpotlightState) {
  const phase = performance.now() * 0.001;
  const shapePulse = state.isActive ? 1 : 0;

  state.currentX += (state.targetX - state.currentX) * 0.12;
  state.currentY += (state.targetY - state.currentY) * 0.12;
  state.currentSpread += (state.targetSpread - state.currentSpread) * 0.1;
  state.currentSkew += (state.targetSkew - state.currentSkew) * 0.1;
  state.currentMainW += (state.targetMainW - state.currentMainW) * 0.1;
  state.currentMainH += (state.targetMainH - state.currentMainH) * 0.1;
  state.currentSideW += (state.targetSideW - state.currentSideW) * 0.1;
  state.currentSideH += (state.targetSideH - state.currentSideH) * 0.1;

  const mainW = state.currentMainW + Math.sin(phase * 1.55 + state.currentY * 0.025) * 0.88 * shapePulse;
  const mainH = state.currentMainH + Math.cos(phase * 1.25 + state.currentX * 0.022) * 0.74 * shapePulse;
  const sideW = state.currentSideW + Math.cos(phase * 1.8 + state.currentX * 0.018) * 0.62 * shapePulse;
  const sideH = state.currentSideH + Math.sin(phase * 1.7 + state.currentY * 0.02) * 0.68 * shapePulse;
  const skew = state.currentSkew + Math.sin(phase * 1.15 + state.currentX * 0.015) * 0.95 * shapePulse;
  const lowerX = Math.cos(phase * 1.35 + state.currentY * 0.018) * 1.35 * shapePulse;
  const lowerY = Math.sin(phase * 1.2 + state.currentX * 0.016) * 1.15 * shapePulse;

  element.style.setProperty("--spotlight-x", `${state.currentX.toFixed(2)}%`);
  element.style.setProperty("--spotlight-y", `${state.currentY.toFixed(2)}%`);
  element.style.setProperty("--spotlight-spread", state.currentSpread.toFixed(3));
  element.style.setProperty("--spotlight-skew", `${skew.toFixed(2)}rem`);
  element.style.setProperty("--spotlight-main-w", `${Math.max(7.2, mainW).toFixed(2)}rem`);
  element.style.setProperty("--spotlight-main-h", `${Math.max(4.8, mainH).toFixed(2)}rem`);
  element.style.setProperty("--spotlight-side-w", `${Math.max(3.2, sideW).toFixed(2)}rem`);
  element.style.setProperty("--spotlight-side-h", `${Math.max(2.7, sideH).toFixed(2)}rem`);
  element.style.setProperty("--spotlight-lower-x", `${lowerX.toFixed(2)}rem`);
  element.style.setProperty("--spotlight-lower-y", `${lowerY.toFixed(2)}rem`);

  const isSettled =
    Math.abs(state.targetX - state.currentX) < 0.08 &&
    Math.abs(state.targetY - state.currentY) < 0.08 &&
    Math.abs(state.targetSpread - state.currentSpread) < 0.004 &&
    Math.abs(state.targetSkew - state.currentSkew) < 0.01 &&
    Math.abs(state.targetMainW - state.currentMainW) < 0.01 &&
    Math.abs(state.targetMainH - state.currentMainH) < 0.01 &&
    Math.abs(state.targetSideW - state.currentSideW) < 0.01 &&
    Math.abs(state.targetSideH - state.currentSideH) < 0.01;

  if (isSettled && !state.isActive) {
    state.frame = null;
    return;
  }

  state.frame = window.requestAnimationFrame(() => animateApproachSpotlight(element, state));
}

export function HomePage() {
  const approachRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: approachRef, offset: ["start end", "end start"] });
  const approachGalleryY = useTransform(scrollYProgress, [0.1, 0.72], ["32px", "-28px"]);
  const approachGalleryScale = useTransform(scrollYProgress, [0.12, 0.52], [0.98, 1]);
  const approachBackgroundChannel = useTransform(scrollYProgress, [0.36, 0.66], [14, 2]);
  const approachVioletAlpha = useTransform(scrollYProgress, [0.12, 0.48, 0.82], [0.3, 0.44, 0.2]);
  const approachBlueAlpha = useTransform(scrollYProgress, [0.18, 0.54, 0.82], [0.14, 0.24, 0.11]);
  const approachTextChannel = useTransform(scrollYProgress, [0.44, 0.62], [255, 255]);
  const approachPlainTextColor = useMotionTemplate`rgb(${approachTextChannel}, ${approachTextChannel}, ${approachTextChannel})`;
  const approachBackground = useMotionTemplate`
    radial-gradient(circle at 50% 58%, rgba(124, 58, 237, ${approachVioletAlpha}), transparent 44rem),
    radial-gradient(circle at 16% 44%, rgba(59, 130, 246, ${approachBlueAlpha}), transparent 34rem),
    radial-gradient(circle at 84% 78%, rgba(168, 85, 247, 0.12), transparent 30rem),
    linear-gradient(180deg, #080413 0%, rgb(${approachBackgroundChannel}, ${approachBackgroundChannel}, ${approachBackgroundChannel}) 54%, #020106 100%)
  `;

  function moveApproachSpotlight(event: PointerEvent<HTMLElement>) {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const state = getApproachSpotlightState(target);
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const centerPull = Math.hypot(x - 50, y - 50) / 70;

    state.targetX = x;
    state.targetY = y;
    state.targetSpread = 0.92 + Math.min(centerPull, 1) * 0.32 + Math.sin((x + y) * 0.08) * 0.06;
    state.targetSkew = Math.sin(x * 0.075) * 1.45 + Math.cos(y * 0.06) * 0.9;
    state.targetMainW = 8.8 + state.targetSpread * 1.75 + Math.sin(y * 0.11) * 0.72;
    state.targetMainH = 6.1 + (1.24 - state.targetSpread) * 2 + Math.cos(x * 0.09) * 0.54;
    state.targetSideW = 4.7 + Math.cos((x + y) * 0.06) * 0.88;
    state.targetSideH = 3.5 + Math.sin((x - y) * 0.07) * 0.82;

    if (state.frame === null) {
      state.frame = window.requestAnimationFrame(() => animateApproachSpotlight(target, state));
    }
  }

  function activateApproachSpotlight(event: PointerEvent<HTMLElement>) {
    const target = event.currentTarget;
    const state = getApproachSpotlightState(target);

    state.isActive = true;

    if (state.frame === null) {
      state.frame = window.requestAnimationFrame(() => animateApproachSpotlight(target, state));
    }
  }

  function deactivateApproachSpotlight(event: PointerEvent<HTMLElement>) {
    const target = event.currentTarget;
    const state = getApproachSpotlightState(target);

    state.isActive = false;

    if (state.frame === null) {
      state.frame = window.requestAnimationFrame(() => animateApproachSpotlight(target, state));
    }
  }

  return (
    <main className="aww-page text-white">
      <section id="hero" className="aww-hero">
        <div className="aww-hero-bg" aria-hidden="true" />
        <motion.div
          className="aww-hero-full-image"
          initial={{ opacity: 0, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.25, ease, delay: 0.12 }}
          aria-hidden="true"
        >
          <Image
            src="/images/hero/rvsn-hero-full-background.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <MobileHeroCarousel />

        <div className="aww-hero-copy">
          <motion.p custom={0} variants={lineReveal} initial="hidden" animate="show" className="aww-eyebrow overflow-hidden">
            RVSN football studio
          </motion.p>
          <h1 className="aww-hero-title">
            {["RVSN is a premium", "football store in motion.", "We shape kits, boots and club drops", "with cinematic precision."].map(
              (line, index) => (
                <span key={line} className={index > 1 ? "text-white/38" : undefined}>
                  <motion.span custom={index + 1} variants={lineReveal} initial="hidden" animate="show" className="block">
                    {line}
                  </motion.span>
                </span>
              ),
            )}
          </h1>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.05, ease }}>
            <Link href="/products" className="aww-cta aww-hero-cta">
              Shop the drop <span />
            </Link>
          </motion.div>
        </div>
        <a className="aww-scroll-cue" href="#services">
          Scroll
        </a>
      </section>

      <section id="services" className="aww-light-section">
        <motion.p variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-8%" }} className="aww-section-eyebrow">
          Our services
        </motion.p>
        <div className="aww-service-grid">
          {serviceTiles.map((tile, index) => (
            <ServiceCard key={tile.title} tile={tile} index={index} />
          ))}
        </div>
      </section>

      <motion.section ref={approachRef} id="about" className="aww-approach" style={{ background: approachBackground, color: approachPlainTextColor }}>
        <motion.div className="aww-approach-copy" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}>
          <p className="aww-section-eyebrow">Our approach and values</p>
          <ScrollRevealStatement text={approachStatement} progress={scrollYProgress} />
        </motion.div>
        <motion.div
          style={{ y: approachGalleryY, scale: approachGalleryScale }}
          className="aww-approach-gallery"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.24 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {approachImages.map((item, index) => (
            <motion.figure
              key={item.title}
              className={`aww-approach-image ${item.className}`}
              style={{ "--approach-image": `url(${item.image})` } as CSSProperties}
              onPointerEnter={activateApproachSpotlight}
              onPointerMove={moveApproachSpotlight}
              onPointerLeave={deactivateApproachSpotlight}
              variants={{
                hidden: { opacity: 0, clipPath: "inset(18% 0 18% 0)", filter: "blur(10px)", y: 32, scale: 0.985 },
                show: {
                  opacity: 1,
                  clipPath: "inset(0 0 0 0)",
                  filter: "blur(0px)",
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.82, ease, delay: index * 0.02 },
                },
              }}
            >
              <Image src={item.image} alt={item.title} fill sizes="(max-width: 900px) 92vw, 42vw" className="object-cover" />
              <span className="aww-approach-reveal" aria-hidden="true" />
              <figcaption>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </motion.section>

      <section id="portfolio" className="aww-dark-section aww-approach-continuation">
        <motion.p custom={0} variants={lineReveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-12%" }} className="aww-section-eyebrow aww-work-label overflow-hidden">
          Latest work
        </motion.p>
        <div className="aww-project-list">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
        <Link href="/products" className="aww-cta mx-auto mt-10">
          View all products <span />
        </Link>
      </section>

      <section id="clubs" className="aww-dark-section aww-clubs-section !pt-0">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-8%" }} className="mb-8">
          <p className="aww-section-eyebrow">Popular clubs</p>
          <h2 className="aww-section-title">Club shops in constant motion.</h2>
        </motion.div>
        <ClubMarquee clubs={popularClubs} />
      </section>

      <section id="trending" className="aww-light-section">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-8%" }} className="mb-8">
          <p className="aww-section-eyebrow">Trending jerseys</p>
          <h2 className="aww-section-title">Kits that own the tunnel.</h2>
        </motion.div>
        <ShowcaseGrid items={trendingJerseys} />
      </section>

      <section className="aww-testimonials">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-8%" }} className="aww-testimonial-shell">
          <div className="aww-testimonial-intro">
            <p className="aww-eyebrow rounded-lg bg-black px-4 py-3 text-white opacity-100">Testimonials</p>
            <h2>
              What players say <span>about shopping here.</span>
            </h2>
            <Link href="/products" className="aww-cta mt-auto">
              Start shopping <span />
            </Link>
          </div>
          <div className="aww-testimonial-rail">
            <div className="aww-testimonial-track">
              {[...testimonials, ...testimonials].map((item, index) => (
                <figure key={`${item.name}-${index}`} className="aww-testimonial-card">
                  <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
                  <figcaption>
                    <strong>{item.name}</strong>
                    <small>{item.role}</small>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="arrivals" className="aww-news">
        <motion.p variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-8%" }} className="aww-section-eyebrow">
          Latest news
        </motion.p>
        <div className="aww-news-stage">
          {insights.map((item, index) => (
            <InsightCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </section>

      <section id="newsletter" className="aww-contact">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-8%" }} className="aww-contact-copy">
          <p className="aww-section-eyebrow">Ready before kickoff?</p>
          <h2>Get early access to the next drop.</h2>
        </motion.div>
        <motion.form variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-8%" }} className="aww-quote-form">
          <label>
            Your name
            <input type="text" name="name" />
          </label>
          <label>
            Email
            <input type="email" name="email" />
          </label>
          <label className="wide">
            What are you looking for?
            <textarea name="message" rows={5} />
          </label>
          <button className="aww-cta" type="button">
            Join clubhouse <Mail size={16} />
          </button>
        </motion.form>
      </section>
    </main>
  );
}

function MobileHeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitionGlitching, setIsTransitionGlitching] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isTransitionGlitchingRef = useRef(false);
  const switchTimeoutRef = useRef<number | null>(null);
  const settleTimeoutRef = useRef<number | null>(null);
  const { scrollYProgress } = useScroll({ target: carouselRef, offset: ["start start", "end start"] });
  const imageScrollY = useTransform(scrollYProgress, [0, 1], ["0%", "9%"]);
  const imageScrollScale = useTransform(scrollYProgress, [0, 1], [1, 1.055]);
  const contentScrollY = useTransform(scrollYProgress, [0, 1], ["0px", "28px"]);

  useEffect(() => {
    function triggerGlitchCut(nextIndex?: number) {
      if (isTransitionGlitchingRef.current) {
        return;
      }

      isTransitionGlitchingRef.current = true;
      setIsTransitionGlitching(true);
      switchTimeoutRef.current = window.setTimeout(() => {
        setActiveIndex((index) => (typeof nextIndex === "number" ? nextIndex : (index + 1) % mobileHeroSlides.length));
      }, 360);
      settleTimeoutRef.current = window.setTimeout(() => {
        isTransitionGlitchingRef.current = false;
        setIsTransitionGlitching(false);
      }, 980);
    }

    const timer = window.setInterval(() => {
      triggerGlitchCut();
    }, mobileHeroSlideDuration);

    return () => {
      window.clearInterval(timer);
      if (switchTimeoutRef.current) window.clearTimeout(switchTimeoutRef.current);
      if (settleTimeoutRef.current) window.clearTimeout(settleTimeoutRef.current);
    };
  }, []);

  function showSlide(index: number) {
    if (index === activeIndex || isTransitionGlitchingRef.current) {
      return;
    }

    isTransitionGlitchingRef.current = true;
    setIsTransitionGlitching(true);
    switchTimeoutRef.current = window.setTimeout(() => {
      setActiveIndex(index);
    }, 360);
    settleTimeoutRef.current = window.setTimeout(() => {
      isTransitionGlitchingRef.current = false;
      setIsTransitionGlitching(false);
    }, 980);
  }

  return (
    <div ref={carouselRef} className={`aww-mobile-hero-carousel ${isTransitionGlitching ? "is-glitch-cutting" : ""}`} aria-label="Featured football drops carousel">
      <div className="aww-mobile-phone-frame">
        {mobileHeroSlides.map((slide, index) => (
          <motion.div
            key={slide.title}
            className={`aww-mobile-hero-slide ${activeIndex === index ? "is-active" : ""}`}
            style={{ "--hero-glitch-image": `url(${slide.image})` } as CSSProperties}
            initial={false}
            animate={{
              opacity: activeIndex === index ? 1 : 0,
              scale: 1,
            }}
            transition={{ duration: 0.08, ease: "linear" }}
            aria-hidden={activeIndex !== index}
          >
            <motion.div className="aww-mobile-hero-image-wrap" style={{ y: imageScrollY, scale: imageScrollScale }}>
              <Image src={slide.image} alt={slide.title} fill sizes="100vw" className="object-cover" style={{ objectPosition: slide.position }} priority={index === 0} />
            </motion.div>
            <motion.div className="aww-mobile-slide-content" style={{ y: contentScrollY }}>
              <span>
                {String(index + 1).padStart(2, "0")} / {String(mobileHeroSlides.length).padStart(2, "0")}
              </span>
              <div className="aww-mobile-slide-label">{slide.title}</div>
            </motion.div>
          </motion.div>
        ))}
      </div>
      <div className="aww-mobile-progress" aria-hidden="true">
        {mobileHeroSlides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            className={index === activeIndex ? "is-active" : ""}
            onClick={() => showSlide(index)}
            aria-label={`Show ${slide.title}`}
          >
            <span />
          </button>
        ))}
      </div>
    </div>
  );
}

function ScrollRevealStatement({ text, progress }: { text: string; progress: MotionValue<number> }) {
  const words = text.split(" ");

  return (
    <h2 className="aww-big-statement aww-scroll-word-statement" aria-label={text}>
      {words.map((word, index) => (
        <ScrollRevealWord key={`${word}-${index}`} word={word} index={index} total={words.length} progress={progress} />
      ))}
    </h2>
  );
}

function ScrollRevealWord({ word, index, total, progress }: { word: string; index: number; total: number; progress: MotionValue<number> }) {
  const start = 0.06 + (index / total) * 0.32;
  const end = start + 0.14;
  const opacity = useTransform(progress, [start, end], [0.42, 1]);
  const y = useTransform(progress, [start, end], [10, 0]);
  const filter = useTransform(progress, [start, end], ["blur(2.5px)", "blur(0px)"]);

  return (
    <motion.span aria-hidden="true" style={{ opacity, y, filter }}>
      {word}
    </motion.span>
  );
}

function ServiceCard({ tile, index }: { tile: (typeof serviceTiles)[number]; index: number }) {
  return (
    <motion.article
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-8%" }}
      transition={{ delay: index * 0.07 }}
      className="aww-service-card"
    >
      <Link href={tile.href} className="block h-full">
        <Image src={tile.image} alt={tile.title} fill sizes="(min-width: 1280px) 25vw, (min-width: 700px) 50vw, 82vw" className="object-cover" />
        <div className="aww-card-shade" />
        <h2>
          {tile.title}
          <small>{tile.count}</small>
        </h2>
        <ul>
          {tile.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <span className="aww-service-more">See More</span>
        <tile.icon className="aww-pixel-icon" size={40} strokeWidth={1.7} />
      </Link>
    </motion.article>
  );
}

function ProjectCard({ project, index }: { project: (typeof projects)[number]; index: number }) {
  const cardRef = useRef<HTMLElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const buttonPositionRef = useRef({ x: 0, y: 0 });
  const targetPositionRef = useRef({ x: 0, y: 0 });

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 92), rect.width - 92);
    const y = Math.min(Math.max(event.clientY - rect.top, 34), rect.height - 34);

    targetPositionRef.current = { x, y };

    if (!animationFrameRef.current) {
      buttonPositionRef.current = buttonPositionRef.current.x || buttonPositionRef.current.y ? buttonPositionRef.current : { x, y };
      animateProjectButton();
    }
  }

  function animateProjectButton() {
    const card = cardRef.current;

    if (!card) {
      animationFrameRef.current = null;
      return;
    }

    const current = buttonPositionRef.current;
    const target = targetPositionRef.current;
    const nextX = current.x + (target.x - current.x) * 0.18;
    const nextY = current.y + (target.y - current.y) * 0.18;

    buttonPositionRef.current = { x: nextX, y: nextY };
    card.style.setProperty("--project-button-x", `${nextX}px`);
    card.style.setProperty("--project-button-y", `${nextY}px`);

    if (Math.abs(target.x - nextX) > 0.35 || Math.abs(target.y - nextY) > 0.35) {
      animationFrameRef.current = window.requestAnimationFrame(animateProjectButton);
      return;
    }

    card.style.setProperty("--project-button-x", `${target.x}px`);
    card.style.setProperty("--project-button-y", `${target.y}px`);
    buttonPositionRef.current = target;
    animationFrameRef.current = null;
  }

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <motion.article
      ref={cardRef}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay: index * 0.08 }}
      className="aww-project-card"
      onPointerMove={handlePointerMove}
    >
      <Link href={project.href} className="aww-project-link">
        <motion.div
          className="aww-project-media"
          initial={false}
          viewport={{ once: true, margin: "-12%" }}
        >
          <Image src={project.image} alt={project.title} fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
        </motion.div>
        <span className="aww-project-button">
          See the product <ArrowRight size={14} />
        </span>
        <div className="aww-project-copy">
          <motion.h2
            className="aww-project-title"
            initial={{ opacity: 0.001, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.7, ease, delay: 0.08 }}
          >
            {project.title}
          </motion.h2>
          <motion.p
            className="aww-project-description"
            initial={{ opacity: 0.001, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.7, ease, delay: 0.14 }}
          >
            {project.description}
          </motion.p>
          <dl>
            {project.details.map(([label, value]) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ duration: 0.72, ease, delay: 0.2 }}
              >
                <dt>{label}</dt>
                <dd>{value}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </Link>
    </motion.article>
  );
}

function ShowcaseGrid({ items }: { items: ShowcaseItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item, index) => (
        <ProductShowcaseCard key={item.name} item={item} index={index} />
      ))}
    </div>
  );
}

function InsightCard({ item, index }: { item: (typeof insights)[number]; index: number }) {
  return (
    <motion.article
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-8%" }}
      transition={{ delay: index * 0.08 }}
      className={index === 0 ? "aww-news-card" : "aww-news-card aww-news-card-secondary"}
    >
      <Link href={item.href} className="grid h-full gap-6 sm:grid-cols-[0.9fr_1fr]">
        <div className="aww-news-copy">
          <h2>{item.title}</h2>
          <time>{item.date}</time>
        </div>
        <motion.div
          className="aww-news-image"
          initial={false}
          viewport={{ once: true, margin: "-12%" }}
        >
          <Image src={item.image} alt={item.title} fill sizes="(min-width: 1024px) 28vw, 100vw" className="object-cover" />
        </motion.div>
        <span className="aww-news-arrow" aria-hidden="true">
          <ArrowRight size={18} />
        </span>
      </Link>
    </motion.article>
  );
}
