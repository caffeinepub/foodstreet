import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Review {
    customer: Principal;
    createdAt: Time;
    orderId: OrderId;
    comment: string;
    rating: number;
    restaurant: RestaurantId;
}
export type Time = bigint;
export interface MenuItemVariant {
    name: string;
    price: number;
}
export type RestaurantId = bigint;
export interface Order {
    id: OrderId;
    status: OrderStatus;
    customer: Principal;
    createdAt: Time;
    deliveryPartner?: Principal;
    items: Array<CartItem>;
    totalPrice: number;
    restaurant: RestaurantId;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface PublicUserProfile {
    id: Principal;
    appRole: AppRole;
    name: string;
    isApprovedDeliveryPartner: boolean;
}
export type MenuItemId = bigint;
export interface MenuItem {
    id: MenuItemId;
    name: string;
    isAvailable: boolean;
    description: string;
    variants: Array<MenuItemVariant>;
    restaurantId: RestaurantId;
    isVeg: boolean;
    price: number;
}
export interface CartItem {
    quantity: bigint;
    menuItemId: MenuItemId;
}
export interface RestaurantProfile {
    id: RestaurantId;
    status: RestaurantStatus;
    owner: Principal;
    name: string;
    cuisineType: string;
    address: string;
    rating: number;
    phone: string;
}
export type OrderId = bigint;
export interface UserProfile {
    restaurantIds: Array<RestaurantId>;
    deliveryAddress?: string;
    appRole: AppRole;
    name: string;
    isApprovedDeliveryPartner: boolean;
    phone: string;
}
export enum AppRole {
    admin = "admin",
    customer = "customer",
    deliveryPartner = "deliveryPartner",
    restaurantOwner = "restaurantOwner"
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum OrderStatus {
    readyForPickup = "readyForPickup",
    preparing = "preparing",
    cancelled = "cancelled",
    placed = "placed",
    pickedUp = "pickedUp",
    delivered = "delivered",
    accepted = "accepted"
}
export enum RestaurantStatus {
    active = "active",
    pending = "pending",
    suspended = "suspended"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptDelivery(orderId: OrderId): Promise<void>;
    addMenuItem(restaurantId: RestaurantId, item: MenuItem): Promise<MenuItemId>;
    addReview(restaurantId: RestaurantId, orderId: OrderId, rating: number, comment: string): Promise<void>;
    addToCart(menuItemId: MenuItemId, quantity: bigint): Promise<void>;
    approveDeliveryPartner(user: Principal): Promise<void>;
    approveRestaurant(restaurantId: RestaurantId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createRestaurant(profile: RestaurantProfile): Promise<RestaurantId>;
    deleteMenuItem(menuItemId: MenuItemId): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllRestaurants(): Promise<Array<RestaurantProfile>>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    getAvailableDeliveries(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getMenuItems(restaurantId: RestaurantId): Promise<Array<MenuItem>>;
    getMyDeliveries(): Promise<Array<Order>>;
    getMyOrders(): Promise<Array<Order>>;
    getMyRestaurants(): Promise<Array<RestaurantProfile>>;
    getOrder(orderId: OrderId): Promise<Order | null>;
    getPendingDeliveryPartners(): Promise<Array<PublicUserProfile>>;
    getPendingRestaurants(): Promise<Array<RestaurantProfile>>;
    getRestaurant(restaurantId: RestaurantId): Promise<RestaurantProfile | null>;
    getRestaurantOrders(restaurantId: RestaurantId): Promise<Array<Order>>;
    getRestaurantReviews(restaurantId: RestaurantId): Promise<Array<Review>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    placeOrder(restaurantId: RestaurantId): Promise<OrderId>;
    removeFromCart(menuItemId: MenuItemId): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchRestaurants(searchTerm: string): Promise<Array<RestaurantProfile>>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    suspendRestaurant(restaurantId: RestaurantId): Promise<void>;
    unsuspendRestaurant(restaurantId: RestaurantId): Promise<void>;
    updateDeliveryStatus(orderId: OrderId, status: OrderStatus): Promise<void>;
    updateMenuItem(menuItemId: MenuItemId, name: string, description: string, price: number, isVeg: boolean, isAvailable: boolean, variants: Array<MenuItemVariant>): Promise<void>;
    updateOrderStatus(orderId: OrderId, status: OrderStatus): Promise<void>;
    updateRestaurant(restaurantId: RestaurantId, name: string, cuisineType: string, address: string, phone: string): Promise<void>;
}
