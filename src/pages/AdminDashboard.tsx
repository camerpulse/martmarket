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
  Palette
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

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

// Comprehensive admin sections
const ADMIN_SECTIONS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: BarChart3,
    description: 'Overview and analytics'
  },
  {
    id: 'users',
    title: 'Users & Profiles',
    icon: Users,
    description: 'Manage all user accounts'
  },
  {
    id: 'vendors',
    title: 'Vendors & Stores',
    icon: ShoppingBag,
    description: 'Vendor applications and management'
  },
  {
    id: 'products',
    title: 'Products & Catalog',
    icon: Package,
    description: 'Product listings and categories'
  },
  {
    id: 'orders',
    title: 'Orders & Payments',
    icon: ShoppingCart,
    description: 'Transaction management'
  },
  {
    id: 'disputes',
    title: 'Disputes & Support',
    icon: AlertTriangle,
    description: 'Customer support and disputes'
  },
  {
    id: 'reviews',
    title: 'Reviews & Ratings',
    icon: Star,
    description: 'Review management and moderation'
  },
  {
    id: 'messages',
    title: 'Messages & Communications',
    icon: MessageSquare,
    description: 'Platform messaging system'
  },
  {
    id: 'forum',
    title: 'Forum & Community',
    icon: Users,
    description: 'Forum categories and posts'
  },
  {
    id: 'security',
    title: 'Security & Monitoring',
    icon: Shield,
    description: 'Security logs and monitoring'
  },
  {
    id: 'payments',
    title: 'Bitcoin & Payments',
    icon: Wallet,
    description: 'Payment processing and Bitcoin'
  },
  {
    id: 'content',
    title: 'Content & Media',
    icon: FileImage,
    description: 'Site content and media management'
  },
  {
    id: 'translations',
    title: 'Languages & Translations',
    icon: Languages,
    description: 'Multi-language content'
  },
  {
    id: 'ai',
    title: 'AI & Automation',
    icon: Brain,
    description: 'AI features and automation'
  },
  {
    id: 'system',
    title: 'System & Infrastructure',
    icon: Server,
    description: 'System health and settings'
  },
  {
    id: 'design',
    title: 'Design & Appearance',
    icon: Palette,
    description: 'Site design and branding'
  }
];

const StatCard = ({ 
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
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group border-l-4 border-l-primary/20 hover:border-l-primary">
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

const AdminSectionCard = ({ section, onClick }: { section: typeof ADMIN_SECTIONS[0], onClick: () => void }) => (
  <Card 
    className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group border hover:border-primary/50"
    onClick={onClick}
  >
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <section.icon className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {section.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {section.description}
            </CardDescription>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </CardHeader>
  </Card>
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>({});

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('admin_profiles')
        .select('admin_role, is_active')
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
      loadDashboardMetrics();
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
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, admin_profiles(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error) setUsers(data || []);
  };

  const loadVendors = async () => {
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error) setVendors(data || []);
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), profiles!products_vendor_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error) setProducts(data || []);
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(*), profiles!orders_buyer_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error) setOrders(data || []);
  };

  const loadDisputes = async () => {
    const { data, error } = await supabase
      .from('disputes')
      .select('*, orders(*), profiles!disputes_buyer_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error) setDisputes(data || []);
  };

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, orders(*), products(*), profiles!reviews_reviewer_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error) setReviews(data || []);
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

  const filteredSections = ADMIN_SECTIONS.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Button variant="outline" size="sm" className="px-6">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-8">
          <TabsList className="grid w-full grid-cols-8 h-12 bg-muted/50 p-1 rounded-xl">
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
            <TabsTrigger value="security" className="data-[state=active]:bg-background rounded-lg">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-background rounded-lg">
              <FileText className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-background rounded-lg">
              <Server className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="more" className="data-[state=active]:bg-background rounded-lg">
              <Layers className="h-4 w-4 mr-2" />
              More
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Cards */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={metrics.total_users.toLocaleString()}
                  icon={Users}
                  change="+12% from last month"
                  color="success"
                  trend={75}
                />
                <StatCard
                  title="Active Vendors"
                  value={metrics.total_vendors.toLocaleString()}
                  icon={UserCheck}
                  change="+8% from last month"
                  color="success"
                  trend={60}
                />
                <StatCard
                  title="Total Orders"
                  value={metrics.total_orders.toLocaleString()}
                  icon={ShoppingCart}
                  change="+18% from last month"
                  color="success"
                  trend={85}
                />
                <StatCard
                  title="Platform Revenue"
                  value={`${metrics.platform_revenue_btc.toFixed(8)} BTC`}
                  icon={DollarSign}
                  change="+5.2% from last month"
                  color="success"
                  trend={45}
                />
              </div>
            )}

            {/* Quick Access Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Management Center</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search admin sections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSections.map((section) => (
                  <AdminSectionCard
                    key={section.id}
                    section={section}
                    onClick={() => setActiveSection(section.id)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Users className="h-6 w-6" />
                      User Management
                    </CardTitle>
                    <CardDescription>Manage all platform users and their permissions</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={loadUsers} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Users Table would go here */}
                  <div className="text-center py-8 text-muted-foreground">
                    Click Refresh to load users
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Management */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Package className="h-6 w-6" />
                      Product Management
                    </CardTitle>
                    <CardDescription>Manage all product listings and categories</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={loadProducts} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Click Refresh to load products
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Management */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <ShoppingCart className="h-6 w-6" />
                      Order Management
                    </CardTitle>
                    <CardDescription>Monitor and manage all platform orders</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={loadOrders} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Click Refresh to load orders
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Management */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium">System Security</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium">DDoS Protection</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium">Failed Login Attempts</span>
                      <Badge variant="destructive">23 Today</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Security Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Multiple login attempts detected</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Security scan completed</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Management */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Content Editor
                  </CardTitle>
                  <CardDescription>Edit site pages and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start h-16 flex-col">
                        <Home className="h-6 w-6 mb-2" />
                        Homepage
                      </Button>
                      <Button variant="outline" className="justify-start h-16 flex-col">
                        <Info className="h-6 w-6 mb-2" />
                        About Page
                      </Button>
                      <Button variant="outline" className="justify-start h-16 flex-col">
                        <Mail className="h-6 w-6 mb-2" />
                        Contact Page
                      </Button>
                      <Button variant="outline" className="justify-start h-16 flex-col">
                        <FileText className="h-6 w-6 mb-2" />
                        Terms & Privacy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileImage className="h-5 w-5" />
                    Media Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Images
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-2" />
                      View Gallery
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Assets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Management */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">CPU Usage</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Memory Usage</span>
                        <span className="text-sm font-medium">62%</span>
                      </div>
                      <Progress value={62} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Database</span>
                        <Badge variant="default">Connected</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Platform Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="maintenance">Maintenance Mode</Label>
                      <Switch id="maintenance" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signups">Allow New Signups</Label>
                      <Switch id="signups" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="api">API Access</Label>
                      <Switch id="api" defaultChecked />
                    </div>
                    <Separator />
                    <Button className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* More sections */}
          <TabsContent value="more" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ADMIN_SECTIONS.slice(8).map((section) => (
                <AdminSectionCard
                  key={section.id}
                  section={section}
                  onClick={() => setActiveSection(section.id)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Individual section tabs */}
          {ADMIN_SECTIONS.slice(8).map((section) => (
            <TabsContent key={section.id} value={section.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <section.icon className="h-6 w-6" />
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <section.icon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">{section.title} Management</h3>
                    <p>This section is ready for implementation.</p>
                    <Button className="mt-4">
                      Configure {section.title}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}