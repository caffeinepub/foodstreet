import { useGetCart, useRemoveFromCart, useGetMenuItems, useGetAllRestaurants } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useMemo } from 'react';

export default function CartPage() {
  const { data: cartItems = [], isLoading } = useGetCart();
  const { data: restaurants = [] } = useGetAllRestaurants();
  const removeFromCart = useRemoveFromCart();
  const navigate = useNavigate();

  const restaurantId = useMemo(() => {
    if (cartItems.length === 0) return null;
    return cartItems[0].menuItemId;
  }, [cartItems]);

  const { data: menuItems = [] } = useGetMenuItems(restaurantId ? BigInt(0) : undefined);

  const cartWithDetails = useMemo(() => {
    return cartItems.map((cartItem) => {
      const menuItem = menuItems.find((item) => item.id === cartItem.menuItemId);
      return {
        ...cartItem,
        menuItem,
      };
    });
  }, [cartItems, menuItems]);

  const total = useMemo(() => {
    return cartWithDetails.reduce((sum, item) => {
      if (item.menuItem) {
        return sum + item.menuItem.price * Number(item.quantity);
      }
      return sum;
    }, 0);
  }, [cartWithDetails]);

  const handleRemove = async (menuItemId: bigint) => {
    try {
      await removeFromCart.mutateAsync(menuItemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate({ to: '/checkout' });
    }
  };

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

  if (cartItems.length === 0) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <img
            src="/assets/generated/foodstreet-empty-orders.dim_1200x800.png"
            alt="Empty cart"
            className="w-64 h-auto mx-auto mb-6 opacity-50"
          />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some delicious items to get started</p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <ShoppingBag className="h-8 w-8" />
        Your Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartWithDetails.map((item) => (
            <div key={item.menuItemId.toString()} className="border rounded-lg p-4 bg-card">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{item.menuItem?.name || 'Unknown Item'}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.menuItem?.description}</p>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">${item.menuItem?.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity.toString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item.menuItemId)}
                  disabled={removeFromCart.isPending}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 bg-card sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">$2.99</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${(total + 2.99).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
