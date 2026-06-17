"use client";

import { Check, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Price } from "@/components/currency/price";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductPurchasePanel } from "@/components/products/product-purchase-panel";
import { RatingStars } from "@/components/products/rating-stars";
import { getCatalogProduct, type CatalogProduct } from "@/config/products";
import { getProduct } from "@/lib/firebase/products";
import type { Product } from "@/types/ecommerce";

export function FirestoreProductDetailClient() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id") ?? "";
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setIsLoading(true);
      setError("");

      try {
        const localProduct = getCatalogProduct(productId);

        if (localProduct) {
          setProduct(localProduct);
          return;
        }

        const firestoreProduct = await getProduct(productId);

        if (!firestoreProduct) {
          setError("Product not found.");
          setProduct(null);
          return;
        }

        if (isMounted) {
          setProduct(mapFirestoreProduct(firestoreProduct));
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load this product.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (isLoading) {
    return (
      <section className="grid min-h-screen place-items-center px-4 pt-24">
        <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-slate-600">
          <Loader2 className="animate-spin text-lime-600" size={20} />
          Loading product
        </div>
      </section>
    );
  }

  if (!product || error) {
    return (
      <section className="grid min-h-screen place-items-center px-4 pt-24">
        <div className="glass-panel max-w-md rounded-lg p-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Product detail</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">{error || "Product not found."}</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="pitch-grid border-b border-slate-200 px-4 pb-16 pt-28 sm:pt-32">
      <div className="container-shell grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <ProductGallery product={product} />

        <div className="self-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{product.brand}</p>
          <h1 className="mt-4 text-balance text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
            {product.title}
          </h1>
          <div className="mt-5">
            <RatingStars rating={product.rating} />
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
  );
}

function mapFirestoreProduct(product: Product): CatalogProduct {
  const imageUrl = product.images[0] ?? "/images/products/volt-strike-jersey.webp";

  return {
    id: product.id ?? "",
    title: product.title,
    description: product.description,
    images: product.images.length ? product.images : [imageUrl],
    category: product.category,
    brand: product.brand,
    sizes: product.sizes,
    stock: product.stock,
    price: product.price,
    rating: product.rating,
    featured: product.featured,
    colorway: "from-lime-300 via-white to-slate-950",
    badge: product.featured ? "Featured" : "New drop",
    imageUrl,
  };
}
