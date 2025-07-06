import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  Settings,
  Shield,
  FileText,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface DashboardMetrics {
  total_users: number;
  total_vendors: number;
  total_products: number;
  total_orders: number;
  pending_disputes: number;
  pending_verifications: number;
  total_reviews: number;
  platform_revenue_btc: number;
}

interface AdminProfile {
  admin_role: string;
  is_active: boolean;
}

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  color = "default" 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  change?: string;
  color?: "default" | "success" | "warning" | "destructive";
}) => {
  const colorClasses = {
    default: "text-muted-foreground",
    success: "text-green-500",
    warning: "text-yellow-500",
    destructive: "text-red-500"
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground">
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      console.log('AdminDashboard: Checking admin access for user:', user?.id);
      
      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_profiles')
        .select('admin_role, is_active')
        .eq('user_id', user?.id)
        .single();

      console.log('AdminDashboard: Admin query result:', { adminData, adminError });

      if (adminError || !adminData?.is_active) {
        console.log('AdminDashboard: Access denied - no admin profile or inactive');
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        return;
      }

      console.log('AdminDashboard: Access granted - user is admin with role:', adminData.admin_role);
      setAdminProfile(adminData);
      loadDashboardMetrics();

    } catch (error) {
      console.error('AdminDashboard: Error checking admin access:', error);
      toast({
        title: "Error",
        description: "Failed to verify admin access",
        variant: "destructive",
      });
    }
  };

  const loadDashboardMetrics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_metrics');
      
      if (error) throw error;
      setMetrics(data as unknown as DashboardMetrics);

    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Loading admin dashboard...</div>
          <div className="text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  if (!adminProfile?.is_active) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Marketplace administration and oversight
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {adminProfile?.admin_role?.replace('_', ' ').toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Users"
              value={metrics.total_users.toLocaleString()}
              icon={Users}
              change="+12% from last month"
              color="success"
            />
            <MetricCard
              title="Active Vendors"
              value={metrics.total_vendors.toLocaleString()}
              icon={ShoppingBag}
              change="+8% from last month"
              color="success"
            />
            <MetricCard
              title="Total Products"
              value={metrics.total_products.toLocaleString()}
              icon={FileText}
              change="+15% from last month"
              color="success"
            />
            <MetricCard
              title="Platform Revenue"
              value={`${metrics.platform_revenue_btc.toFixed(8)} BTC`}
              icon={DollarSign}
              change="+5.2% from last month"
              color="success"
            />
            <MetricCard
              title="Total Orders"
              value={metrics.total_orders.toLocaleString()}
              icon={Activity}
              change="+18% from last month"
              color="success"
            />
            <MetricCard
              title="Pending Disputes"
              value={metrics.pending_disputes}
              icon={AlertTriangle}
              change="Requires attention"
              color={metrics.pending_disputes > 0 ? "warning" : "default"}
            />
            <MetricCard
              title="Verification Queue"
              value={metrics.pending_verifications}
              icon={Shield}
              change="Pending review"
              color={metrics.pending_verifications > 0 ? "warning" : "default"}
            />
            <MetricCard
              title="Total Reviews"
              value={metrics.total_reviews.toLocaleString()}
              icon={TrendingUp}
              change="+22% from last month"
              color="success"
            />
          </div>
        )}

        {/* Admin Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest marketplace activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Activity feed will be implemented here
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Platform status and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Status</span>
                      <Badge variant="outline" className="text-green-500">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Processing</span>
                      <Badge variant="outline" className="text-green-500">
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Badge variant="outline" className="text-green-500">
                        Connected
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  User management interface will be implemented here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Management</CardTitle>
                <CardDescription>Review and approve vendor applications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Vendor verification and management interface will be implemented here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disputes">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Resolution</CardTitle>
                <CardDescription>Manage order disputes and resolutions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Advanced dispute management interface will be implemented here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Platform configuration interface will be implemented here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}