import { useParams } from '@tanstack/react-router';
import { useGetRestaurantOrders, useUpdateOrderStatus } from '../../hooks/useQueries';
import { Package, Clock } from 'lucide-react';
import { OrderStatus } from '../../backend';
import type { Order } from '../../backend';

export default function IncomingOrdersPage() {
  const { restaurantId } = useParams({ from: '/owner/restaurant/$restaurantId/orders' });
  const { data: orders = [], isLoading } = useGetRestaurantOrders(BigInt(restaurantId), 5000);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusUpdate = async (orderId: bigint, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const sortedOrders = [...orders].sort((a, b) => Number(b.createdAt - a.createdAt));

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

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Package className="h-8 w-8" />
        Incoming Orders
      </h1>

      {sortedOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <OrderCard
              key={order.id.toString()}
              order={order}
              onStatusUpdate={handleStatusUpdate}
              isUpdating={updateStatus.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  onStatusUpdate,
  isUpdating,
}: {
  order: Order;
  onStatusUpdate: (orderId: bigint, status: OrderStatus) => void;
  isUpdating: boolean;
}) {
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case OrderStatus.placed:
        return OrderStatus.accepted;
      case OrderStatus.accepted:
        return OrderStatus.preparing;
      case OrderStatus.preparing:
        return OrderStatus.readyForPickup;
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">Order #{order.id.toString()}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date(Number(order.createdAt) / 1000000).toLocaleString()}</span>
          </div>
        </div>
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {order.status}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">Items: {order.items.length}</p>
        <p className="text-lg font-bold">${order.totalPrice.toFixed(2)}</p>
      </div>

      {nextStatus && (
        <div className="flex gap-2">
          <button
            onClick={() => onStatusUpdate(order.id, nextStatus)}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Mark as {nextStatus}
          </button>
          {order.status === OrderStatus.placed && (
            <button
              onClick={() => onStatusUpdate(order.id, OrderStatus.cancelled)}
              disabled={isUpdating}
              className="px-4 py-2 border border-destructive text-destructive rounded-md hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
