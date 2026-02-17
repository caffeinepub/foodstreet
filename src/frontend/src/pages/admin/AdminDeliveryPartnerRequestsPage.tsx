import { useGetPendingDeliveryPartners, useApproveDeliveryPartner } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { CheckCircle, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDeliveryPartnerRequestsPage() {
  const { data: pendingPartners = [], isLoading } = useGetPendingDeliveryPartners();
  const approvePartner = useApproveDeliveryPartner();

  const handleApprove = async (userPrincipal: string) => {
    try {
      await approvePartner.mutateAsync(userPrincipal as any);
      toast.success('Delivery partner approved successfully');
    } catch (error: any) {
      console.error('Failed to approve delivery partner:', error);
      toast.error('Failed to approve delivery partner');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading delivery partner requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Delivery Partner Requests</h1>
        <p className="text-muted-foreground">
          Review and approve pending delivery partner signups
        </p>
      </div>

      {pendingPartners.length === 0 ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Pending Requests</h2>
          <p className="text-muted-foreground">
            There are no delivery partner requests waiting for approval
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingPartners.map((partner) => (
            <div key={partner.id.toString()} className="bg-card border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{partner.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Delivery Partner</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Principal:</span>
                  <p className="font-mono text-xs break-all mt-1">{partner.id.toString()}</p>
                </div>
              </div>

              <Button
                onClick={() => handleApprove(partner.id.toString())}
                disabled={approvePartner.isPending}
                className="w-full"
              >
                {approvePartner.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Partner
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
