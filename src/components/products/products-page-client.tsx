"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductGrid } from "@/components/products/product-grid";
import type { CatalogCategory, CatalogProduct } from "@/config/products";
import { getProducts } from "@/lib/firebase/products";
import type { Product } from "@/types/ecommerce";

type ProductsPageClientProps = {
  products: CatalogProduct[];
  categories: CatalogCategory[];
  initialCategory?: string;
};

const productCacheKey = "rvsn-firestore-products-v1";
const productCacheTtlMs = 5 * 60 * 1000;

export function ProductsPageClient({ products, categories, initialCategory }: ProductsPageClientProps) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const [liveProducts, setLiveProducts] = useState<CatalogProduct[]>(products);
  const [syncMessage, setSyncMessage] = useState("");
  const staticProductIds = useMemo(() => new Set(products.map((product) => product.id)), [products]);

  useEffect(() => {
    let isMounted = true;
    const cachedProducts = readProductCache();

    setLiveProducts(products);

    if (cachedProducts?.length) {
      setLiveProducts(mergeProducts(products, cachedProducts));
    }

    getProducts()
      .then((firestoreProducts) => {
        if (!isMounted || !firestoreProducts.length) {
          return;
        }

        const mappedProducts = firestoreProducts.map((product) => mapFirestoreProduct(product, staticProductIds));
        writeProductCache(mappedProducts);
        setLiveProducts(mergeProducts(products, mappedProducts));
      })
      .catch(() => {
        if (isMounted) {
          setSyncMessage("Showing starter catalog. Firestore products could not load yet.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [products, staticProductIds]);

  return <ProductGrid products={liveProducts} categories={categories} initialCategory={initialCategory} initialSearch={search} syncMessage={syncMessage} />;
}

function mergeProducts(localProducts: CatalogProduct[], firestoreProducts: CatalogProduct[]) {
  const productMap = new Map(localProducts.map((product) => [product.id, product]));

  firestoreProducts.forEach((product) => {
    productMap.set(product.id, product);
  });

  return Array.from(productMap.values());
}

function mapFirestoreProduct(product: Product, staticProductIds: Set<string>): CatalogProduct {
  const id = product.id ?? slugify(product.title);
  const imageUrl = product.images[0] ?? "/images/products/volt-strike-jersey.webp";

  return {
    id,
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
    detailHref: staticProductIds.has(id) ? undefined : `/product-detail?id=${encodeURIComponent(id)}`,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readProductCache() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const cached = JSON.parse(window.sessionStorage.getItem(productCacheKey) ?? "null") as
      | { createdAt: number; products: CatalogProduct[] }
      | null;

    if (!cached || Date.now() - cached.createdAt > productCacheTtlMs) {
      return null;
    }

    return cached.products;
  } catch {
    return null;
  }
}

function writeProductCache(cachedProducts: CatalogProduct[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(productCacheKey, JSON.stringify({ createdAt: Date.now(), products: cachedProducts }));
  } catch {
    // Browsers can reject storage in private mode. The page still works without cache.
  }
}
