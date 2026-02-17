import { useState } from 'react';
import { useGetAdminRestaurants, useApproveRestaurant, useSuspendRestaurant, useUnsuspendRestaurant } from '../../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, XCircle, Pause, Play, Loader2, Store } from 'lucide-react';
import { RestaurantStatus } from '../../backend';
import { toast } from 'sonner';

export default function AdminRestaurantsPage() {
  const { data: restaurants = [], isLoading } = useGetAdminRestaurants();
  const approveRestaurant = useApproveRestaurant();
  const suspendRestaurant = useSuspendRestaurant();
  const unsuspendRestaurant = useUnsuspendRestaurant();
  const [activeTab, setActiveTab] = useState('pending');

  const pendingRestaurants = restaurants.filter((r) => r.status === RestaurantStatus.pending);
  const activeRestaurants = restaurants.filter((r) => r.status === RestaurantStatus.active);
  const suspendedRestaurants = restaurants.filter((r) => r.status === RestaurantStatus.suspended);

  const handleApprove = async (restaurantId: bigint) => {
    try {
      await approveRestaurant.mutateAsync(restaurantId);
      toast.success('Restaurant approved successfully');
    } catch (error) {
      console.error('Failed to approve restaurant:', error);
      toast.error('Failed to approve restaurant');
    }
  };

  const handleSuspend = async (restaurantId: bigint) => {
    try {
      await suspendRestaurant.mutateAsync(restaurantId);
      toast.success('Restaurant suspended');
    } catch (error) {
      console.error('Failed to suspend restaurant:', error);
      toast.error('Failed to suspend restaurant');
    }
  };

  const handleUnsuspend = async (restaurantId: bigint) => {
    try {
      await unsuspendRestaurant.mutateAsync(restaurantId);
      toast.success('Restaurant unsuspended');
    } catch (error) {
      console.error('Failed to unsuspend restaurant:', error);
      toast.error('Failed to unsuspend restaurant');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading restaurants...</p>
          </div>
        </div>
      </div>
    );
  }

  const RestaurantCard = ({ restaurant }: { restaurant: typeof restaurants[0] }) => (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{restaurant.cuisineType}</p>
          <Badge
            variant={
              restaurant.status === RestaurantStatus.active
                ? 'default'
                : restaurant.status === RestaurantStatus.pending
                  ? 'secondary'
                  : 'destructive'
            }
          >
            {restaurant.status}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div>
          <span className="text-muted-foreground">Address:</span>
          <p>{restaurant.address}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Phone:</span>
          <p>{restaurant.phone}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Rating:</span>
          <p>{restaurant.rating.toFixed(1)} ⭐</p>
        </div>
        <div>
          <span className="text-muted-foreground">Owner Principal:</span>
          <p className="font-mono text-xs break-all">{restaurant.owner.toString()}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {restaurant.status === RestaurantStatus.pending && (
          <Button
            onClick={() => handleApprove(restaurant.id)}
            disabled={approveRestaurant.isPending}
            className="flex-1"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
        )}
        {restaurant.status === RestaurantStatus.active && (
          <Button
            onClick={() => handleSuspend(restaurant.id)}
            disabled={suspendRestaurant.isPending}
            variant="destructive"
            className="flex-1"
          >
            <Pause className="mr-2 h-4 w-4" />
            Suspend
          </Button>
        )}
        {restaurant.status === RestaurantStatus.suspended && (
          <Button
            onClick={() => handleUnsuspend(restaurant.id)}
            disabled={unsuspendRestaurant.isPending}
            className="flex-1"
          >
            <Play className="mr-2 h-4 w-4" />
            Unsuspend
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Restaurant Management</h1>
        <p className="text-muted-foreground">Manage restaurant approvals and status</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending ({pendingRestaurants.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeRestaurants.length})
          </TabsTrigger>
          <TabsTrigger value="suspended">
            Suspended ({suspendedRestaurants.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingRestaurants.length === 0 ? (
            <div className="bg-card border rounded-lg p-12 text-center">
              <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Pending Restaurants</h2>
              <p className="text-muted-foreground">
                There are no restaurants waiting for approval
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id.toString()} restaurant={restaurant} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          {activeRestaurants.length === 0 ? (
            <div className="bg-card border rounded-lg p-12 text-center">
              <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Active Restaurants</h2>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id.toString()} restaurant={restaurant} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suspended">
          {suspendedRestaurants.length === 0 ? (
            <div className="bg-card border rounded-lg p-12 text-center">
              <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Suspended Restaurants</h2>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suspendedRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id.toString()} restaurant={restaurant} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
