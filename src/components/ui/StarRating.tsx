import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
}

export default function StarRating({ rating, maxStars = 5, size = 16 }: StarRatingProps) {
  const starsArray = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-0.5" id="star-rating-container" aria-label={`Reytinq: ${rating} ulduz`}>
      {starsArray.map((starNum) => {
        const isFilled = starNum <= Math.round(rating);
        return (
          <Star
            key={starNum}
            size={size}
            className={`transition-colors ${
              isFilled 
                ? 'fill-gold-primary text-gold-primary' 
                : 'text-slate-200 fill-none'
            }`}
          />
        );
      })}
    </div>
  );
}
