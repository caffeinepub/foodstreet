import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AppLayout from './layouts/AppLayout';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import CustomerHomePage from './pages/customer/CustomerHomePage';
import RestaurantDetailPage from './pages/customer/RestaurantDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import SearchResultsPage from './pages/customer/SearchResultsPage';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import RestaurantOnboardingPage from './pages/owner/RestaurantOnboardingPage';
import RestaurantSettingsPage from './pages/owner/RestaurantSettingsPage';
import MenuManagerPage from './pages/owner/MenuManagerPage';
import IncomingOrdersPage from './pages/owner/IncomingOrdersPage';
import DeliveryDashboardPage from './pages/delivery/DeliveryDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminRestaurantsPage from './pages/admin/AdminRestaurantsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminDeliveryPartnerRequestsPage from './pages/admin/AdminDeliveryPartnerRequestsPage';
import RoleGate from './components/auth/RoleGate';
import { AppRole } from './backend';
import { useEffect, useRef } from 'react';
import { getRoleLandingRoute, isRouteAllowedForRole } from './utils/authRouting';
import { getIntendedRoute, clearIntendedRoute } from './utils/intendedRoute';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

// Customer routes
const customerHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <RoleGate allowedRoles={[AppRole.customer, AppRole.admin]}>
      <CustomerHomePage />
    </RoleGate>
  ),
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: () => (
    <RoleGate allowedRoles={[AppRole.customer, AppRole.admin]}>
      <SearchResultsPage />
    </RoleGate>
  ),
});

const restaurantDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/restaurant/$restaurantId',
  component: () => (
    <RoleGate allowedRoles={[AppRole.customer, AppRole.admin]}>
      <RestaurantDetailPage />
    </RoleGate>
  ),
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: () => (
    <RoleGate allowedRoles={[AppRole.customer, AppRole.admin]}>
      <CartPage />
    </RoleGate>
  ),
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: () => (
    <RoleGate allowedRoles={[AppRole.customer, AppRole.admin]}>
      <CheckoutPage />
    </RoleGate>
  ),
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation/$orderId',
  component: () => (
    <RoleGate allowedRoles={[AppRole.customer, AppRole.admin]}>
      <OrderConfirmationPage />
    </RoleGate>
  ),
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: () => (
    <RoleGate allowedRoles={[AppRole.customer, AppRole.admin]}>
      <OrdersPage />
    </RoleGate>
  ),
});

const orderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  component: () => (
    <RoleGate allowedRoles={[AppRole.customer, AppRole.admin]}>
      <OrderDetailPage />
    </RoleGate>
  ),
});

// Owner routes
const ownerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner',
  component: () => (
    <RoleGate allowedRoles={[AppRole.restaurantOwner, AppRole.admin]}>
      <OwnerDashboardPage />
    </RoleGate>
  ),
});

const ownerOnboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner/onboarding',
  component: () => (
    <RoleGate allowedRoles={[AppRole.restaurantOwner, AppRole.admin]}>
      <RestaurantOnboardingPage />
    </RoleGate>
  ),
});

const ownerSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner/restaurant/$restaurantId/settings',
  component: () => (
    <RoleGate allowedRoles={[AppRole.restaurantOwner, AppRole.admin]}>
      <RestaurantSettingsPage />
    </RoleGate>
  ),
});

const ownerMenuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner/restaurant/$restaurantId/menu',
  component: () => (
    <RoleGate allowedRoles={[AppRole.restaurantOwner, AppRole.admin]}>
      <MenuManagerPage />
    </RoleGate>
  ),
});

const ownerOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner/restaurant/$restaurantId/orders',
  component: () => (
    <RoleGate allowedRoles={[AppRole.restaurantOwner, AppRole.admin]}>
      <IncomingOrdersPage />
    </RoleGate>
  ),
});

// Delivery routes
const deliveryDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/delivery',
  component: () => (
    <RoleGate allowedRoles={[AppRole.deliveryPartner, AppRole.admin]}>
      <DeliveryDashboardPage />
    </RoleGate>
  ),
});

// Admin routes
const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <RoleGate allowedRoles={[AppRole.admin]}>
      <AdminDashboardPage />
    </RoleGate>
  ),
});

const adminRestaurantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/restaurants',
  component: () => (
    <RoleGate allowedRoles={[AppRole.admin]}>
      <AdminRestaurantsPage />
    </RoleGate>
  ),
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/orders',
  component: () => (
    <RoleGate allowedRoles={[AppRole.admin]}>
      <AdminOrdersPage />
    </RoleGate>
  ),
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: () => (
    <RoleGate allowedRoles={[AppRole.admin]}>
      <AdminUsersPage />
    </RoleGate>
  ),
});

const adminDeliveryPartnersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/delivery-partners',
  component: () => (
    <RoleGate allowedRoles={[AppRole.admin]}>
      <AdminDeliveryPartnerRequestsPage />
    </RoleGate>
  ),
});

const routeTree = rootRoute.addChildren([
  customerHomeRoute,
  searchRoute,
  restaurantDetailRoute,
  cartRoute,
  checkoutRoute,
  orderConfirmationRoute,
  ordersRoute,
  orderDetailRoute,
  ownerDashboardRoute,
  ownerOnboardingRoute,
  ownerSettingsRoute,
  ownerMenuRoute,
  ownerOrdersRoute,
  deliveryDashboardRoute,
  adminDashboardRoute,
  adminRestaurantsRoute,
  adminOrdersRoute,
  adminUsersRoute,
  adminDeliveryPartnersRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function PostAuthRedirect() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const routerInstance = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Only proceed if authenticated and profile is resolved
    if (!identity || !isFetched || profileLoading || hasRedirectedRef.current) {
      return;
    }

    // If no profile exists, don't redirect (ProfileSetupDialog will handle it)
    if (!userProfile) {
      return;
    }

    // Profile exists at this point, safe to use
    const currentPath = window.location.pathname;

    // Check if current route is allowed for user's role
    const isCurrentRouteAllowed = isRouteAllowedForRole(currentPath, userProfile.appRole);

    if (isCurrentRouteAllowed) {
      // User is already on an allowed route, no redirect needed
      clearIntendedRoute();
      return;
    }

    // Check for intended route
    const intendedRoute = getIntendedRoute();
    
    if (intendedRoute && isRouteAllowedForRole(intendedRoute, userProfile.appRole)) {
      // Redirect to intended route if allowed
      hasRedirectedRef.current = true;
      clearIntendedRoute();
      routerInstance.navigate({ to: intendedRoute as any });
      return;
    }

    // Otherwise, redirect to role-based landing page
    const landingRoute = getRoleLandingRoute(userProfile.appRole);
    if (currentPath !== landingRoute) {
      hasRedirectedRef.current = true;
      clearIntendedRoute();
      routerInstance.navigate({ to: landingRoute as any });
    }
  }, [identity, userProfile, profileLoading, isFetched, routerInstance]);

  return null;
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <PostAuthRedirect />
      {showProfileSetup && <ProfileSetupDialog />}
    </>
  );
}
