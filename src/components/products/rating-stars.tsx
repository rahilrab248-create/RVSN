import { Star } from "lucide-react";

type RatingStarsProps = {
  rating: number;
  count?: number;
};

export function RatingStars({ rating, count }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 text-lime-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={15}
            className={index + 1 <= Math.round(rating) ? "fill-current" : "opacity-35"}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-400">
        {rating.toFixed(1)}
        {typeof count === "number" ? ` (${count})` : null}
      </span>
    </div>
  );
}
