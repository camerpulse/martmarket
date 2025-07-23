import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  MessageSquare,
  Star,
  Globe,
  Server,
  Zap,
  Database,
  Cpu,
  Brain,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronRight,
  Mail,
  Bell,
  Lock,
  Key,
  Wallet,
  ShoppingCart,
  Package,
  CreditCard,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  Info,
  Home,
  Layers,
  Building2,
  FileImage,
  Languages,
  Palette,
  Monitor,
  HardDrive,
  Network,
  Smartphone,
  Tablet,
  Code,
  LineChart,
  PieChart,
  BarChart,
  Bookmark,
  Tag,
  Image,
  Video,
  Music,
  File,
  Folder,
  Archive,
  Clipboard,
  Link as LinkIcon,
  Repeat,
  Share2,
  Forward,
  Reply,
  Send,
  Inbox,
  Trash,
  HeartHandshake,
  Scale,
  Gavel,
  ScrollText,
  Award,
  Target,
  Zap as Lightning,
  Timer,
  Hourglass,
  Gauge,
  Thermometer,
  Battery,
  Wifi,
  Bluetooth,
  Radio,
  Satellite,
  Router,
  Cloud as CloudIcon,
  HardDrive as HardDriveIcon,
  Usb,
  Printer,
  Webcam,
  Speaker,
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  Shuffle,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Maximize,
  Minimize,
  Move,
  Copy,
  Scissors,
  PaintBucket,
  Brush,
  Pen,
  Pencil,
  Eraser,
  Ruler,
  Grid3X3,
  Layout,
  Sidebar,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Columns,
  Rows,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Heart,
  Infinity,
  Hash,
  AtSign,
  Percent,
  Equal,
  MoreHorizontal,
  MoreVertical
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ComprehensiveUserManagement } from '@/components/admin/ComprehensiveUserManagement';
import { ProductManagement } from '@/components/admin/ProductManagement';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { ComprehensiveOrderManagement } from '@/components/admin/ComprehensiveOrderManagement';
import { ComprehensiveDisputeManagement } from '@/components/admin/ComprehensiveDisputeManagement';
import { ComprehensiveSecurityManagement } from '@/components/admin/ComprehensiveSecurityManagement';
import { ComprehensiveAIManagement } from '@/components/admin/ComprehensiveAIManagement';
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

interface SystemHealth {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  response_time: number;
  uptime: number;
}

interface AdminProfile {
  admin_role: string;
  is_active: boolean;
  permissions: any;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  color = "default",
  trend,
  onClick
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  change?: string;
  color?: "default" | "success" | "warning" | "destructive";
  trend?: number;
  onClick?: () => void;
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
    <Card 
      className={`hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group border-l-4 border-l-primary/20 hover:border-l-primary ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={`p-2.5 rounded-xl ${bgClasses[color]} transition-all duration-300 group-hover:scale-110`}>
          <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          {value}
        </div>
        {change && (
          <div className="flex items-center space-x-2">
            <p className={`text-xs font-medium ${colorClasses[color]}`}>
              {change}
            </p>
            {trend && (
              <div className="flex-1">
                <Progress value={Math.abs(trend)} className="h-1.5" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const QuickActionCard = ({ title, description, icon: Icon, onClick, badge }: {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
  badge?: string;
}) => (
  <Card 
    className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group border hover:border-primary/50"
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Icon className="h-6 w-6" />
        </div>
        {badge && (
          <Badge variant="destructive" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('admin_profiles')
        .select('admin_role, is_active, permissions')
        .eq('user_id', user?.id)
        .single();

      if (adminError || !adminData?.is_active) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        return;
      }

      setAdminProfile(adminData);
      await Promise.all([
        loadDashboardMetrics(),
        loadSystemHealth(),
        loadNotifications(),
        loadRecentActivities()
      ]);
    } catch (error) {
      console.error('Error checking admin access:', error);
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
    }
  };

  const loadSystemHealth = async () => {
    // Mock system health data - in real implementation, this would come from monitoring tools
    setSystemHealth({
      cpu_usage: Math.floor(Math.random() * 30) + 20,
      memory_usage: Math.floor(Math.random() * 40) + 30,
      disk_usage: Math.floor(Math.random() * 20) + 40,
      active_connections: Math.floor(Math.random() * 500) + 100,
      response_time: Math.floor(Math.random() * 50) + 50,
      uptime: 99.9
    });
  };

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('category', 'admin')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*, admin_profiles!inner()')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      loadDashboardMetrics(),
      loadSystemHealth(),
      loadNotifications(),
      loadRecentActivities()
    ]);
    setLoading(false);
    toast({
      title: "Success",
      description: "Dashboard data refreshed",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="text-xl font-semibold">Loading Admin Dashboard...</div>
          <div className="text-muted-foreground">Initializing management interface</div>
        </div>
      </div>
    );
  }

  if (!adminProfile?.is_active) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-3">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8 p-6 bg-card rounded-2xl border shadow-lg">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Admin Control Center
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Complete platform management and oversight
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <Shield className="h-4 w-4 mr-2" />
              {adminProfile?.admin_role?.replace('_', ' ').toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveSection('system')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-8">
          <TabsList className="grid w-full grid-cols-10 h-12 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-background rounded-lg">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-background rounded-lg">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-background rounded-lg">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-background rounded-lg">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="disputes" className="data-[state=active]:bg-background rounded-lg">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Disputes
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-background rounded-lg">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-background rounded-lg">
              <Brain className="h-4 w-4 mr-2" />
              AI
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-background rounded-lg">
              <FileText className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-background rounded-lg">
              <Server className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-background rounded-lg">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Key Metrics */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={metrics.total_users.toLocaleString()}
                  icon={Users}
                  change="+12% this month"
                  color="success"
                  trend={12}
                  onClick={() => setActiveSection('users')}
                />
                <StatCard
                  title="Active Vendors"
                  value={metrics.total_vendors.toLocaleString()}
                  icon={ShoppingBag}
                  change="+8% this month"
                  color="success"
                  trend={8}
                  onClick={() => setActiveSection('users')}
                />
                <StatCard
                  title="Total Products"
                  value={metrics.total_products.toLocaleString()}
                  icon={Package}
                  change="+15% this month"
                  color="success"
                  trend={15}
                  onClick={() => setActiveSection('products')}
                />
                <StatCard
                  title="Platform Revenue"
                  value={`${metrics.platform_revenue_btc.toFixed(8)} BTC`}
                  icon={DollarSign}
                  change="+25% this month"
                  color="success"
                  trend={25}
                  onClick={() => setActiveSection('analytics')}
                />
                <StatCard
                  title="Total Orders"
                  value={metrics.total_orders.toLocaleString()}
                  icon={ShoppingCart}
                  change="+18% this month"
                  color="success"
                  trend={18}
                  onClick={() => setActiveSection('orders')}
                />
                <StatCard
                  title="Pending Disputes"
                  value={metrics.pending_disputes}
                  icon={AlertTriangle}
                  change={metrics.pending_disputes > 10 ? "High volume" : "Normal"}
                  color={metrics.pending_disputes > 10 ? "warning" : "default"}
                  onClick={() => setActiveSection('disputes')}
                />
                <StatCard
                  title="Total Reviews"
                  value={metrics.total_reviews.toLocaleString()}
                  icon={Star}
                  change="+22% this month"
                  color="success"
                  trend={22}
                />
                <StatCard
                  title="Pending Verifications"
                  value={metrics.pending_verifications}
                  icon={UserCheck}
                  change={metrics.pending_verifications > 5 ? "Needs attention" : "Normal"}
                  color={metrics.pending_verifications > 5 ? "warning" : "default"}
                  onClick={() => setActiveSection('users')}
                />
              </div>
            )}

            {/* System Health */}
            {systemHealth && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CPU Usage</span>
                        <span>{systemHealth.cpu_usage}%</span>
                      </div>
                      <Progress value={systemHealth.cpu_usage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Memory</span>
                        <span>{systemHealth.memory_usage}%</span>
                      </div>
                      <Progress value={systemHealth.memory_usage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Disk Usage</span>
                        <span>{systemHealth.disk_usage}%</span>
                      </div>
                      <Progress value={systemHealth.disk_usage} className="h-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{systemHealth.active_connections}</div>
                      <div className="text-sm text-muted-foreground">Active Connections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{systemHealth.response_time}ms</div>
                      <div className="text-sm text-muted-foreground">Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{systemHealth.uptime}%</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightning className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common administrative tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <QuickActionCard
                    title="Review Disputes"
                    description="Handle pending customer disputes"
                    icon={AlertTriangle}
                    onClick={() => setActiveSection('disputes')}
                    badge={metrics?.pending_disputes > 0 ? metrics.pending_disputes.toString() : undefined}
                  />
                  <QuickActionCard
                    title="Approve Vendors"
                    description="Review vendor applications"
                    icon={UserCheck}
                    onClick={() => setActiveSection('users')}
                    badge={metrics?.pending_verifications > 0 ? metrics.pending_verifications.toString() : undefined}
                  />
                  <QuickActionCard
                    title="Moderate Content"
                    description="Review flagged content"
                    icon={Shield}
                    onClick={() => setActiveSection('content')}
                  />
                  <QuickActionCard
                    title="System Health"
                    description="Monitor system performance"
                    icon={Activity}
                    onClick={() => setActiveSection('system')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Admin Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {activities.length > 0 ? activities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-muted-foreground text-center py-8">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Admin Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((notification, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-muted-foreground text-center py-8">No notifications</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <ComprehensiveUserManagement />
          </TabsContent>

          {/* Products Management */}
          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          {/* Orders Management */}
          <TabsContent value="orders">
            <ComprehensiveOrderManagement />
          </TabsContent>

          {/* Disputes Management */}
          <TabsContent value="disputes">
            <ComprehensiveDisputeManagement />
          </TabsContent>

          {/* Security Management */}
          <TabsContent value="security">
            <ComprehensiveSecurityManagement />
          </TabsContent>

          {/* AI Management */}
          <TabsContent value="ai">
            <ComprehensiveAIManagement />
          </TabsContent>

          {/* Content Management */}
          <TabsContent value="content">
            <div className="grid gap-6">
              <CategoryManagement />
              <TranslationManagement />
            </div>
          </TabsContent>

          {/* System Management */}
          <TabsContent value="system">
            <SystemSettings />
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Platform Analytics
                </CardTitle>
                <CardDescription>
                  Comprehensive platform performance metrics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Advanced analytics features coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}