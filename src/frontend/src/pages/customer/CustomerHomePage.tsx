import { useState } from 'react';
import { useGetAllRestaurants } from '../../hooks/useQueries';
import { Link, useNavigate } from '@tanstack/react-router';
import { Search, Star, Clock } from 'lucide-react';
import type { RestaurantProfile } from '../../backend';

export default function CustomerHomePage() {
  const { data: restaurants = [], isLoading } = useGetAllRestaurants();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate({ to: '/search', search: { q: searchTerm } });
    }
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Delicious food,
                <br />
                delivered to you
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Order from your favorite restaurants and get it delivered fresh to your doorstep
              </p>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for restaurants or cuisines..."
                    className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
            <div className="hidden md:block">
              <img
                src="/assets/generated/foodstreet-hero.dim_1600x900.png"
                alt="Food delivery"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <h2 className="text-3xl font-bold mb-8">Popular Restaurants</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-40 bg-muted rounded-md mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12">
            <img
              src="/assets/generated/foodstreet-empty-orders.dim_1200x800.png"
              alt="No restaurants"
              className="w-64 h-auto mx-auto mb-4 opacity-50"
            />
            <p className="text-muted-foreground">No restaurants available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id.toString()} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: RestaurantProfile }) {
  return (
    <Link
      to="/restaurant/$restaurantId"
      params={{ restaurantId: restaurant.id.toString() }}
      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-card"
    >
      <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <span className="text-6xl">🍽️</span>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{restaurant.cuisineType}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>30-40 min</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
