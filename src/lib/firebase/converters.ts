import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import type {
  CartItem,
  Category,
  Order,
  Product,
  Review,
  WishlistItem,
} from "@/types/ecommerce";
import type { UserProfile } from "@/types/user";

function createConverter<T extends object>(): FirestoreDataConverter<T> {
  return {
    toFirestore(data) {
      const { id: _id, ...rest } = data as T & { id?: string };
      void _id;
      return rest as DocumentData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions) {
      return {
        id: snapshot.id,
        ...snapshot.data(options),
      } as T;
    },
  };
}

export const productConverter = createConverter<Product>();
export const categoryConverter = createConverter<Category>();
export const userConverter = createConverter<UserProfile>();
export const orderConverter = createConverter<Order>();
export const reviewConverter = createConverter<Review>();
export const wishlistConverter = createConverter<WishlistItem>();
export const cartConverter = createConverter<CartItem>();
