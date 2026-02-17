import { useState, useMemo } from 'react';
import { useGetAllOrders, useGetAllUsers, useGetAdminRestaurants } from '../../hooks/useQueries';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Loader2, Package } from 'lucide-react';
import { OrderStatus } from '../../backend';

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: users = [], isLoading: usersLoading } = useGetAllUsers();
  const { data: restaurants = [], isLoading: restaurantsLoading } = useGetAdminRestaurants();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [restaurantFilter, setRestaurantFilter] = useState<string>('all');

  const isLoading = ordersLoading || usersLoading || restaurantsLoading;

  // Create lookup maps
  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach(([principal, profile]) => {
      map.set(principal.toString(), profile.name);
    });
    return map;
  }, [users]);

  const restaurantMap = useMemo(() => {
    const map = new Map();
    restaurants.forEach((restaurant) => {
      map.set(restaurant.id.toString(), restaurant.name);
    });
    return map;
  }, [restaurants]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusMatch = statusFilter === 'all' || order.status === statusFilter;
      const restaurantMatch =
        restaurantFilter === 'all' || order.restaurant.toString() === restaurantFilter;
      return statusMatch && restaurantMatch;
    });
  }, [orders, statusFilter, restaurantFilter]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => Number(b.createdAt - a.createdAt));
  }, [filteredOrders]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.delivered:
        return 'default';
      case OrderStatus.cancelled:
        return 'destructive';
      case OrderStatus.placed:
      case OrderStatus.accepted:
      case OrderStatus.preparing:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getCustomerName = (customerPrincipal: string): string => {
    return userMap.get(customerPrincipal) || 'Unknown customer';
  };

  const getRestaurantName = (restaurantId: string): string => {
    return restaurantMap.get(restaurantId) || 'Unknown restaurant';
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-muted-foreground">View and monitor all orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={OrderStatus.placed}>Placed</SelectItem>
            <SelectItem value={OrderStatus.accepted}>Accepted</SelectItem>
            <SelectItem value={OrderStatus.preparing}>Preparing</SelectItem>
            <SelectItem value={OrderStatus.readyForPickup}>Ready for Pickup</SelectItem>
            <SelectItem value={OrderStatus.pickedUp}>Picked Up</SelectItem>
            <SelectItem value={OrderStatus.delivered}>Delivered</SelectItem>
            <SelectItem value={OrderStatus.cancelled}>Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Filter by restaurant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Restaurants</SelectItem>
            {restaurants.map((restaurant) => (
              <SelectItem key={restaurant.id.toString()} value={restaurant.id.toString()}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
          <p className="text-muted-foreground">
            {statusFilter !== 'all' || restaurantFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Orders will appear here once customers start placing them'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <div key={order.id.toString()} className="bg-card border rounded-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">Order #{order.id.toString()}</h3>
                    <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(Number(order.createdAt) / 1000000).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${order.totalPrice.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{order.items.length} item(s)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-medium">{getCustomerName(order.customer.toString())}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Restaurant:</span>
                  <p className="font-medium">{getRestaurantName(order.restaurant.toString())}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
