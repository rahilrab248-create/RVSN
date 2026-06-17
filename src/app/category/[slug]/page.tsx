import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
import {
  catalogCategories,
  getCatalogCategory,
  getProductsByCatalogCategory,
} from "@/config/products";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return catalogCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCatalogCategory(slug);

  if (!category) {
    return { title: "Category not found" };
  }

  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCatalogCategory(slug);

  if (!category) {
    notFound();
  }

  const products = getProductsByCatalogCategory(slug);

  return (
    <section className="pitch-grid min-h-screen border-b border-slate-200 px-4 pb-20 pt-28 sm:pt-32">
      <div className="container-shell">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Category</p>
          <h1 className="mt-4 text-balance text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
            {category.name}
          </h1>
          <p className="mt-5 text-pretty text-base leading-8 text-slate-600">{category.description}</p>
        </div>
        <ProductGrid products={products} categories={catalogCategories} initialCategory={slug} />
      </div>
    </section>
  );
}
