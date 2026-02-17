const INTENDED_ROUTE_KEY = 'foodstreet_intended_route';

/**
 * Store the intended route for post-login redirect
 */
export function setIntendedRoute(path: string): void {
  try {
    sessionStorage.setItem(INTENDED_ROUTE_KEY, path);
  } catch (error) {
    console.error('Failed to store intended route:', error);
  }
}

/**
 * Retrieve the stored intended route
 */
export function getIntendedRoute(): string | null {
  try {
    return sessionStorage.getItem(INTENDED_ROUTE_KEY);
  } catch (error) {
    console.error('Failed to retrieve intended route:', error);
    return null;
  }
}

/**
 * Clear the stored intended route
 */
export function clearIntendedRoute(): void {
  try {
    sessionStorage.removeItem(INTENDED_ROUTE_KEY);
  } catch (error) {
    console.error('Failed to clear intended route:', error);
  }
}
