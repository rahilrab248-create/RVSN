import type { ShippingAddress } from "@/types/ecommerce";

export type PayHereCheckoutInput = {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  itemsLabel: string;
  customer: ShippingAddress;
};

export type PayHereCheckoutSession = {
  actionUrl: string;
  fields: Record<string, string>;
};
