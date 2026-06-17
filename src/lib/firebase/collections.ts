export const collections = {
  products: "products",
  categories: "categories",
  users: "users",
  orders: "orders",
  payments: "payments",
  checkoutSessions: "checkoutSessions",
  adminNotifications: "adminNotifications",
  paymentFailures: "paymentFailures",
  reviews: "reviews",
  wishlist: "wishlist",
  cart: "cart",
} as const;

export type CollectionName = keyof typeof collections;

export function productPath(productId: string) {
  return `${collections.products}/${productId}`;
}

export function categoryPath(categoryId: string) {
  return `${collections.categories}/${categoryId}`;
}

export function userPath(userId: string) {
  return `${collections.users}/${userId}`;
}

export function orderPath(orderId: string) {
  return `${collections.orders}/${orderId}`;
}

export function reviewPath(reviewId: string) {
  return `${collections.reviews}/${reviewId}`;
}

export function wishlistPath(wishlistItemId: string) {
  return `${collections.wishlist}/${wishlistItemId}`;
}

export function cartPath(cartItemId: string) {
  return `${collections.cart}/${cartItemId}`;
}

export function userProductDocumentId(userId: string, productId: string, variant?: string) {
  return [userId, productId, variant].filter(Boolean).join("_");
}
