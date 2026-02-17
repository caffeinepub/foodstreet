import { useGetMyRestaurants } from '../../hooks/useQueries';
import { Link } from '@tanstack/react-router';
import { Store, Plus, Settings, Menu, Package } from 'lucide-react';
import type { RestaurantProfile } from '../../backend';

export default function OwnerDashboardPage() {
  const { data: restaurants = [], isLoading } = useGetMyRestaurants();

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

  if (restaurants.length === 0) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No restaurants yet</h2>
          <p className="text-muted-foreground mb-6">
            Start by creating your restaurant profile
          </p>
          <Link
            to="/owner/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Restaurant
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Store className="h-8 w-8" />
          My Restaurants
        </h1>
        <Link
          to="/owner/onboarding"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Restaurant
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id.toString()} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: RestaurantProfile }) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
  };

  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{restaurant.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[restaurant.status]}`}>
          {restaurant.status}
        </span>
      </div>
      <p className="text-muted-foreground mb-4">{restaurant.cuisineType}</p>
      <div className="flex flex-col gap-2">
        <Link
          to="/owner/restaurant/$restaurantId/settings"
          params={{ restaurantId: restaurant.id.toString() }}
          className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-secondary transition-colors text-sm"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Link
          to="/owner/restaurant/$restaurantId/menu"
          params={{ restaurantId: restaurant.id.toString() }}
          className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-secondary transition-colors text-sm"
        >
          <Menu className="h-4 w-4" />
          Manage Menu
        </Link>
        <Link
          to="/owner/restaurant/$restaurantId/orders"
          params={{ restaurantId: restaurant.id.toString() }}
          className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-secondary transition-colors text-sm"
        >
          <Package className="h-4 w-4" />
          Orders
        </Link>
      </div>
    </div>
  );
}
