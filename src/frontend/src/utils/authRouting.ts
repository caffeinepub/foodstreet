import { AppRole } from '../backend';

/**
 * Returns the default landing route for a given app role
 */
export function getRoleLandingRoute(role: AppRole): string {
  switch (role) {
    case AppRole.customer:
      return '/';
    case AppRole.restaurantOwner:
      return '/owner';
    case AppRole.deliveryPartner:
      return '/delivery';
    case AppRole.admin:
      return '/admin';
    default:
      return '/';
  }
}

/**
 * Checks if a given path is allowed for a specific app role
 * Mirrors the RoleGate allowedRoles logic for each route
 */
export function isRouteAllowedForRole(path: string, role: AppRole): boolean {
  // Customer routes (also accessible by admin)
  const customerRoutes = ['/', '/search', '/cart', '/checkout', '/orders'];
  const customerRoutePatterns = ['/restaurant/', '/order-confirmation/', '/orders/'];
  
  // Owner routes (also accessible by admin)
  const ownerRoutes = ['/owner', '/owner/onboarding'];
  const ownerRoutePatterns = ['/owner/restaurant/'];
  
  // Delivery routes (also accessible by admin)
  const deliveryRoutes = ['/delivery'];
  
  // Admin-only routes
  const adminRoutes = ['/admin', '/admin/restaurants', '/admin/orders', '/admin/users', '/admin/delivery-partners'];

  // Admin can access everything
  if (role === AppRole.admin) {
    return true;
  }

  // Check exact matches and patterns for each role
  if (role === AppRole.customer) {
    return customerRoutes.includes(path) || 
           customerRoutePatterns.some(pattern => path.startsWith(pattern));
  }

  if (role === AppRole.restaurantOwner) {
    return ownerRoutes.includes(path) || 
           ownerRoutePatterns.some(pattern => path.startsWith(pattern));
  }

  if (role === AppRole.deliveryPartner) {
    return deliveryRoutes.includes(path);
  }

  return false;
}
