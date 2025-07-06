import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  Settings,
  Shield,
  FileText,
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Database,
  Globe,
  Server,
  Zap,
  Eye,
  UserCheck,
  ShoppingCart
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
  color = "default",
  trend
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  change?: string;
  color?: "default" | "success" | "warning" | "destructive";
  trend?: number;
}) => {
  const colorClasses = {
    default: "text-muted-foreground",
    success: "text-emerald-500",
    warning: "text-amber-500",
    destructive: "text-red-500"
  };

  const bgClasses = {
    default: "bg-muted/50",
    success: "bg-emerald-500/10",
    warning: "bg-amber-500/10",
    destructive: "bg-red-500/10"
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${bgClasses[color]} transition-colors`}>
          <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {change && (
          <div className="flex items-center space-x-2">
            <p className={`text-xs font-medium ${colorClasses[color]}`}>
              {change}
            </p>
            {trend && (
              <div className="flex-1">
                <Progress value={Math.abs(trend)} className="h-1" />
              </div>
            )}
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Marketplace administration and oversight
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              {adminProfile?.admin_role?.replace('_', ' ').toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {metrics && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard
                title="Total Users"
                value={metrics.total_users.toLocaleString()}
                icon={Users}
                change="+12% from last month"
                color="success"
                trend={75}
              />
              <MetricCard
                title="Active Vendors"
                value={metrics.total_vendors.toLocaleString()}
                icon={UserCheck}
                change="+8% from last month"
                color="success"
                trend={60}
              />
              <MetricCard
                title="Total Orders"
                value={metrics.total_orders.toLocaleString()}
                icon={ShoppingCart}
                change="+18% from last month"
                color="success"
                trend={85}
              />
              <MetricCard
                title="Platform Revenue"
                value={`${metrics.platform_revenue_btc.toFixed(8)} BTC`}
                icon={DollarSign}
                change="+5.2% from last month"
                color="success"
                trend={45}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Products"
                value={metrics.total_products.toLocaleString()}
                icon={FileText}
                change="+15% from last month"
                color="success"
                trend={70}
              />
              <MetricCard
                title="Pending Disputes"
                value={metrics.pending_disputes}
                icon={AlertTriangle}
                change="Requires attention"
                color={metrics.pending_disputes > 0 ? "warning" : "success"}
                trend={metrics.pending_disputes > 0 ? 30 : 0}
              />
              <MetricCard
                title="Verification Queue"
                value={metrics.pending_verifications}
                icon={Shield}
                change="Pending review"
                color={metrics.pending_verifications > 0 ? "warning" : "success"}
                trend={metrics.pending_verifications > 0 ? 25 : 0}
              />
              <MetricCard
                title="Total Reviews"
                value={metrics.total_reviews.toLocaleString()}
                icon={TrendingUp}
                change="+22% from last month"
                color="success"
                trend={90}
              />
            </div>
          </div>
        )}

        {/* Admin Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-12 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-background">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center gap-2 data-[state=active]:bg-background">
              <ShoppingBag className="h-4 w-4" />
              Vendors
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex items-center gap-2 data-[state=active]:bg-background">
              <AlertTriangle className="h-4 w-4" />
              Disputes
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest marketplace activities and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                      <div className="p-2 bg-blue-500/10 rounded-full">
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registration</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                      <div className="p-2 bg-green-500/10 rounded-full">
                        <ShoppingCart className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Order completed</p>
                        <p className="text-xs text-muted-foreground">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                      <div className="p-2 bg-amber-500/10 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Dispute opened</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Health
                  </CardTitle>
                  <CardDescription>Platform status and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          System Status
                        </span>
                        <Badge variant="secondary" className="text-green-600 bg-green-100">
                          Operational
                        </Badge>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Payment Processing
                        </span>
                        <Badge variant="secondary" className="text-green-600 bg-green-100">
                          Online
                        </Badge>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Database
                        </span>
                        <Badge variant="secondary" className="text-green-600 bg-green-100">
                          Connected
                        </Badge>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Last updated</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Just now
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today's Stats</CardTitle>
                  <CardDescription>Real-time performance data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Page Views</span>
                      <span className="font-semibold">12,458</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Users</span>
                      <span className="font-semibold">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Conversion Rate</span>
                      <span className="font-semibold">3.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Status</CardTitle>
                  <CardDescription>Platform security overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Failed Logins</span>
                      <span className="font-semibold text-red-500">23</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Blocked IPs</span>
                      <span className="font-semibold">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Security Score</span>
                      <span className="font-semibold text-green-500">98%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-2" />
                      View Recent Orders
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Approve Vendors
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Review Disputes
                    </Button>
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