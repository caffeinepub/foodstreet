import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  RestaurantProfile,
  MenuItem,
  CartItem,
  Order,
  Review,
  RestaurantId,
  MenuItemId,
  OrderId,
  OrderStatus,
  MenuItemVariant,
  AppRole,
  PublicUserProfile,
} from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Hooks
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userPrincipal: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      return actor.getUserProfile(userPrincipal);
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.saveCallerUserProfile(profile);
      } catch (error: any) {
        // Re-throw with normalized error message for UI handling
        throw new Error(error?.message || String(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Restaurant Hooks
export function useGetAllRestaurants() {
  const { actor, isFetching } = useActor();

  return useQuery<RestaurantProfile[]>({
    queryKey: ['restaurants'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRestaurants();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRestaurant(restaurantId: RestaurantId | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<RestaurantProfile | null>({
    queryKey: ['restaurant', restaurantId?.toString()],
    queryFn: async () => {
      if (!actor || !restaurantId) return null;
      return actor.getRestaurant(restaurantId);
    },
    enabled: !!actor && !isFetching && !!restaurantId,
  });
}

export function useSearchRestaurants(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<RestaurantProfile[]>({
    queryKey: ['restaurants', 'search', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchRestaurants(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

export function useGetMyRestaurants() {
  const { actor, isFetching } = useActor();

  return useQuery<RestaurantProfile[]>({
    queryKey: ['myRestaurants'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyRestaurants();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateRestaurant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: RestaurantProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRestaurant(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRestaurants'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateRestaurant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      name,
      cuisineType,
      address,
      phone,
    }: {
      restaurantId: RestaurantId;
      name: string;
      cuisineType: string;
      address: string;
      phone: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateRestaurant(restaurantId, name, cuisineType, address, phone);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', variables.restaurantId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myRestaurants'] });
    },
  });
}

// Menu Hooks
export function useGetMenuItems(restaurantId: RestaurantId | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<MenuItem[]>({
    queryKey: ['menuItems', restaurantId?.toString()],
    queryFn: async () => {
      if (!actor || !restaurantId) return [];
      return actor.getMenuItems(restaurantId);
    },
    enabled: !!actor && !isFetching && !!restaurantId,
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ restaurantId, item }: { restaurantId: RestaurantId; item: MenuItem }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMenuItem(restaurantId, item);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', variables.restaurantId.toString()] });
    },
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      menuItemId,
      restaurantId,
      name,
      description,
      price,
      isVeg,
      isAvailable,
      variants,
    }: {
      menuItemId: MenuItemId;
      restaurantId: RestaurantId;
      name: string;
      description: string;
      price: number;
      isVeg: boolean;
      isAvailable: boolean;
      variants: MenuItemVariant[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMenuItem(menuItemId, name, description, price, isVeg, isAvailable, variants);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', variables.restaurantId.toString()] });
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuItemId, restaurantId }: { menuItemId: MenuItemId; restaurantId: RestaurantId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMenuItem(menuItemId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', variables.restaurantId.toString()] });
    },
  });
}

// Cart Hooks
export function useGetCart() {
  const { actor, isFetching } = useActor();

  return useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuItemId, quantity }: { menuItemId: MenuItemId; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(menuItemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuItemId: MenuItemId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeFromCart(menuItemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// Order Hooks
export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restaurantId: RestaurantId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(restaurantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
}

export function useGetMyOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['myOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrder(orderId: OrderId | undefined, refetchInterval?: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ['order', orderId?.toString()],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && !!orderId,
    refetchInterval,
  });
}

export function useGetRestaurantOrders(restaurantId: RestaurantId | undefined, refetchInterval?: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['restaurantOrders', restaurantId?.toString()],
    queryFn: async () => {
      if (!actor || !restaurantId) return [];
      return actor.getRestaurantOrders(restaurantId);
    },
    enabled: !!actor && !isFetching && !!restaurantId,
    refetchInterval,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: OrderId; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['restaurantOrders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
}

// Delivery Hooks
export function useGetAvailableDeliveries(refetchInterval?: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['availableDeliveries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableDeliveries();
    },
    enabled: !!actor && !isFetching,
    refetchInterval,
  });
}

export function useGetMyDeliveries(refetchInterval?: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['myDeliveries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyDeliveries();
    },
    enabled: !!actor && !isFetching,
    refetchInterval,
  });
}

export function useAcceptDelivery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: OrderId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptDelivery(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['myDeliveries'] });
    },
  });
}

export function useUpdateDeliveryStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: OrderId; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDeliveryStatus(orderId, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myDeliveries'] });
    },
  });
}

// Review Hooks
export function useGetRestaurantReviews(restaurantId: RestaurantId | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['reviews', restaurantId?.toString()],
    queryFn: async () => {
      if (!actor || !restaurantId) return [];
      return actor.getRestaurantReviews(restaurantId);
    },
    enabled: !!actor && !isFetching && !!restaurantId,
  });
}

export function useAddReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      orderId,
      rating,
      comment,
    }: {
      restaurantId: RestaurantId;
      orderId: OrderId;
      rating: number;
      comment: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addReview(restaurantId, orderId, rating, comment);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.restaurantId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', variables.restaurantId.toString()] });
    },
  });
}

// Admin Hooks
export function useGetPendingRestaurants() {
  const { actor, isFetching } = useActor();

  return useQuery<RestaurantProfile[]>({
    queryKey: ['pendingRestaurants'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingRestaurants();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveRestaurant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restaurantId: RestaurantId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveRestaurant(restaurantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRestaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
    },
  });
}

export function useSuspendRestaurant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restaurantId: RestaurantId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.suspendRestaurant(restaurantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
    },
  });
}

export function useUnsuspendRestaurant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restaurantId: RestaurantId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unsuspendRestaurant(restaurantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
    },
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAdminRestaurants() {
  const { actor, isFetching } = useActor();

  return useQuery<RestaurantProfile[]>({
    queryKey: ['adminRestaurants'],
    queryFn: async () => {
      if (!actor) return [];
      const [pending, all] = await Promise.all([
        actor.getPendingRestaurants(),
        actor.getAllRestaurants(),
      ]);
      // Combine pending and active restaurants
      const pendingIds = new Set(pending.map(r => r.id.toString()));
      const activeRestaurants = all.filter(r => !pendingIds.has(r.id.toString()));
      return [...pending, ...activeRestaurants];
    },
    enabled: !!actor && !isFetching,
  });
}

// Delivery Partner Admin Hooks
export function useGetPendingDeliveryPartners() {
  const { actor, isFetching } = useActor();

  return useQuery<PublicUserProfile[]>({
    queryKey: ['pendingDeliveryPartners'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingDeliveryPartners();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveDeliveryPartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveDeliveryPartner(userPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDeliveryPartners'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}
