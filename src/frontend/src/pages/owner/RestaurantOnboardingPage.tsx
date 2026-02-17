import { useState } from 'react';
import { useCreateRestaurant } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Store } from 'lucide-react';
import type { RestaurantProfile, RestaurantStatus } from '../../backend';

export default function RestaurantOnboardingPage() {
  const [name, setName] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const createRestaurant = useCreateRestaurant();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cuisineType.trim() || !address.trim() || !phone.trim()) return;

    try {
      const profile: RestaurantProfile = {
        id: BigInt(0),
        owner: '' as any,
        name: name.trim(),
        cuisineType: cuisineType.trim(),
        address: address.trim(),
        phone: phone.trim(),
        rating: 0,
        status: 'pending' as RestaurantStatus,
      };

      await createRestaurant.mutateAsync(profile);
      navigate({ to: '/owner' });
    } catch (error) {
      console.error('Failed to create restaurant:', error);
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Store className="h-8 w-8" />
          Create Your Restaurant
        </h1>
        <p className="text-muted-foreground">
          Fill in the details below. Your restaurant will be reviewed by our team before going live.
        </p>
      </div>

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
            placeholder="Enter restaurant name"
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
            placeholder="e.g., Italian, Chinese, Indian"
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
            placeholder="Enter full address"
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
            placeholder="Enter phone number"
            required
          />
        </div>

        <button
          type="submit"
          disabled={createRestaurant.isPending}
          className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {createRestaurant.isPending ? 'Creating...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
}
