import { useGetMyOrders } from '../../hooks/useQueries';
import { Link } from '@tanstack/react-router';
import { Package, Clock } from 'lucide-react';
import type { Order } from '../../backend';

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useGetMyOrders();

  const sortedOrders = [...orders].sort((a, b) => Number(b.createdAt - a.createdAt));

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <img
            src="/assets/generated/foodstreet-empty-orders.dim_1200x800.png"
            alt="No orders"
            className="w-64 h-auto mx-auto mb-6 opacity-50"
          />
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">Start ordering from your favorite restaurants</p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Package className="h-8 w-8" />
        My Orders
      </h1>

      <div className="space-y-4">
        {sortedOrders.map((order) => (
          <OrderCard key={order.id.toString()} order={order} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusColors: Record<string, string> = {
    placed: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    preparing: 'bg-yellow-100 text-yellow-800',
    readyForPickup: 'bg-purple-100 text-purple-800',
    pickedUp: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <Link
      to="/orders/$orderId"
      params={{ orderId: order.id.toString() }}
      className="block border rounded-lg p-6 bg-card hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">Order #{order.id.toString()}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date(Number(order.createdAt) / 1000000).toLocaleDateString()}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
          {order.status}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">{order.items.length} items</span>
        <span className="text-lg font-bold">${order.totalPrice.toFixed(2)}</span>
      </div>
    </Link>
  );
}
