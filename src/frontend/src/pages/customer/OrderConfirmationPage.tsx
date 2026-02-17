import { useParams, Link } from '@tanstack/react-router';
import { useGetOrder } from '../../hooks/useQueries';
import { CheckCircle, Package } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const { data: order, isLoading } = useGetOrder(BigInt(orderId));

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

  if (!order) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Order not found</p>
      </div>
    );
  }

  return (
    <div className="container py-16 max-w-2xl">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-muted-foreground">Your order has been confirmed and is being prepared</p>
      </div>

      <div className="border rounded-lg p-6 bg-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Order #{order.id.toString()}</h2>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize">{order.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium">${order.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items</span>
            <span className="font-medium">{order.items.length}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          to="/orders/$orderId"
          params={{ orderId: order.id.toString() }}
          className="flex-1 text-center px-6 py-3 border rounded-md hover:bg-secondary transition-colors"
        >
          Track Order
        </Link>
        <Link
          to="/"
          className="flex-1 text-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
