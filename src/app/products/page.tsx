import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsPageClient } from "@/components/products/products-page-client";
import { catalogCategories, catalogProducts } from "@/config/products";

export const metadata: Metadata = {
  title: "Products",
  description: "Shop premium football jerseys, boots, and training gear.",
};

export default function ProductsPage() {
  return (
    <section className="pitch-grid min-h-screen border-b border-slate-200 px-4 pb-20 pt-28 sm:pt-32">
      <div className="container-shell">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Product system</p>
          <h1 className="mt-4 text-balance text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
            Shop the football wall.
          </h1>
          <p className="mt-5 text-pretty text-base leading-8 text-slate-600">
            Search, filter, and sort elite football gear made for tunnel walks, training nights, and match-winning moments.
          </p>
        </div>
        <Suspense fallback={<div className="glass-panel rounded-lg p-8 text-center text-slate-500">Loading products...</div>}>
          <ProductsPageClient products={catalogProducts} categories={catalogCategories} />
        </Suspense>
      </div>
    </section>
  );
}
