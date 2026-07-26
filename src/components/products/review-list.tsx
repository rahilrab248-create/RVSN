import type { CatalogReview } from "@/config/products";
import { RatingStars } from "@/components/products/rating-stars";

type ReviewListProps = {
  reviews: CatalogReview[];
};

export function ReviewList({ reviews }: ReviewListProps) {
  return (
    <div className="grid gap-3">
      {reviews.length ? (
        reviews.map((review) => (
          <article key={review.id} className="rounded-[18px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-semibold text-white">{review.userName}</h3>
              <RatingStars rating={review.rating} />
            </div>
            <p className="mt-4 text-sm leading-7 text-white/62">{review.comment}</p>
          </article>
        ))
      ) : (
        <div className="rounded-[18px] border border-white/10 bg-white/[0.055] p-5 text-sm text-white/62">No reviews yet. Be first after launch.</div>
      )}
    </div>
  );
}
