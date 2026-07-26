"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { CatalogCategory, CatalogProduct } from "@/config/products";
import { ProductCard } from "@/components/products/product-card";
import { CustomSelect } from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";

type ProductGridProps = {
  products: CatalogProduct[];
  categories: CatalogCategory[];
  initialCategory?: string;
  initialSearch?: string;
  syncMessage?: string;
};

const preloadedProductImageUrls = new Set<string>();

export function ProductGrid({ products, categories, initialCategory = "all", initialSearch = "", syncMessage = "" }: ProductGridProps) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState("all");
  const [bootLine, setBootLine] = useState("all");
  const [bootTier, setBootTier] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sort, setSort] = useState("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [visibleCount, setVisibleCount] = useState(12);
  const [revealStartIndex, setRevealStartIndex] = useState(0);

  const brands = useMemo(() => Array.from(new Set(products.map((product) => product.brand))).sort(), [products]);
  const categoryOptions = useMemo(
    () => [
      { label: "All categories", value: "all" },
      ...categories.map((item) => ({ label: item.name, value: item.slug })),
    ],
    [categories],
  );
  const brandOptions = useMemo(
    () => [
      { label: "All brands", value: "all" },
      ...brands.map((item) => ({ label: item, value: item })),
    ],
    [brands],
  );
  const sortOptions = [
    { label: "Featured", value: "featured" },
    { label: "Top rated", value: "rating" },
    { label: "Price low", value: "price-low" },
    { label: "Price high", value: "price-high" },
  ];
  const bootLineOptions = [
    { label: "All boot lines", value: "all" },
    { label: "Mercurial", value: "Mercurial" },
    { label: "Phantom", value: "Phantom" },
    { label: "Tiempo", value: "Tiempo" },
    { label: "Total90", value: "Total90" },
    { label: "Mind", value: "Mind" },
  ];
  const bootTierOptions = [
    { label: "All boot tiers", value: "all" },
    { label: "Elite", value: "Elite" },
    { label: "Pro", value: "Pro" },
    { label: "Academy", value: "Academy" },
    { label: "Club", value: "Club" },
    { label: "Street", value: "Street" },
  ];
  const priceRangeOptions = [
    { label: "All prices", value: "all" },
    { label: "Under $100", value: "under-100" },
    { label: "$100 - $199", value: "100-199" },
    { label: "$200+", value: "200-plus" },
  ];
  const isBootCategory = category === "all" || category === "astro-turf-football-boots" || category === "mens-football-boots";
  const activeCategoryLabel = categoryOptions.find((option) => option.value === category)?.label ?? "All categories";
  const activeBrandLabel = brandOptions.find((option) => option.value === brand)?.label ?? "All brands";
  const activeSortLabel = sortOptions.find((option) => option.value === sort)?.label ?? "Featured";
  const activeBootLineLabel = bootLineOptions.find((option) => option.value === bootLine)?.label ?? "All boot lines";
  const activeBootTierLabel = bootTierOptions.find((option) => option.value === bootTier)?.label ?? "All boot tiers";
  const activePriceRangeLabel = priceRangeOptions.find((option) => option.value === priceRange)?.label ?? "All prices";
  const categoryCards = useMemo(
    () => {
      const allProductsCard = {
        id: "all",
        name: "All Products",
        slug: "all",
        description: "Browse every kit, boot, and training piece in the RVSN wall.",
        count: products.length,
        imageUrl: products[0]?.imageUrl ?? "/images/hero/hero-football-store.png",
      };

      return [
        allProductsCard,
        ...categories.map((item) => {
        const categoryProducts = products.filter((product) => product.category === item.slug);
        return {
          ...item,
          count: categoryProducts.length,
          imageUrl: categoryProducts[0]?.imageUrl ?? "/images/hero/hero-football-store.png",
        };
        }),
      ];
    },
    [categories, products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products
      .filter((product) => category === "all" || product.category === category)
      .filter((product) => brand === "all" || product.brand === brand)
      .filter((product) => !isBootProduct(product) || bootLine === "all" || getBootLine(product.title) === bootLine)
      .filter((product) => !isBootProduct(product) || bootTier === "all" || getBootTier(product.title) === bootTier)
      .filter((product) => priceRange === "all" || isProductInPriceRange(product.price, priceRange))
      .filter((product) => {
        if (!normalizedSearch) {
          return true;
        }

        return [product.title, product.description, product.brand, product.category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((a, b) => {
        if (sort === "price-low") return a.price - b.price;
        if (sort === "price-high") return b.price - a.price;
        if (sort === "rating") return b.rating - a.rating;
        return Number(b.featured) - Number(a.featured);
      });
  }, [bootLine, bootTier, brand, category, priceRange, products, search, sort]);

  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);
  const nextProducts = useMemo(() => filteredProducts.slice(visibleCount, visibleCount + productsPerPage), [filteredProducts, productsPerPage, visibleCount]);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");

    function updateProductsPerPage() {
      const nextCount = mediaQuery.matches ? 8 : 12;
      setProductsPerPage(nextCount);
      setVisibleCount(nextCount);
    }

    updateProductsPerPage();
    mediaQuery.addEventListener("change", updateProductsPerPage);

    return () => mediaQuery.removeEventListener("change", updateProductsPerPage);
  }, []);

  useEffect(() => {
    setVisibleCount(productsPerPage);
    setRevealStartIndex(0);
  }, [bootLine, bootTier, brand, category, priceRange, productsPerPage, search, sort]);

  useEffect(() => {
    if (isBootCategory) {
      return;
    }

    setBootLine("all");
    setBootTier("all");
  }, [isBootCategory]);

  useEffect(() => {
    nextProducts.forEach((product) => {
      const imageUrl = product.imageUrl || product.images[0];

      if (!imageUrl || preloadedProductImageUrls.has(imageUrl)) {
        return;
      }

      preloadedProductImageUrls.add(imageUrl);
      const image = new window.Image();
      image.decoding = "async";
      image.src = imageUrl;
    });
  }, [nextProducts]);

  useEffect(() => {
    if (!isMobileFiltersOpen) {
      return undefined;
    }

    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [isMobileFiltersOpen]);

  function showMoreProducts() {
    setVisibleCount((current) => {
      setRevealStartIndex(current);
      return Math.min(current + productsPerPage, filteredProducts.length);
    });
  }

  function selectCategory(nextCategory: string) {
    setCategory(nextCategory);
  }

  return (
    <div className="grid min-w-0 gap-8">
      <motion.div layout className="category-card-rail grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {categoryCards.map((item) => {
          const isActive = category === item.slug;

          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => selectCategory(item.slug)}
              className="category-card group relative min-h-[154px] overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.055] p-4 text-left shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:border-violet-200/36 hover:bg-white/[0.085]"
            >
              <span className={cn("absolute inset-0 opacity-35 transition duration-500 group-hover:scale-105 group-hover:opacity-50", isActive && "opacity-55")}>
                <Image src={item.imageUrl} alt="" fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              </span>
              <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(3,2,8,0.94),rgba(20,10,38,0.72)_48%,rgba(3,2,8,0.92))]" />
              <span className="relative z-10 flex h-full flex-col justify-between">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-violet-100/48">Category</span>
                  <span className={cn("rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-bold text-white/72", isActive && "border-violet-100/30 bg-violet-200 text-black")}>
                    {isActive ? "Selected" : item.count}
                  </span>
                </span>
                <span>
                  <span className="block text-2xl font-normal leading-[0.98] tracking-[-0.06em] text-white">{item.name}</span>
                  <span className="category-card-description mt-3 block text-sm font-semibold leading-5 text-violet-100/56">{item.description}</span>
                </span>
              </span>
              {isActive ? <span className="absolute inset-x-4 bottom-3 h-0.5 rounded-full bg-violet-200 shadow-[0_0_22px_rgba(196,181,253,0.5)]" /> : null}
            </button>
          );
        })}
      </motion.div>

      <div className="grid min-w-0 gap-8 lg:grid-cols-[280px_1fr]">
      <div className="sticky top-[72px] z-20 w-full rounded-[22px] border border-white/10 bg-[#090411]/82 p-2 shadow-[0_22px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-2.5 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-[18px] border border-white/12 bg-white/8 px-3 shadow-[inset_0_1px_rgba(255,255,255,0.1)] transition focus-within:border-violet-200/70 focus-within:ring-4 focus-within:ring-violet-300/10">
            <Search size={16} className="shrink-0 text-violet-100/70" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search gear..."
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-violet-100/42"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[18px] bg-white px-3 text-sm font-extrabold text-black shadow-[0_14px_38px_rgba(124,58,237,0.24)] sm:px-4"
            aria-label="Open product filters"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[activeCategoryLabel, activeBrandLabel, isBootCategory ? activeBootLineLabel : "", isBootCategory ? activeBootTierLabel : "", activePriceRangeLabel, activeSortLabel].filter(Boolean).map((label) => (
            <span key={label} className="shrink-0 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-bold text-violet-100/70">
              {label}
            </span>
          ))}
        </div>
      </div>

      <motion.aside
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hidden h-fit rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl lg:block"
      >
        <div className="flex items-center gap-2 text-white">
          <SlidersHorizontal size={18} className="text-violet-200" />
          <h2 className="text-lg font-normal tracking-[-0.03em] text-white">Filters</h2>
        </div>

        <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.2em] text-violet-100/45" htmlFor="product-search">
          Search
        </label>
        <div className="mt-2 flex h-12 items-center gap-3 rounded-[18px] border border-white/12 bg-white/8 px-3 shadow-[inset_0_1px_rgba(255,255,255,0.1)] transition focus-within:border-violet-200/70 focus-within:bg-black/24 focus-within:ring-4 focus-within:ring-violet-300/10">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/8 text-violet-100/70">
            <Search size={15} />
          </span>
          <input
            id="product-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Jersey, boots..."
            className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-violet-100/40"
          />
        </div>

        <CustomSelect className="mt-5" label="Category" value={category} onChange={setCategory} options={categoryOptions} />
        <CustomSelect className="mt-5" label="Brand" value={brand} onChange={setBrand} options={brandOptions} />
        {isBootCategory ? (
          <>
            <CustomSelect className="mt-5" label="Boot line" value={bootLine} onChange={setBootLine} options={bootLineOptions} />
            <CustomSelect className="mt-5" label="Boot tier" value={bootTier} onChange={setBootTier} options={bootTierOptions} />
          </>
        ) : null}
        <CustomSelect className="mt-5" label="Price" value={priceRange} onChange={setPriceRange} options={priceRangeOptions} />
        <CustomSelect className="mt-5" label="Sort" value={sort} onChange={setSort} options={sortOptions} />
      </motion.aside>

      <AnimatePresence>
        {isMobileFiltersOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close product filters"
              className="fixed inset-0 z-50 bg-black/62 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Product filters"
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[34px] border border-white/14 bg-[#08040f]/94 p-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[0_-28px_90px_rgba(0,0,0,0.58),0_0_80px_rgba(124,58,237,0.16)] backdrop-blur-2xl lg:hidden"
              initial={{ y: "42%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "36%", opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/18" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-100/45">Shop controls</p>
                  <h2 className="mt-1 text-2xl font-normal tracking-[-0.05em] text-white">Filter the drop</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="grid size-11 place-items-center rounded-[16px] border border-white/12 bg-white/8 text-white"
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 grid gap-4">
                <CustomSelect label="Category" value={category} onChange={setCategory} options={categoryOptions} />
                <CustomSelect label="Brand" value={brand} onChange={setBrand} options={brandOptions} />
                {isBootCategory ? (
                  <>
                    <CustomSelect label="Boot line" value={bootLine} onChange={setBootLine} options={bootLineOptions} />
                    <CustomSelect label="Boot tier" value={bootTier} onChange={setBootTier} options={bootTierOptions} />
                  </>
                ) : null}
                <CustomSelect label="Price" value={priceRange} onChange={setPriceRange} options={priceRangeOptions} />
                <CustomSelect label="Sort" value={sort} onChange={setSort} options={sortOptions} />
              </div>

              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="mt-6 h-12 w-full rounded-full bg-white text-sm font-extrabold text-black shadow-[0_18px_45px_rgba(124,58,237,0.24)]"
              >
                Show {filteredProducts.length} products
              </button>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <div className="min-w-0">
        <div className="mb-5 flex items-center justify-between gap-4 pt-1 lg:pt-0">
          <p className="text-sm font-semibold text-violet-100/55">{filteredProducts.length} products</p>
          <p className="hidden text-xs uppercase tracking-[0.22em] text-violet-100/38 sm:block">Hover for 3D tilt</p>
        </div>
        {syncMessage ? (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            {syncMessage}
          </div>
        ) : null}

        <motion.div layout className="product-grid-list grid grid-cols-2 items-stretch gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index >= revealStartIndex ? index - revealStartIndex : index} />
          ))}
        </motion.div>

        {hasMoreProducts ? (
          <div className="mt-9 flex flex-col items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-100/42">
              Showing {visibleProducts.length} of {filteredProducts.length}
            </p>
            <button
              type="button"
              onClick={showMoreProducts}
              className="group relative h-13 min-w-[220px] overflow-hidden rounded-full border border-white/14 bg-white/[0.075] px-7 text-sm font-extrabold text-white shadow-[inset_0_1px_rgba(255,255,255,0.14),0_18px_48px_rgba(0,0,0,0.28),0_0_52px_rgba(124,58,237,0.12)] backdrop-blur-xl transition hover:border-violet-200/40 hover:bg-white/12"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/14 to-transparent transition duration-700 group-hover:translate-x-full" />
              <span className="relative">See more products</span>
            </button>
          </div>
        ) : null}

        {!filteredProducts.length ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-8 text-center text-violet-100/60">No products match these filters.</div>
        ) : null}
      </div>
      </div>
    </div>
  );
}

function isBootProduct(product: CatalogProduct) {
  return product.category === "astro-turf-football-boots" || product.category === "mens-football-boots";
}

function getBootLine(title: string) {
  if (title.includes("Mercurial")) return "Mercurial";
  if (title.includes("Phantom")) return "Phantom";
  if (title.includes("Tiempo")) return "Tiempo";
  if (title.includes("Total90")) return "Total90";
  if (title.includes("Mind")) return "Mind";
  return "Other";
}

function getBootTier(title: string) {
  if (title.includes("Elite")) return "Elite";
  if (title.includes("Pro")) return "Pro";
  if (title.includes("Academy")) return "Academy";
  if (title.includes("Club")) return "Club";
  if (title.includes("Streetgato") || title.includes("Reactgato")) return "Street";
  return "Other";
}

function isProductInPriceRange(price: number, range: string) {
  if (range === "under-100") return price < 100;
  if (range === "100-199") return price >= 100 && price <= 199;
  if (range === "200-plus") return price >= 200;
  return true;
}
