export type CouponType = "percent" | "fixed" | "shipping";

export type CheckoutCoupon = {
  code: string;
  label: string;
  type: CouponType;
  value: number;
};

export const CHECKOUT_SHIPPING_FEE = 15;

export const CHECKOUT_COUPONS: CheckoutCoupon[] = [
  {
    code: "KICKOFF10",
    label: "10% off match day essentials",
    type: "percent",
    value: 10,
  },
  {
    code: "FREESHIP",
    label: "Free express shipping",
    type: "shipping",
    value: CHECKOUT_SHIPPING_FEE,
  },
  {
    code: "FINAL25",
    label: "$25 off premium orders",
    type: "fixed",
    value: 25,
  },
];

export function findCheckoutCoupon(code: string) {
  return CHECKOUT_COUPONS.find((coupon) => coupon.code === code.trim().toUpperCase()) ?? null;
}

export function calculateCouponDiscount(params: {
  coupon: CheckoutCoupon | null;
  subtotal: number;
  shipping: number;
}) {
  const { coupon, subtotal, shipping } = params;

  if (!coupon) {
    return 0;
  }

  if (coupon.type === "percent") {
    return Math.round(subtotal * (coupon.value / 100));
  }

  if (coupon.type === "shipping") {
    return Math.min(shipping, coupon.value);
  }

  return Math.min(subtotal, coupon.value);
}
