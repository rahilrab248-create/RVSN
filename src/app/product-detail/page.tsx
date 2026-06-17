import type { Metadata } from "next";
import { Suspense } from "react";
import { FirestoreProductDetailClient } from "@/components/products/firestore-product-detail-client";

export const metadata: Metadata = {
  title: "Product Detail",
  description: "View football product details, images, sizes, and add to cart.",
};

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center pt-24 text-sm font-black uppercase tracking-[0.18em] text-slate-500">Loading product</div>}>
      <FirestoreProductDetailClient />
    </Suspense>
  );
}
