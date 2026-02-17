import { Star, User } from 'lucide-react';
import type { Review, RestaurantId } from '../../backend';

interface ReviewListProps {
  restaurantId: RestaurantId;
  reviews: Review[];
}

export default function ReviewList({ restaurantId, reviews }: ReviewListProps) {
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>

      {reviews.length > 0 && (
        <div className="mb-6 pb-6 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
          </div>
          <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
        </div>
      )}

      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No reviews yet</p>
        ) : (
          reviews.slice(0, 10).map((review, index) => (
            <div key={index} className="pb-4 border-b last:border-b-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(Number(review.createdAt) / 1000000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
