import { useParams } from '@tanstack/react-router';
import { useGetOrder, useGetUserProfile } from '../../hooks/useQueries';
import { Package, Clock, MapPin, User, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import ReviewComposer from '../../components/reviews/ReviewComposer';
import { OrderStatus } from '../../backend';

export default function OrderDetailPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const [refetchInterval, setRefetchInterval] = useState<number | undefined>(5000);
  const { data: order, isLoading, refetch } = useGetOrder(BigInt(orderId), refetchInterval);
  const { data: deliveryPartnerProfile } = useGetUserProfile(order?.deliveryPartner);

  const handleManualRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const isDelivered = order.status === OrderStatus.delivered;

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Package className="h-8 w-8" />
            Order #{order.id.toString()}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date(Number(order.createdAt) / 1000000).toLocaleString()}</span>
          </div>
        </div>
        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-secondary transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Order Status</h2>
          <div className="space-y-3">
            <StatusStep status="placed" currentStatus={order.status} label="Order Placed" />
            <StatusStep status="accepted" currentStatus={order.status} label="Accepted by Restaurant" />
            <StatusStep status="preparing" currentStatus={order.status} label="Preparing" />
            <StatusStep status="readyForPickup" currentStatus={order.status} label="Ready for Pickup" />
            <StatusStep status="pickedUp" currentStatus={order.status} label="Picked Up" />
            <StatusStep status="delivered" currentStatus={order.status} label="Delivered" />
          </div>
        </div>

        <div className="space-y-6">
          {order.deliveryPartner && (
            <div className="border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Delivery Partner
              </h2>
              <p className="text-muted-foreground">
                {deliveryPartnerProfile?.name || 'Assigned'}
              </p>
            </div>
          )}

          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span className="font-medium">{order.items.length}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDelivered && (
        <div className="border rounded-lg p-6 bg-card">
          <ReviewComposer restaurantId={order.restaurant} orderId={order.id} />
        </div>
      )}
    </div>
  );
}

function StatusStep({
  status,
  currentStatus,
  label,
}: {
  status: string;
  currentStatus: OrderStatus;
  label: string;
}) {
  const statusOrder = ['placed', 'accepted', 'preparing', 'readyForPickup', 'pickedUp', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const stepIndex = statusOrder.indexOf(status);
  const isCompleted = stepIndex <= currentIndex;
  const isCurrent = stepIndex === currentIndex;

  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-3 w-3 rounded-full ${
          isCompleted ? 'bg-primary' : 'bg-muted'
        } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
      />
      <span className={isCompleted ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}
