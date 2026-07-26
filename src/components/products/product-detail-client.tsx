"use client";

import { Check, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Price } from "@/components/currency/price";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductPurchasePanel } from "@/components/products/product-purchase-panel";
import { RatingStars } from "@/components/products/rating-stars";
import { RelatedProducts } from "@/components/products/related-products";
import { ReviewList } from "@/components/products/review-list";
import type { CatalogProduct, CatalogReview } from "@/config/products";
import { getProduct } from "@/lib/firebase/products";
import type { Product } from "@/types/ecommerce";

type ProductDetailClientProps = {
  initialProduct: CatalogProduct;
  reviews: CatalogReview[];
  relatedProducts: CatalogProduct[];
};

export function ProductDetailClient({ initialProduct, reviews, relatedProducts }: ProductDetailClientProps) {
  const [product, setProduct] = useState(initialProduct);
  const productHighlights = [
    { label: "Matchday ready", description: "Built for fast turns, tunnel walks, and weekly rotation.", icon: ShieldCheck },
    { label: "Fast dispatch", description: "Packed clean with tracked delivery after checkout.", icon: Truck },
    { label: "Easy changes", description: "Need another size? Keep your order flexible before shipment.", icon: RefreshCcw },
  ];

  useEffect(() => {
    let isMounted = true;

    async function loadFirestoreOverride() {
      try {
        const firestoreProduct = await getProduct(initialProduct.id);

        if (firestoreProduct && isMounted) {
          setProduct(mapFirestoreProduct(firestoreProduct, initialProduct));
        }
      } catch {
        // Keep the static product available when Firebase is offline or not configured.
      }
    }

    void loadFirestoreOverride();

    return () => {
      isMounted = false;
    };
  }, [initialProduct]);

  return (
    <>
      <section className="purple-page-shell px-4 pb-16 pt-24 sm:pt-32">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
          <ProductGallery product={product} />

          <div className="self-center">
            <div className="flex flex-wrap items-center gap-3">
              <p className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-violet-100/70">
                {product.brand}
              </p>
              <p className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                {product.category.replaceAll("-", " ")}
              </p>
            </div>
            <h1 className="mt-4 text-balance text-4xl font-normal leading-[0.96] tracking-[-0.06em] text-white sm:text-6xl">
              {product.title}
            </h1>
            <div className="mt-5">
              <RatingStars rating={product.rating} count={reviews.length} />
            </div>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/62">{product.description}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {productHighlights.map((item) => (
                <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
                  <item.icon size={19} className="text-violet-100" />
                  <p className="mt-3 text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-5 border-y border-white/14 py-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/58">Price</p>
                <Price value={product.price} className="mt-1 block text-4xl font-normal tracking-[-0.05em] text-white" />
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/78">
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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/50">Reviews</p>
          <h2 className="mt-3 text-3xl font-normal tracking-[-0.05em] text-white sm:text-4xl">What players are saying.</h2>
        </div>
        <ReviewList reviews={reviews} />
      </section>

      <RelatedProducts products={relatedProducts} />
    </>
  );
}

function mapFirestoreProduct(product: Product, fallback: CatalogProduct): CatalogProduct {
  const imageUrl = product.images[0] ?? fallback.imageUrl;

  return {
    ...fallback,
    id: product.id ?? fallback.id,
    title: product.title,
    description: product.description,
    images: product.images.length ? product.images : fallback.images,
    category: product.category,
    brand: product.brand,
    sizes: product.sizes,
    stock: product.stock,
    price: product.price,
    rating: product.rating,
    featured: product.featured,
    badge: product.featured ? "Featured" : fallback.badge,
    imageUrl,
  };
}
