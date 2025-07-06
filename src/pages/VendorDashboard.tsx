import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVendorStatus } from '@/hooks/useVendorStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Package, DollarSign, Star, Users, TrendingUp, ArrowLeft, Clock, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TrustScoreChart from '@/components/TrustScoreChart';

const VendorDashboard = () => {
  const { user } = useAuth();
  const { isVendor, hasActiveBond, vendorProfile, loading } = useVendorStatus();
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (user && isVendor) {
      fetchRecentOrders();
    }
  }, [user, isVendor]);

  const fetchRecentOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(title, price_btc),
          profiles!orders_buyer_id_fkey(display_name)
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load recent orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Please Login</h2>
            <p className="text-muted-foreground">
              You need to be logged in to access the vendor dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isVendor) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Not a Vendor</h2>
            <p className="text-muted-foreground mb-4">
              You need to register as a vendor to access this dashboard.
            </p>
            <Button asChild>
              <Link to="/vendor/register">Become a Vendor</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasActiveBond) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Complete Vendor Setup</h2>
            <p className="text-muted-foreground mb-4">
              You need to pay the vendor bond to activate your store.
            </p>
            <Button asChild>
              <Link to="/vendor/register">Complete Setup</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header with navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">Vendor Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {vendorProfile?.store_name}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={vendorProfile?.is_verified ? "default" : "secondary"}>
              {vendorProfile?.is_verified ? "Verified" : "Unverified"}
            </Badge>
            {vendorProfile?.is_featured && (
              <Badge variant="outline">Featured</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorProfile?.trust_score || 0}</div>
            <p className="text-xs text-muted-foreground">
              {vendorProfile?.is_verified ? "Verified vendor" : "Pending verification"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorProfile?.total_sales || 0}</div>
            <p className="text-xs text-muted-foreground">
              Successful orders: {vendorProfile?.successful_orders || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorProfile?.response_time_hours || 24}h</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disputes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorProfile?.dispute_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total disputes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trust Score Chart */}
      {vendorProfile && (
        <TrustScoreChart 
          vendorId={user?.id || ''} 
          currentScore={vendorProfile.trust_score || 0} 
          isVerified={vendorProfile.is_verified || false}
          className="mb-8"
        />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Product Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Add, edit, and manage your product listings.
            </p>
            <Button asChild className="w-full">
              <Link to="/vendor/products">Manage Products</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Store Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Update your store information and settings.
            </p>
            <Button variant="outline" className="w-full">
              Store Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View your sales analytics and performance.
            </p>
            <Button variant="outline" className="w-full">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Recent Orders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-muted-foreground">
                Your recent orders will appear here once customers start purchasing your products.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium">{order.products?.title || 'Product'}</h4>
                      <p className="text-sm text-muted-foreground">
                        by {order.profiles?.display_name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={
                        order.status === 'paid' ? 'default' :
                        order.status === 'pending' ? 'secondary' :
                        order.status === 'completed' ? 'default' : 'secondary'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">
                      {order.products?.price_btc || order.total_btc} BTC
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {order.quantity}
                    </p>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  View All Orders
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Store Name</h3>
              <p className="text-muted-foreground">{vendorProfile?.store_name}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Bitcoin Address</h3>
              <p className="text-muted-foreground font-mono text-sm">
                {vendorProfile?.bitcoin_address || "Not set"}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Wallet Balance</h3>
              <p className="text-muted-foreground">
                {vendorProfile?.wallet_balance || 0} BTC
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Payout Threshold</h3>
              <p className="text-muted-foreground">
                {vendorProfile?.payout_threshold || 0} BTC
              </p>
            </div>
          </div>
          {vendorProfile?.description && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">{vendorProfile.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboard;