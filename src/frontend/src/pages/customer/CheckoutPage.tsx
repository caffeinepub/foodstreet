import { useState } from 'react';
import { useGetCart, useGetMenuItems, usePlaceOrder, useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { MapPin } from 'lucide-react';
import { useMemo } from 'react';

export default function CheckoutPage() {
  const { data: cartItems = [] } = useGetCart();
  const { data: userProfile } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const placeOrder = usePlaceOrder();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState(userProfile?.deliveryAddress || '');
  const [isEditingAddress, setIsEditingAddress] = useState(!userProfile?.deliveryAddress);

  const restaurantId = useMemo(() => {
    if (cartItems.length === 0) return null;
    return BigInt(1);
  }, [cartItems]);

  const { data: menuItems = [] } = useGetMenuItems(restaurantId || undefined);

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      if (menuItem) {
        return sum + menuItem.price * Number(item.quantity);
      }
      return sum;
    }, 0);
  }, [cartItems, menuItems]);

  const handleSaveAddress = async () => {
    if (!userProfile || !deliveryAddress.trim()) return;

    try {
      await saveProfile.mutateAsync({
        ...userProfile,
        deliveryAddress: deliveryAddress.trim(),
      });
      setIsEditingAddress(false);
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!restaurantId || !deliveryAddress.trim()) return;

    try {
      const orderId = await placeOrder.mutateAsync(restaurantId);
      navigate({ to: '/order-confirmation/$orderId', params: { orderId: orderId.toString() } });
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };

  if (cartItems.length === 0) {
    navigate({ to: '/cart' });
    return null;
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="space-y-6">
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </h2>
            {!isEditingAddress && (
              <button
                onClick={() => setIsEditingAddress(true)}
                className="text-sm text-primary hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingAddress ? (
            <div className="space-y-4">
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address"
                className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
                required
              />
              <button
                onClick={handleSaveAddress}
                disabled={saveProfile.isPending || !deliveryAddress.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saveProfile.isPending ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          ) : (
            <p className="text-muted-foreground">{deliveryAddress}</p>
          )}
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
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
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={placeOrder.isPending || !deliveryAddress.trim() || isEditingAddress}
          className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {placeOrder.isPending ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
