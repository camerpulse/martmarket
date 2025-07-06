import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  ShoppingCart,
  Brain,
  Cpu,
  BarChart2,
  Download,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Ban,
  UserX,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { UserManagementDialog } from '@/components/admin/UserManagementDialog';
import { VendorManagementDialog } from '@/components/admin/VendorManagementDialog';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { TranslationManagement } from '@/components/admin/TranslationManagement';

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

interface User {
  id: string;
  user_id: string;
  display_name: string;
  user_type: string;
  created_at: string;
  is_banned?: boolean;
  ban_reason?: string;
}

interface Vendor {
  id: string;
  vendor_id: string;
  store_name: string;
  description: string;
  trust_score: number;
  is_verified: boolean;
  created_at: string;
  is_banned?: boolean;
  ban_reason?: string;
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
  
  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  
  // Dialog state
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [vendorManagementOpen, setVendorManagementOpen] = useState(false);
  const [categoriesManagementOpen, setCategoriesManagementOpen] = useState(false);
  const [translationsManagementOpen, setTranslationsManagementOpen] = useState(false);
  const [ordersManagementOpen, setOrdersManagementOpen] = useState(false);
  const [disputesManagementOpen, setDisputesManagementOpen] = useState(false);
  
  // Selected items for dialogs
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [userManagementDialogOpen, setUserManagementDialogOpen] = useState(false);
  const [vendorManagementDialogOpen, setVendorManagementDialogOpen] = useState(false);
  
  // Settings state
  const [platformFee, setPlatformFee] = useState("2.5");
  const [vendorBond, setVendorBond] = useState("250.00");
  const [maxDisputeDays, setMaxDisputeDays] = useState("30");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [aiModel, setAiModel] = useState("gpt-4o-mini");

  // Action handlers
  const handleExportUsers = () => {
    toast({
      title: "Export Started",
      description: "User data export is being prepared. You'll receive an email when ready.",
    });
  };

  const handleBulkActions = () => {
    toast({
      title: "Bulk Actions",
      description: "Opening bulk user management panel...",
    });
  };

  const handleSecurityReview = () => {
    toast({
      title: "Security Review",
      description: "Initiating comprehensive security audit...",
    });
  };

  const handleApproveVendor = (vendorId: number) => {
    toast({
      title: "Vendor Approved",
      description: `Vendor Store ${vendorId} has been approved successfully.`,
    });
  };

  const handleRejectVendor = (vendorId: number) => {
    toast({
      title: "Vendor Rejected",
      description: `Vendor Store ${vendorId} application has been rejected.`,
      variant: "destructive",
    });
  };

  const handleExportVendorData = () => {
    toast({
      title: "Export Started",
      description: "Vendor data export is being prepared...",
    });
  };

  const handlePerformanceReport = () => {
    toast({
      title: "Report Generated",
      description: "Vendor performance report is being compiled...",
    });
  };

  const handleReviewDispute = (disputeId: number) => {
    toast({
      title: "Dispute Review",
      description: `Opening dispute #ORD00${disputeId}23 for review...`,
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Dispute analytics report is being compiled...",
    });
  };

  const handleUpdatePlatformFee = () => {
    toast({
      title: "Platform Fee Updated",
      description: `Platform fee has been updated to ${platformFee}%`,
    });
  };

  const handleUpdateVendorBond = () => {
    toast({
      title: "Vendor Bond Updated",
      description: `Vendor bond has been updated to $${vendorBond}`,
    });
  };

  const handleUpdateDisputeDays = () => {
    toast({
      title: "Dispute Settings Updated",
      description: `Max dispute days has been updated to ${maxDisputeDays} days`,
    });
  };

  const handleToggleMaintenance = () => {
    setMaintenanceMode(!maintenanceMode);
    toast({
      title: maintenanceMode ? "Maintenance Mode Disabled" : "Maintenance Mode Enabled",
      description: maintenanceMode 
        ? "Platform is now accessible to all users" 
        : "Platform is now in maintenance mode",
      variant: maintenanceMode ? "default" : "destructive",
    });
  };

  const handleConfigureFraud = () => {
    toast({
      title: "Fraud Detection",
      description: "Opening fraud detection configuration...",
    });
  };

  const handleBackupNow = () => {
    toast({
      title: "Backup Started",
      description: "Manual backup has been initiated...",
    });
  };

  const handleUpdateAIModel = () => {
    toast({
      title: "AI Model Updated",
      description: `Primary AI model has been updated to ${aiModel}`,
    });
  };

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

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, user_type, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadVendors = async () => {
    setLoadingVendors(true);
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('id, vendor_id, store_name, description, trust_score, is_verified, created_at, is_banned, ban_reason')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      });
    } finally {
      setLoadingVendors(false);
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

        {/* Management Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer" onClick={() => { setUserManagementOpen(true); loadUsers(); }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Manage all platform users, ban/unban accounts, and view user activity
              </p>
              <Button className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer" onClick={() => { setVendorManagementOpen(true); loadVendors(); }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Vendor Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Approve/reject vendor applications, manage vendor profiles and settings
              </p>
              <Button className="w-full">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Manage Vendors
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer" onClick={() => setCategoriesManagementOpen(true)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Create, edit, and manage product categories and subcategories
              </p>
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer" onClick={() => setTranslationsManagementOpen(true)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-primary" />
                Translations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Manage multi-language translations and localization settings
              </p>
              <Button className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                Manage Translations
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer" onClick={() => setOrdersManagementOpen(true)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                View and manage all platform orders, refunds, and transactions
              </p>
              <Button className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Manage Orders
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer" onClick={() => setDisputesManagementOpen(true)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Disputes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Resolve disputes, mediate between buyers and vendors
              </p>
              <Button className="w-full">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Manage Disputes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-background">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Shield className="h-4 w-4" />
              Security
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
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/orders'}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Recent Orders
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                      // Switch to vendors tab
                      const vendorsTab = document.querySelector('[data-value="vendors"]') as HTMLElement;
                      vendorsTab?.click();
                    }}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Approve Vendors
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                      // Switch to disputes tab
                      const disputesTab = document.querySelector('[data-value="disputes"]') as HTMLElement;
                      disputesTab?.click();
                    }}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Review Disputes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage platform users and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* User Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Total Users</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{metrics?.total_users || 0}</div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Active Today</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">247</div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">New This Week</span>
                      </div>
                      <div className="text-2xl font-bold text-amber-600">89</div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Banned Users</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">12</div>
                    </div>
                  </div>

                  {/* User Actions */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button size="sm" className="flex items-center gap-2" onClick={handleExportUsers}>
                      <Download className="h-4 w-4" />
                      Export Users
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleBulkActions}>
                      <UserCheck className="h-4 w-4" />
                      Bulk Actions
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleSecurityReview}>
                      <Shield className="h-4 w-4" />
                      Security Review
                    </Button>
                  </div>

                  {/* Recent Users Table */}
                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-muted/30">
                      <h3 className="font-semibold">Recent User Activity</h3>
                    </div>
                    <div className="divide-y">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              U{i}
                            </div>
                            <div>
                              <p className="font-medium">User {i}23{i}</p>
                              <p className="text-sm text-muted-foreground">user{i}23{i}@example.com</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={i % 2 === 0 ? "default" : "secondary"}>
                              {i % 2 === 0 ? "Buyer" : "Vendor"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{i} min ago</span>
                            <Button variant="ghost" size="sm" onClick={() => {
                              toast({
                                title: "User Profile",
                                description: `Opening profile for User ${i}23${i}...`,
                              });
                            }}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Vendor Management
                </CardTitle>
                <CardDescription>Review and approve vendor applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Vendor Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium">Active Vendors</span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-600">{metrics?.total_vendors || 0}</div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">Pending Review</span>
                      </div>
                      <div className="text-2xl font-bold text-amber-600">{metrics?.pending_verifications || 0}</div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Top Performers</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">24</div>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Flagged</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">3</div>
                    </div>
                  </div>

                  {/* Vendor Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" className="flex items-center gap-2" onClick={() => {
                      toast({
                        title: "Approving All Vendors",
                        description: "Processing all pending vendor applications...",
                      });
                    }}>
                      <UserCheck className="h-4 w-4" />
                      Approve All Pending
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleExportVendorData}>
                      <Download className="h-4 w-4" />
                      Export Vendor Data
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handlePerformanceReport}>
                      <BarChart3 className="h-4 w-4" />
                      Performance Report
                    </Button>
                  </div>

                  {/* Pending Verifications */}
                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-muted/30">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Pending Vendor Verifications
                      </h3>
                    </div>
                    <div className="divide-y">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                V{i}
                              </div>
                              <div>
                                <p className="font-medium">Vendor Store {i}</p>
                                <p className="text-sm text-muted-foreground">Electronics & Gadgets</p>
                                <p className="text-xs text-muted-foreground">Applied {i} days ago</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-amber-600">Pending Review</Badge>
                              <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => handleApproveVendor(i)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleRejectVendor(i)}>
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Dispute Resolution
                </CardTitle>
                <CardDescription>Manage order disputes and resolutions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Dispute Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Open Disputes</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">{metrics?.pending_disputes || 0}</div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">Escalated</span>
                      </div>
                      <div className="text-2xl font-bold text-amber-600">7</div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Resolved Today</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">15</div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Avg Resolution</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">2.3d</div>
                    </div>
                  </div>

                  {/* Dispute Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" className="flex items-center gap-2" onClick={() => {
                      toast({
                        title: "High Priority Review",
                        description: "Filtering high priority disputes for immediate attention...",
                      });
                    }}>
                      <AlertTriangle className="h-4 w-4" />
                      Review High Priority
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleGenerateReport}>
                      <Download className="h-4 w-4" />
                      Generate Report
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => {
                      toast({
                        title: "Dispute Settings",
                        description: "Opening dispute configuration panel...",
                      });
                    }}>
                      <Settings className="h-4 w-4" />
                      Dispute Settings
                    </Button>
                  </div>

                  {/* Active Disputes */}
                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-muted/30">
                      <h3 className="font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Active Disputes Requiring Attention
                      </h3>
                    </div>
                    <div className="divide-y">
                      {[
                        { id: 1, title: "Product not as described", priority: "High", time: "2h", amount: "0.003 BTC" },
                        { id: 2, title: "Item never received", priority: "Medium", time: "1d", amount: "0.001 BTC" },
                        { id: 3, title: "Quality issues", priority: "Low", time: "3d", amount: "0.002 BTC" }
                      ].map((dispute) => (
                        <div key={dispute.id} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`h-3 w-3 rounded-full ${
                                dispute.priority === 'High' ? 'bg-red-500' : 
                                dispute.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                              }`} />
                              <div>
                                <p className="font-medium">{dispute.title}</p>
                                <p className="text-sm text-muted-foreground">Order #ORD00{dispute.id}23 • {dispute.amount}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={
                                dispute.priority === 'High' ? 'destructive' : 
                                dispute.priority === 'Medium' ? 'default' : 'secondary'
                              }>
                                {dispute.priority}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{dispute.time} ago</span>
                              <Button size="sm" variant="outline" onClick={() => handleReviewDispute(dispute.id)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Platform Configuration
                  </CardTitle>
                  <CardDescription>Core platform settings and parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Platform Fee (%)</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        className="flex-1" 
                        value={platformFee} 
                        onChange={(e) => setPlatformFee(e.target.value)}
                        type="number"
                        step="0.1"
                      />
                      <Button size="sm" variant="outline" onClick={handleUpdatePlatformFee}>Update</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vendor Bond (USD)</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        className="flex-1" 
                        value={vendorBond} 
                        onChange={(e) => setVendorBond(e.target.value)}
                        type="number"
                        step="0.01"
                      />
                      <Button size="sm" variant="outline" onClick={handleUpdateVendorBond}>Update</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Dispute Days</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        className="flex-1" 
                        value={maxDisputeDays} 
                        onChange={(e) => setMaxDisputeDays(e.target.value)}
                        type="number"
                      />
                      <Button size="sm" variant="outline" onClick={handleUpdateDisputeDays}>Update</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">Temporarily disable the platform</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleToggleMaintenance}
                      className={maintenanceMode ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
                    >
                      {maintenanceMode ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security & Compliance
                  </CardTitle>
                  <CardDescription>Security policies and monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-300">Two-Factor Authentication</p>
                      <p className="text-sm text-green-600 dark:text-green-400">Required for all admin accounts</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-700 dark:text-blue-300">Rate Limiting</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">API and login attempt protection</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <div>
                      <p className="font-medium text-amber-700 dark:text-amber-300">Fraud Detection</p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">Automated suspicious activity monitoring</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleConfigureFraud}>Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div>
                      <p className="font-medium text-purple-700 dark:text-purple-300">Backup System</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Last backup: 2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleBackupNow}>
                      <Database className="h-4 w-4 mr-1" />
                      Backup Now
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Model Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Model Configuration
                  </CardTitle>
                  <CardDescription>Manage AI models and optimization settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary AI Model</label>
                    <div className="flex items-center gap-2">
                      <select 
                        className="flex-1 px-3 py-2 border rounded-md bg-background"
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                      >
                        <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                        <option value="gpt-4o">GPT-4o (Balanced)</option>
                        <option value="claude-3-haiku">Claude 3 Haiku</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={handleUpdateAIModel}>Update</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Auto-optimization</label>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">Product Descriptions</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">AI-enhanced product listings</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Zap className="h-4 w-4 mr-1" />
                        Enabled
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div>
                        <p className="font-medium text-purple-700 dark:text-purple-300">Search Intelligence</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">Smart search suggestions and trends</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <BarChart2 className="h-4 w-4 mr-1" />
                        Active
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <div>
                        <p className="font-medium text-amber-700 dark:text-amber-300">Model Evolution</p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">Automatic model improvement</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Cpu className="h-4 w-4 mr-1" />
                        Running
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Logs */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent System Events
                  </CardTitle>
                  <CardDescription>Platform activity and security events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: "security", message: "Failed login attempt from IP 192.168.1.100", time: "2 min ago", level: "warning" },
                      { type: "system", message: "Database backup completed successfully", time: "15 min ago", level: "success" },
                      { type: "admin", message: "Vendor application approved by admin", time: "1 hour ago", level: "info" },
                      { type: "security", message: "New admin account created", time: "2 hours ago", level: "info" },
                      { type: "system", message: "Platform maintenance completed", time: "1 day ago", level: "success" }
                    ].map((log, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <div className={`h-2 w-2 rounded-full ${
                          log.level === 'warning' ? 'bg-amber-500' :
                          log.level === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm">{log.message}</p>
                          <p className="text-xs text-muted-foreground">{log.time}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {log.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        {/* User and Vendor Management Dialogs */}
        <UserManagementDialog 
          user={users.find(u => u.id === selectedUserId) || null}
          open={userManagementDialogOpen}
          onOpenChange={setUserManagementDialogOpen}
          onUserUpdated={loadUsers}
        />
        
        <VendorManagementDialog 
          vendor={vendors.find(v => v.id === selectedVendorId) || null}
          open={vendorManagementDialogOpen}
          onOpenChange={setVendorManagementDialogOpen}
          onVendorUpdated={loadVendors}
        />

        {/* Management Dialogs */}
        <CategoryManagement
          open={categoriesManagementOpen}
          onClose={() => setCategoriesManagementOpen(false)}
        />
        
        <TranslationManagement
          open={translationsManagementOpen}
          onClose={() => setTranslationsManagementOpen(false)}
        />
      </div>
    </div>
  );
}