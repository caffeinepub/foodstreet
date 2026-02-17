import { useState } from 'react';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { AppRole } from '../../backend';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ProfileSetupDialog() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [appRole, setAppRole] = useState<AppRole>(AppRole.customer);
  const [error, setError] = useState<string | null>(null);
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setError(null);

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        appRole,
        restaurantIds: [],
        deliveryAddress: undefined,
        isApprovedDeliveryPartner: false,
      });
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      const errorMessage = err?.message || String(err);
      if (errorMessage.includes('admin') || errorMessage.includes('Unauthorized')) {
        setError('You cannot assign yourself as an admin. Please select a different role.');
      } else {
        setError('Failed to save profile. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6 border">
        <div className="mb-6 text-center">
          <img
            src="/assets/generated/foodstreet-logo.dim_512x256.png"
            alt="Foodstreet"
            className="h-12 w-auto mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold">Welcome to Foodstreet!</h2>
          <p className="text-muted-foreground mt-2">Let's set up your profile</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-2">
              I want to use Foodstreet as a
            </label>
            <select
              id="role"
              value={appRole}
              onChange={(e) => setAppRole(e.target.value as AppRole)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value={AppRole.customer}>Customer</option>
              <option value={AppRole.restaurantOwner}>Restaurant Owner</option>
              <option value={AppRole.deliveryPartner}>Delivery Partner</option>
              <option value={AppRole.admin}>Admin Panel</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saveProfile.isPending}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saveProfile.isPending ? 'Setting up...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
