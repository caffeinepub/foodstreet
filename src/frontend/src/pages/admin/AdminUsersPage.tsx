import { useGetAllUsers } from '../../hooks/useQueries';
import { Badge } from '../../components/ui/badge';
import { Loader2, Users } from 'lucide-react';
import { AppRole } from '../../backend';

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useGetAllUsers();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case AppRole.admin:
        return 'destructive';
      case AppRole.restaurantOwner:
        return 'default';
      case AppRole.deliveryPartner:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: AppRole) => {
    switch (role) {
      case AppRole.admin:
        return 'Admin';
      case AppRole.restaurantOwner:
        return 'Restaurant Owner';
      case AppRole.deliveryPartner:
        return 'Delivery Partner';
      case AppRole.customer:
        return 'Customer';
      default:
        return role;
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">View all users and their profiles</p>
      </div>

      {users.length === 0 ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Users Found</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(([principal, profile]) => (
            <div key={principal.toString()} className="bg-card border rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{profile.name}</h3>
                <Badge variant={getRoleBadgeVariant(profile.appRole)}>
                  {getRoleLabel(profile.appRole)}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p>{profile.phone}</p>
                </div>

                {profile.deliveryAddress && (
                  <div>
                    <span className="text-muted-foreground">Delivery Address:</span>
                    <p>{profile.deliveryAddress}</p>
                  </div>
                )}

                {profile.restaurantIds.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Restaurants:</span>
                    <p>{profile.restaurantIds.length} restaurant(s)</p>
                  </div>
                )}

                {profile.appRole === AppRole.deliveryPartner && (
                  <div>
                    <span className="text-muted-foreground">Approval Status:</span>
                    <p>
                      {profile.isApprovedDeliveryPartner ? (
                        <Badge variant="default">Approved</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-muted-foreground">Principal:</span>
                  <p className="font-mono text-xs break-all mt-1">{principal.toString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
