import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetRestaurant, useGetMenuItems, useAddToCart, useGetRestaurantReviews } from '../../hooks/useQueries';
import { Star, Clock, MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import type { MenuItem } from '../../backend';
import ReviewList from '../../components/reviews/ReviewList';

export default function RestaurantDetailPage() {
  const { restaurantId } = useParams({ from: '/restaurant/$restaurantId' });
  const navigate = useNavigate();
  const { data: restaurant, isLoading: restaurantLoading } = useGetRestaurant(BigInt(restaurantId));
  const { data: menuItems = [], isLoading: menuLoading } = useGetMenuItems(BigInt(restaurantId));
  const { data: reviews = [] } = useGetRestaurantReviews(BigInt(restaurantId));
  const addToCart = useAddToCart();

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async (item: MenuItem) => {
    try {
      await addToCart.mutateAsync({
        menuItemId: item.id,
        quantity: BigInt(quantity),
      });
      setSelectedItem(null);
      setQuantity(1);
      navigate({ to: '/cart' });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (restaurantLoading || menuLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Restaurant not found</p>
      </div>
    );
  }

  const vegItems = menuItems.filter((item) => item.isVeg && item.isAvailable);
  const nonVegItems = menuItems.filter((item) => !item.isVeg && item.isAvailable);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-12">
        <div className="container">
          <div className="flex items-start gap-6">
            <div className="h-32 w-32 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-lg flex items-center justify-center text-6xl">
              🍽️
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">{restaurant.cuisineType}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviews.length} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>30-40 min</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{restaurant.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {vegItems.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-green-600">🌱</span> Vegetarian
                </h2>
                <div className="space-y-4">
                  {vegItems.map((item) => (
                    <MenuItemCard
                      key={item.id.toString()}
                      item={item}
                      onAddToCart={() => {
                        setSelectedItem(item);
                        setQuantity(1);
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {nonVegItems.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-red-600">🍖</span> Non-Vegetarian
                </h2>
                <div className="space-y-4">
                  {nonVegItems.map((item) => (
                    <MenuItemCard
                      key={item.id.toString()}
                      item={item}
                      onAddToCart={() => {
                        setSelectedItem(item);
                        setQuantity(1);
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {menuItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No menu items available</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <ReviewList restaurantId={BigInt(restaurantId)} reviews={reviews} />
            </div>
          </div>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6 border">
            <h3 className="text-xl font-bold mb-2">{selectedItem.name}</h3>
            <p className="text-muted-foreground mb-4">{selectedItem.description}</p>
            <p className="text-2xl font-bold mb-4">${selectedItem.price.toFixed(2)}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddToCart(selectedItem)}
                disabled={addToCart.isPending}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItemCard({ item, onAddToCart }: { item: MenuItem; onAddToCart: () => void }) {
  return (
    <div className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={item.isVeg ? 'text-green-600' : 'text-red-600'}>
              {item.isVeg ? '🌱' : '🍖'}
            </span>
            <h3 className="font-semibold">{item.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
          <p className="text-lg font-bold">${item.price.toFixed(2)}</p>
        </div>
        <button
          onClick={onAddToCart}
          className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    </div>
  );
}
