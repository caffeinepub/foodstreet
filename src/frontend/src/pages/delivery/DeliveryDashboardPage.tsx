import { useGetAvailableDeliveries, useGetMyDeliveries, useAcceptDelivery, useUpdateDeliveryStatus } from '../../hooks/useQueries';
import { Truck, Package, Clock } from 'lucide-react';
import { OrderStatus } from '../../backend';
import type { Order } from '../../backend';
import { useState } from 'react';

export default function DeliveryDashboardPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'my'>('available');
  const { data: availableDeliveries = [], isLoading: availableLoading } = useGetAvailableDeliveries(5000);
  const { data: myDeliveries = [], isLoading: myLoading } = useGetMyDeliveries(5000);
  const acceptDelivery = useAcceptDelivery();
  const updateStatus = useUpdateDeliveryStatus();

  const handleAccept = async (orderId: bigint) => {
    try {
      await acceptDelivery.mutateAsync(orderId);
      setActiveTab('my');
    } catch (error) {
      console.error('Failed to accept delivery:', error);
    }
  };

  const handleStatusUpdate = async (orderId: bigint, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
    } catch (error) {
      console.error('Failed to update delivery status:', error);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Truck className="h-8 w-8" />
        Delivery Dashboard
      </h1>

      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'available'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Available Deliveries ({availableDeliveries.length})
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'my'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Deliveries ({myDeliveries.length})
        </button>
      </div>

      {activeTab === 'available' ? (
        <div className="space-y-4">
          {availableLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : availableDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No available deliveries at the moment</p>
            </div>
          ) : (
            availableDeliveries.map((order) => (
              <AvailableDeliveryCard
                key={order.id.toString()}
                order={order}
                onAccept={handleAccept}
                isAccepting={acceptDelivery.isPending}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {myLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : myDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You have no active deliveries</p>
            </div>
          ) : (
            myDeliveries.map((order) => (
              <MyDeliveryCard
                key={order.id.toString()}
                order={order}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={updateStatus.isPending}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AvailableDeliveryCard({
  order,
  onAccept,
  isAccepting,
}: {
  order: Order;
  onAccept: (orderId: bigint) => void;
  isAccepting: boolean;
}) {
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
        <span className="text-lg font-bold">${order.totalPrice.toFixed(2)}</span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Items: {order.items.length}</p>
      </div>

      <button
        onClick={() => onAccept(order.id)}
        disabled={isAccepting}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isAccepting ? 'Accepting...' : 'Accept Delivery'}
      </button>
    </div>
  );
}

function MyDeliveryCard({
  order,
  onStatusUpdate,
  isUpdating,
}: {
  order: Order;
  onStatusUpdate: (orderId: bigint, status: OrderStatus) => void;
  isUpdating: boolean;
}) {
  const canPickup = order.status === OrderStatus.readyForPickup;
  const canDeliver = order.status === OrderStatus.pickedUp;

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
        <p className="text-sm text-muted-foreground mb-1">Items: {order.items.length}</p>
        <p className="text-lg font-bold">${order.totalPrice.toFixed(2)}</p>
      </div>

      {canPickup && (
        <button
          onClick={() => onStatusUpdate(order.id, OrderStatus.pickedUp)}
          disabled={isUpdating}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          Mark as Picked Up
        </button>
      )}

      {canDeliver && (
        <button
          onClick={() => onStatusUpdate(order.id, OrderStatus.delivered)}
          disabled={isUpdating}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          Mark as Delivered
        </button>
      )}
    </div>
  );
}
