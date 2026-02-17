import { useState } from 'react';
import { useAddReview, useGetRestaurantReviews } from '../../hooks/useQueries';
import { Star } from 'lucide-react';
import type { RestaurantId, OrderId } from '../../backend';

interface ReviewComposerProps {
  restaurantId: RestaurantId;
  orderId: OrderId;
}

export default function ReviewComposer({ restaurantId, orderId }: ReviewComposerProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const addReview = useAddReview();
  const { data: reviews = [] } = useGetRestaurantReviews(restaurantId);

  const hasReviewed = reviews.some((review) => review.orderId === orderId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addReview.mutateAsync({
        restaurantId,
        orderId,
        rating,
        comment: comment.trim(),
      });
      setComment('');
      setRating(5);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  if (hasReviewed) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Thank you for your review!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Rate Your Experience</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
            placeholder="Share your experience..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={addReview.isPending || !comment.trim()}
          className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {addReview.isPending ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
