import type { Timestamp } from "firebase/firestore";
import type { UserProfile } from "@/types/user";

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "US 6" | "US 7" | "US 8" | "US 9" | "US 10" | "US 11" | "US 12";

export type OrderStatus = "pending" | "approved" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

export type Product = {
  id?: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  brand: string;
  sizes: ProductSize[];
  stock: number;
  price: number;
  rating: number;
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export type Category = {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  featured: boolean;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CategoryInput = Omit<Category, "id" | "createdAt" | "updatedAt">;

export type OrderItem = {
  productId: string;
  title: string;
  image: string;
  brand: string;
  size: ProductSize;
  quantity: number;
  price: number;
};

export type ShippingAddress = {
  name: string;
  email: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
};

export type Order = {
  id?: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  currency?: string;
  shippingAddress: ShippingAddress;
  payment?: PaymentRecord;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type OrderInput = Omit<Order, "id" | "createdAt" | "updatedAt" | "status"> & {
  status?: OrderStatus;
};

export type Review = {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ReviewInput = Omit<Review, "id" | "createdAt" | "updatedAt">;

export type WishlistItem = {
  id?: string;
  userId: string;
  productId: string;
  createdAt: Timestamp;
};

export type WishlistInput = Omit<WishlistItem, "id" | "createdAt">;

export type CartItem = {
  id?: string;
  userId: string;
  productId: string;
  title: string;
  image: string;
  brand: string;
  size: ProductSize;
  quantity: number;
  price: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CartInput = Omit<CartItem, "id" | "createdAt" | "updatedAt">;

export type EcommerceUser = UserProfile;

export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export type PaymentRecord = {
  provider: "stripe" | "cash_on_delivery";
  status: PaymentStatus | string;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  amountTotal: number;
  currency?: string | null;
  paidAt?: Timestamp;
};
