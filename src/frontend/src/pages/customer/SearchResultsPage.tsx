import { useSearch } from '@tanstack/react-router';
import { useSearchRestaurants, useGetAllRestaurants } from '../../hooks/useQueries';
import { Link } from '@tanstack/react-router';
import { Star, Clock, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { RestaurantProfile } from '../../backend';

export default function SearchResultsPage() {
  const searchParams = useSearch({ from: '/search' });
  const searchTerm = (searchParams as any).q || '';
  const { data: searchResults = [] } = useSearchRestaurants(searchTerm);
  const { data: allRestaurants = [] } = useGetAllRestaurants();

  const [cuisineFilter, setCuisineFilter] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating');

  const restaurants = searchTerm ? searchResults : allRestaurants;

  const cuisines = useMemo(() => {
    const uniqueCuisines = new Set(restaurants.map((r) => r.cuisineType));
    return Array.from(uniqueCuisines).sort();
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants];

    if (cuisineFilter) {
      filtered = filtered.filter((r) => r.cuisineType === cuisineFilter);
    }

    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [restaurants, cuisineFilter, sortBy]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Search className="h-8 w-8" />
          {searchTerm ? `Search results for "${searchTerm}"` : 'All Restaurants'}
        </h1>
        <p className="text-muted-foreground">{filteredRestaurants.length} restaurants found</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={cuisineFilter}
          onChange={(e) => setCuisineFilter(e.target.value)}
          className="px-4 py-2 border rounded-md bg-background"
        >
          <option value="">All Cuisines</option>
          {cuisines.map((cuisine) => (
            <option key={cuisine} value={cuisine}>
              {cuisine}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'rating' | 'name')}
          className="px-4 py-2 border rounded-md bg-background"
        >
          <option value="rating">Sort by Rating</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No restaurants found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id.toString()} restaurant={restaurant} />
          ))}
        </div>
      )}
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
