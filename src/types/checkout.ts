import type { ShippingAddress } from "@/types/ecommerce";

export type PaymentMethod = "stripe" | "cash_on_delivery";

export type CheckoutForm = ShippingAddress & {
  saveAddress: boolean;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutForm | "payment" | "cart", string>>;

export type SavedAddress = ShippingAddress & {
  id: string;
};
