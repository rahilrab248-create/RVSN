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
    <section className="product-page-shell min-h-screen border-b border-white/10 px-4 pb-20 pt-28 text-white sm:pt-32">
      <div className="container-shell">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/50">Product system</p>
          <h1 className="mt-4 text-balance text-4xl font-normal leading-[0.96] tracking-[-0.06em] text-white sm:text-6xl">
            Shop the football wall.
          </h1>
          <p className="mt-5 text-pretty text-base leading-8 text-violet-100/65">
            Search, filter, and sort elite football gear made for tunnel walks, training nights, and match-winning moments.
          </p>
        </div>
        <Suspense fallback={<div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-8 text-center text-violet-100/60">Loading products...</div>}>
          <ProductsPageClient products={catalogProducts} categories={catalogCategories} />
        </Suspense>
      </div>
    </section>
  );
}
