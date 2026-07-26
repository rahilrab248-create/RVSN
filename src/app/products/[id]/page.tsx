import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/products/product-detail-client";
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

  return <ProductDetailClient initialProduct={product} reviews={reviews} relatedProducts={relatedProducts} />;
}
