import type { ProductInput, ProductSize } from "@/types/ecommerce";

export type AdminTab = "overview" | "products" | "orders" | "users" | "inventory";

export type ProductFormState = {
  id?: string;
  title: string;
  description: string;
  imageUrls: string;
  category: string;
  brand: string;
  sizes: string;
  stock: string;
  price: string;
  rating: string;
  featured: boolean;
};

export function createEmptyProductForm(): ProductFormState {
  return {
    title: "",
    description: "",
    imageUrls: "",
    category: "jerseys",
    brand: "",
    sizes: "S, M, L, XL",
    stock: "20",
    price: "99",
    rating: "0",
    featured: false,
  };
}

export function productFormToInput(form: ProductFormState): ProductInput {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    images: form.imageUrls
      .split(/\r?\n|,/)
      .map((image) => image.trim())
      .filter(Boolean),
    category: form.category.trim(),
    brand: form.brand.trim(),
    sizes: form.sizes
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean) as ProductSize[],
    stock: Number(form.stock),
    price: Number(form.price),
    rating: Number(form.rating),
    featured: form.featured,
  };
}
