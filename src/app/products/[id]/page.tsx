import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Price } from "@/components/currency/price";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductPurchasePanel } from "@/components/products/product-purchase-panel";
import { RatingStars } from "@/components/products/rating-stars";
import { RelatedProducts } from "@/components/products/related-products";
import { ReviewList } from "@/components/products/review-list";
import {
  catalogProducts,
  getCatalogProduct,
  getCatalogReviews,
  getRelatedCatalogProducts,
} from "@/config/products";

type ProductDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return catalogProducts.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getCatalogProduct(id);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params;
  const product = getCatalogProduct(id);

  if (!product) {
    notFound();
  }

  const reviews = getCatalogReviews(product.id);
  const relatedProducts = getRelatedCatalogProducts(product);

  return (
    <>
      <section className="pitch-grid border-b border-slate-200 px-4 pb-16 pt-28 sm:pt-32">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <ProductGallery product={product} />

          <div className="self-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{product.brand}</p>
            <h1 className="mt-4 text-balance text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
              {product.title}
            </h1>
            <div className="mt-5">
              <RatingStars rating={product.rating} count={reviews.length} />
            </div>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">{product.description}</p>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-5 border-y border-slate-200 py-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Price</p>
                <Price value={product.price} className="mt-1 block text-4xl font-black text-slate-950" />
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Check size={18} />
                {product.stock} in stock
              </div>
            </div>

            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Reviews</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">What players are saying.</h2>
        </div>
        <ReviewList reviews={reviews} />
      </section>

      <RelatedProducts products={relatedProducts} />
    </>
  );
}
