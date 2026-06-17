import type { CatalogProduct } from "@/config/products";
import type { ProductSize } from "@/types/ecommerce";

export type CartLineItem = {
  id: string;
  productId: string;
  title: string;
  image: string;
  brand: string;
  size: ProductSize;
  quantity: number;
  price: number;
};

export type AddCartItemInput = {
  product: CatalogProduct;
  size: ProductSize;
  quantity?: number;
};
