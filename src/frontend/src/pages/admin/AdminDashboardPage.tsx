import { Link } from '@tanstack/react-router';
import { Store, Package, Users, Truck } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage restaurants, orders, users, and delivery partners</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/restaurants"
          className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <Store className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Restaurants</h2>
          <p className="text-muted-foreground text-sm">
            Manage restaurant approvals and status
          </p>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <Package className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Orders</h2>
          <p className="text-muted-foreground text-sm">
            View and monitor all orders
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <Users className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <p className="text-muted-foreground text-sm">
            View all users and their profiles
          </p>
        </Link>

        <Link
          to="/admin/delivery-partners"
          className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <Truck className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Delivery Partner Requests</h2>
          <p className="text-muted-foreground text-sm">
            Approve pending delivery partner signups
          </p>
        </Link>
      </div>
    </div>
  );
}
