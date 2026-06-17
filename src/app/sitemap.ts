import type { MetadataRoute } from "next";
import { catalogCategories, catalogProducts } from "@/config/products";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const baseRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/checkout",
    "/login",
    "/signup",
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = catalogCategories.map((category) => ({
    url: `${siteConfig.url}/category/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = catalogProducts.map((product) => ({
    url: `${siteConfig.url}/products/${product.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: product.featured ? 0.9 : 0.75,
  }));

  return [...baseRoutes, ...categoryRoutes, ...productRoutes];
}
