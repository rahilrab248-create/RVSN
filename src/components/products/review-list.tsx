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
          <article key={review.id} className="glass-panel rounded-lg p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-bold text-slate-950">{review.userName}</h3>
              <RatingStars rating={review.rating} />
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{review.comment}</p>
          </article>
        ))
      ) : (
        <div className="glass-panel rounded-lg p-5 text-sm text-slate-600">No reviews yet. Be first after launch.</div>
      )}
    </div>
  );
}
