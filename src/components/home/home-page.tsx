"use client";

import { ArrowRight, Footprints, Mail, PackageCheck, Shirt, Trophy } from "lucide-react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

export function HomePage() {
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

      <ApproachPinnedSection />

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

function ApproachPinnedSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(0);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const words = approachStatement.split(" ");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    const ghost = ghostRef.current;

    if (!section || !sticky || !track || !ghost) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      const wordNodes = gsap.utils.toArray<HTMLElement>(".aww-approach-word", sticky);
      const cards = gsap.utils.toArray<HTMLElement>(".aww-approach-card", sticky);
      const imageMasks = gsap.utils.toArray<HTMLElement>(".aww-approach-card-image", sticky);
      const titles = gsap.utils.toArray<HTMLElement>(".aww-approach-card-title", sticky);
      const progressBars = progressRefs.current.filter(Boolean) as HTMLSpanElement[];
      const stage = sticky.querySelector<HTMLElement>(".aww-approach-stage");
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      section.style.setProperty("--approach-scroll-height", isMobile ? "220vh" : "330vh");
      ghost.textContent = "01";

      gsap.set(".aww-approach-eyebrow", { opacity: 0, y: 18 });
      gsap.set(wordNodes, { opacity: 0, y: 30, filter: "blur(10px)" });
      gsap.set(cards, { opacity: 0.35, scale: 0.9, rotateY: -8, transformOrigin: "50% 55%" });
      gsap.set(imageMasks, { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(titles, { opacity: 0, y: 22 });
      gsap.set(progressBars, { scaleX: 0, transformOrigin: "left center" });

      if (reduceMotion) {
        gsap.set(".aww-approach-eyebrow", { opacity: 1, y: 0 });
        gsap.set(wordNodes, { opacity: 1, y: 0, filter: "blur(0px)" });
        gsap.set(cards, { opacity: 1, scale: 1, rotateY: 0 });
        gsap.set(imageMasks, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(titles, { opacity: 1, y: 0 });
        gsap.set(progressBars, { scaleX: 1 });
        return;
      }

      const updateProgress = (progress: number) => {
        const cardProgress = gsap.utils.clamp(0, 1, (progress - 0.28) / 0.68);
        const nextIndex = gsap.utils.clamp(0, approachImages.length - 1, Math.floor(cardProgress * approachImages.length));

        if (nextIndex !== activeIndexRef.current) {
          activeIndexRef.current = nextIndex;
          ghost.textContent = approachImages[nextIndex]?.label ?? "01";
        }

        progressBars.forEach((bar, index) => {
          const fill = gsap.utils.clamp(0, 1, cardProgress * approachImages.length - index);
          gsap.set(bar, { scaleX: fill });
        });
      };

      const getTrackX = () => {
        if (!stage) return 0;
        return -Math.max(0, track.scrollWidth - stage.clientWidth);
      };

      const timeline = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.max(1, section.offsetHeight - window.innerHeight)}`,
          pin: sticky,
          pinSpacing: false,
          anticipatePin: 1,
          scrub: isMobile ? 0.55 : 0.75,
          invalidateOnRefresh: true,
          onUpdate: (self) => updateProgress(self.progress),
        },
      });

      timeline
        .to(".aww-approach-eyebrow", { opacity: 1, y: 0, duration: 0.22 }, 0)
        .to(wordNodes, { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.04, duration: 0.46 }, 0.08)
        .to(track, { x: getTrackX, ease: "none", duration: 2.15 }, 0.62);

      cards.forEach((card, index) => {
        const start = 0.7 + index * 0.44;
        const rotation = index % 2 === 0 ? -7 : 7;

        timeline
          .to(card, { opacity: 1, scale: 1, rotateY: 0, duration: 0.3 }, start)
          .to(imageMasks[index], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.36 }, start + 0.04)
          .to(titles[index], { opacity: 1, y: 0, duration: 0.28 }, start + 0.14);

        if (index < cards.length - 1) {
          timeline
            .to(card, { opacity: 0.35, scale: 0.92, rotateY: rotation, duration: 0.32 }, start + 0.42)
            .to(titles[index], { opacity: 0.45, y: -8, duration: 0.22 }, start + 0.42);
        }
      });

      ScrollTrigger.refresh();
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="aww-approach" aria-label="Our approach and values">
      <div ref={stickyRef} className="aww-approach-sticky">
        <div className="aww-approach-grain" aria-hidden="true" />
        <div ref={ghostRef} className="aww-approach-ghost" aria-hidden="true">
          01
        </div>
        <div className="aww-approach-copy">
          <p className="aww-section-eyebrow aww-approach-eyebrow">Our approach and values</p>
          <h2 className="aww-big-statement aww-scroll-word-statement" aria-label={approachStatement}>
            {words.map((word, index) => (
              <span key={`${word}-${index}`} className="aww-approach-word" aria-hidden="true">
                {word}
              </span>
            ))}
          </h2>
        </div>
        <div className="aww-approach-stage">
          <div ref={trackRef} className="aww-approach-track">
            {approachImages.map((item) => (
              <figure key={item.title} className="aww-approach-card">
                <div className="aww-approach-card-image">
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 767px) 78vw, 42vw" className="object-cover" />
                </div>
                <figcaption>
                  <span>{item.label}</span>
                  <strong className="aww-approach-card-title">{item.title}</strong>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="aww-approach-progress" aria-hidden="true">
          {approachImages.map((item, index) => (
            <span key={item.title}>
              <span ref={(node) => { progressRefs.current[index] = node; }} />
            </span>
          ))}
        </div>
      </div>
    </section>
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
