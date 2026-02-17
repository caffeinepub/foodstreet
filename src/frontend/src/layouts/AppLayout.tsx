import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, User, Store, Truck, Shield, Search } from 'lucide-react';
import { AppRole } from '../backend';
import { clearIntendedRoute } from '../utils/intendedRoute';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      clearIntendedRoute();
      navigate({ to: '/' });
    } else {
      try {
        await login();
        // Navigation will be handled by PostAuthRedirect in App.tsx
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const getRoleBasedLinks = () => {
    if (!userProfile) return [];

    switch (userProfile.appRole) {
      case AppRole.customer:
        return [
          { to: '/', label: 'Home', icon: Search },
          { to: '/orders', label: 'Orders', icon: ShoppingCart },
          { to: '/cart', label: 'Cart', icon: ShoppingCart },
        ];
      case AppRole.restaurantOwner:
        return [
          { to: '/owner', label: 'Dashboard', icon: Store },
        ];
      case AppRole.deliveryPartner:
        return [
          { to: '/delivery', label: 'Deliveries', icon: Truck },
        ];
      case AppRole.admin:
        return [
          { to: '/admin', label: 'Admin', icon: Shield },
          { to: '/', label: 'Browse', icon: Search },
        ];
      default:
        return [];
    }
  };

  const links = getRoleBasedLinks();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/assets/generated/foodstreet-logo.dim_512x256.png"
                alt="Foodstreet"
                className="h-8 w-auto"
              />
            </Link>
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-6">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      activeProps={{ className: 'text-foreground' }}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && userProfile && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{userProfile.name}</span>
              </div>
            )}
            <button
              onClick={handleAuth}
              disabled={isLoggingIn}
              className={`px-6 py-2 rounded-full transition-all font-medium text-sm ${
                isAuthenticated
                  ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card mt-auto">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Foodstreet</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Built with</span>
              <span className="text-red-500">♥</span>
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
