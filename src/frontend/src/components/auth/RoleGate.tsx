import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { AppRole } from '../../backend';
import AccessDeniedScreen from './AccessDeniedScreen';
import { useEffect } from 'react';
import { setIntendedRoute } from '../../utils/intendedRoute';

interface RoleGateProps {
  allowedRoles: AppRole[];
  children: React.ReactNode;
}

export default function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Store intended route when user is not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isInitializing) {
      const currentPath = window.location.pathname;
      setIntendedRoute(currentPath);
    }
  }, [isAuthenticated, isInitializing]);

  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AccessDeniedScreen message="Please log in to access this page" isUnauthenticated />;
  }

  if (!userProfile) {
    return <AccessDeniedScreen message="Profile not found" isUnauthenticated={false} />;
  }

  // Check if delivery partner needs approval
  if (
    userProfile.appRole === AppRole.deliveryPartner &&
    !userProfile.isApprovedDeliveryPartner &&
    allowedRoles.includes(AppRole.deliveryPartner)
  ) {
    return (
      <AccessDeniedScreen message="Your delivery partner account is pending approval. Please wait for an admin to approve your request." isUnauthenticated={false} />
    );
  }

  const hasAccess = allowedRoles.includes(userProfile.appRole);

  if (!hasAccess) {
    return <AccessDeniedScreen message="You don't have permission to access this page" isUnauthenticated={false} />;
  }

  return <>{children}</>;
}
