"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { CatalogCategory, CatalogProduct } from "@/config/products";
import { ProductCard } from "@/components/products/product-card";
import { CustomSelect } from "@/components/ui/custom-select";

type ProductGridProps = {
  products: CatalogProduct[];
  categories: CatalogCategory[];
  initialCategory?: string;
  initialSearch?: string;
  syncMessage?: string;
};

export function ProductGrid({ products, categories, initialCategory = "all", initialSearch = "", syncMessage = "" }: ProductGridProps) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState("all");
  const [sort, setSort] = useState("featured");

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

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products
      .filter((product) => category === "all" || product.category === category)
      .filter((product) => brand === "all" || product.brand === brand)
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
  }, [brand, category, products, search, sort]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <motion.aside
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-panel h-fit rounded-lg p-5"
      >
        <div className="flex items-center gap-2 text-slate-950">
          <SlidersHorizontal size={18} className="text-slate-950" />
          <h2 className="text-lg font-black text-slate-950">Filters</h2>
        </div>

        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500" htmlFor="product-search">
          Search
        </label>
        <div className="mt-2 flex h-11 items-center gap-2 border border-slate-200 bg-white px-3">
          <Search size={16} className="text-slate-500" />
          <input
            id="product-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Jersey, boots..."
            className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-500"
          />
        </div>

        <CustomSelect className="mt-5" label="Category" value={category} onChange={setCategory} options={categoryOptions} />
        <CustomSelect className="mt-5" label="Brand" value={brand} onChange={setBrand} options={brandOptions} />
        <CustomSelect className="mt-5" label="Sort" value={sort} onChange={setSort} options={sortOptions} />
      </motion.aside>

      <div>
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-400">{filteredProducts.length} products</p>
          <p className="hidden text-xs uppercase tracking-[0.22em] text-slate-600 sm:block">Hover for 3D tilt</p>
        </div>
        {syncMessage ? (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            {syncMessage}
          </div>
        ) : null}

        <motion.div layout className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </motion.div>

        {!filteredProducts.length ? (
          <div className="glass-panel rounded-lg p-8 text-center text-slate-300">No products match these filters.</div>
        ) : null}
      </div>
    </div>
  );
}
