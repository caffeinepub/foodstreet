import { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetRestaurant, useUpdateRestaurant } from '../../hooks/useQueries';
import { Settings } from 'lucide-react';

export default function RestaurantSettingsPage() {
  const { restaurantId } = useParams({ from: '/owner/restaurant/$restaurantId/settings' });
  const { data: restaurant, isLoading } = useGetRestaurant(BigInt(restaurantId));
  const updateRestaurant = useUpdateRestaurant();

  const [name, setName] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setCuisineType(restaurant.cuisineType);
      setAddress(restaurant.address);
      setPhone(restaurant.phone);
    }
  }, [restaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cuisineType.trim() || !address.trim() || !phone.trim()) return;

    try {
      await updateRestaurant.mutateAsync({
        restaurantId: BigInt(restaurantId),
        name: name.trim(),
        cuisineType: cuisineType.trim(),
        address: address.trim(),
        phone: phone.trim(),
      });
    } catch (error) {
      console.error('Failed to update restaurant:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
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

  const isReadOnly = restaurant.status === 'pending' || restaurant.status === 'suspended';

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Settings className="h-8 w-8" />
        Restaurant Settings
      </h1>

      {isReadOnly && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Your restaurant is currently {restaurant.status}. Settings cannot be modified.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Restaurant Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
            disabled={isReadOnly}
            required
          />
        </div>

        <div>
          <label htmlFor="cuisine" className="block text-sm font-medium mb-2">
            Cuisine Type
          </label>
          <input
            id="cuisine"
            type="text"
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
            disabled={isReadOnly}
            required
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-2">
            Address
          </label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
            disabled={isReadOnly}
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
            disabled={isReadOnly}
            required
          />
        </div>

        {!isReadOnly && (
          <button
            type="submit"
            disabled={updateRestaurant.isPending}
            className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {updateRestaurant.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </form>
    </div>
  );
}
