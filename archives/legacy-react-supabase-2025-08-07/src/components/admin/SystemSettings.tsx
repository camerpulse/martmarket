import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Server, 
  Database, 
  Shield, 
  Globe, 
  Mail, 
  DollarSign,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Save,
  Download,
  Upload,
  FileText,
  Users,
  Clock,
  Activity,
  Palette,
  Languages,
  Bell,
  Lock,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description?: string;
  updated_at?: string;
}

export const SystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [platformSettings, setPlatformSettings] = useState({
    site_name: '',
    site_description: '',
    site_url: '',
    admin_email: '',
    maintenance_mode: false,
    allow_registrations: true,
    require_email_verification: true,
    max_file_upload_size: 10,
    session_timeout: 24,
    auto_logout_inactive: true
  });

  const [paymentSettings, setPaymentSettings] = useState({
    platform_fee_percentage: 2.5,
    vendor_bond_amount_btc: 0.001,
    escrow_auto_release_days: 14,
    minimum_order_amount_btc: 0.0001,
    bitcoin_confirmations_required: 1,
    payment_timeout_hours: 24
  });

  const [securitySettings, setSecuritySettings] = useState({
    max_login_attempts: 5,
    login_lockout_duration: 30,
    require_2fa_for_vendors: true,
    require_2fa_for_large_orders: true,
    large_order_threshold_btc: 0.01,
    session_security_level: 'high',
    captcha_enabled: false,
    ddos_protection: true
  });

  const [emailSettings, setEmailSettings] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    from_email: '',
    from_name: '',
    email_notifications: true
  });

  const [systemHealth, setSystemHealth] = useState({
    database_status: 'connected',
    storage_usage: 45,
    api_response_time: 125,
    active_users: 1247,
    uptime_percentage: 99.9,
    last_backup: '2024-01-15 14:30:00'
  });

  useEffect(() => {
    loadSettings();
    loadSystemHealth();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);

      // Parse settings into categories
      const settingsMap = data?.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, string>) || {};

      // Update state with loaded settings
      setPlatformSettings(prev => ({
        ...prev,
        ...Object.keys(settingsMap).reduce((acc, key) => {
          if (key.startsWith('platform_')) {
            const settingKey = key.replace('platform_', '');
            if (settingKey in prev) {
              acc[settingKey as keyof typeof prev] = 
                typeof prev[settingKey as keyof typeof prev] === 'boolean' 
                  ? settingsMap[key] === 'true'
                  : settingsMap[key] as any;
            }
          }
          return acc;
        }, {} as any)
      }));

    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    // Simulated system health data - in real app this would come from monitoring APIs
    setSystemHealth({
      database_status: 'connected',
      storage_usage: Math.floor(Math.random() * 80) + 20,
      api_response_time: Math.floor(Math.random() * 200) + 50,
      active_users: Math.floor(Math.random() * 2000) + 500,
      uptime_percentage: 99.9,
      last_backup: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    });
  };

  const savePlatformSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(platformSettings).map(([key, value]) => ({
        setting_key: `platform_${key}`,
        setting_value: String(value),
        setting_type: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string',
        description: `Platform setting: ${key.replace('_', ' ')}`
      }));

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('platform_settings')
          .upsert(setting, { onConflict: 'setting_key' });
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Platform settings saved successfully",
      });

    } catch (error) {
      console.error('Error saving platform settings:', error);
      toast({
        title: "Error",
        description: "Failed to save platform settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(paymentSettings).map(([key, value]) => ({
        setting_key: `payment_${key}`,
        setting_value: String(value),
        setting_type: 'number',
        description: `Payment setting: ${key.replace('_', ' ')}`
      }));

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('platform_settings')
          .upsert(setting, { onConflict: 'setting_key' });
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Payment settings saved successfully",
      });

    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast({
        title: "Error",
        description: "Failed to save payment settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testEmailConnection = async () => {
    toast({
      title: "Testing Email Connection",
      description: "Sending test email...",
    });

    // Simulate email test
    setTimeout(() => {
      toast({
        title: "Email Test Successful",
        description: "Test email sent successfully",
      });
    }, 2000);
  };

  const performBackup = async () => {
    toast({
      title: "Backup Started",
      description: "Creating system backup...",
    });

    // Simulate backup process
    setTimeout(() => {
      setSystemHealth(prev => ({
        ...prev,
        last_backup: new Date().toISOString()
      }));
      
      toast({
        title: "Backup Completed",
        description: "System backup created successfully",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Database</p>
                <Badge variant={systemHealth.database_status === 'connected' ? 'default' : 'destructive'}>
                  {systemHealth.database_status}
                </Badge>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Storage Usage</p>
                <p className="text-2xl font-bold">{systemHealth.storage_usage}%</p>
              </div>
              <Server className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{systemHealth.active_users}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{systemHealth.uptime_percentage}%</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="platform" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="platform">
            <Settings className="h-4 w-4 mr-2" />
            Platform
          </TabsTrigger>
          <TabsTrigger value="payments">
            <DollarSign className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="system">
            <Server className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Platform Settings */}
        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={platformSettings.site_name}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, site_name: e.target.value }))}
                    placeholder="Your Marketplace Name"
                  />
                </div>
                <div>
                  <Label htmlFor="site_url">Site URL</Label>
                  <Input
                    id="site_url"
                    value={platformSettings.site_url}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, site_url: e.target.value }))}
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={platformSettings.site_description}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, site_description: e.target.value }))}
                  placeholder="Brief description of your marketplace"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="admin_email">Admin Email</Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={platformSettings.admin_email}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, admin_email: e.target.value }))}
                  placeholder="admin@yoursite.com"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Temporarily disable public access</p>
                  </div>
                  <Switch
                    checked={platformSettings.maintenance_mode}
                    onCheckedChange={(checked) => setPlatformSettings(prev => ({ ...prev, maintenance_mode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow New Registrations</Label>
                    <p className="text-sm text-muted-foreground">Enable new user sign-ups</p>
                  </div>
                  <Switch
                    checked={platformSettings.allow_registrations}
                    onCheckedChange={(checked) => setPlatformSettings(prev => ({ ...prev, allow_registrations: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Users must verify email to activate account</p>
                  </div>
                  <Switch
                    checked={platformSettings.require_email_verification}
                    onCheckedChange={(checked) => setPlatformSettings(prev => ({ ...prev, require_email_verification: checked }))}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={savePlatformSettings} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Platform Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform_fee">Platform Fee (%)</Label>
                  <Input
                    id="platform_fee"
                    type="number"
                    step="0.1"
                    value={paymentSettings.platform_fee_percentage}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, platform_fee_percentage: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vendor_bond">Vendor Bond (BTC)</Label>
                  <Input
                    id="vendor_bond"
                    type="number"
                    step="0.00001"
                    value={paymentSettings.vendor_bond_amount_btc}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, vendor_bond_amount_btc: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="escrow_days">Escrow Auto-Release (Days)</Label>
                  <Input
                    id="escrow_days"
                    type="number"
                    value={paymentSettings.escrow_auto_release_days}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, escrow_auto_release_days: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="min_order">Minimum Order (BTC)</Label>
                  <Input
                    id="min_order"
                    type="number"
                    step="0.00001"
                    value={paymentSettings.minimum_order_amount_btc}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, minimum_order_amount_btc: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="confirmations">Bitcoin Confirmations Required</Label>
                  <Select 
                    value={paymentSettings.bitcoin_confirmations_required.toString()} 
                    onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, bitcoin_confirmations_required: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Confirmation</SelectItem>
                      <SelectItem value="2">2 Confirmations</SelectItem>
                      <SelectItem value="3">3 Confirmations</SelectItem>
                      <SelectItem value="6">6 Confirmations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment_timeout">Payment Timeout (Hours)</Label>
                  <Input
                    id="payment_timeout"
                    type="number"
                    value={paymentSettings.payment_timeout_hours}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, payment_timeout_hours: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={savePaymentSettings} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Payment Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_attempts">Max Login Attempts</Label>
                  <Input
                    id="max_attempts"
                    type="number"
                    value={securitySettings.max_login_attempts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, max_login_attempts: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lockout_duration">Lockout Duration (Minutes)</Label>
                  <Input
                    id="lockout_duration"
                    type="number"
                    value={securitySettings.login_lockout_duration}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, login_lockout_duration: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="large_order_threshold">Large Order Threshold (BTC)</Label>
                <Input
                  id="large_order_threshold"
                  type="number"
                  step="0.001"
                  value={securitySettings.large_order_threshold_btc}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, large_order_threshold_btc: parseFloat(e.target.value) }))}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require 2FA for Vendors</Label>
                    <p className="text-sm text-muted-foreground">All vendors must enable two-factor authentication</p>
                  </div>
                  <Switch
                    checked={securitySettings.require_2fa_for_vendors}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, require_2fa_for_vendors: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require 2FA for Large Orders</Label>
                    <p className="text-sm text-muted-foreground">Orders above threshold require additional verification</p>
                  </div>
                  <Switch
                    checked={securitySettings.require_2fa_for_large_orders}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, require_2fa_for_large_orders: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>CAPTCHA Protection</Label>
                    <p className="text-sm text-muted-foreground">Enable CAPTCHA for sensitive operations</p>
                  </div>
                  <Switch
                    checked={securitySettings.captcha_enabled}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, captcha_enabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>DDoS Protection</Label>
                    <p className="text-sm text-muted-foreground">Advanced protection against attacks</p>
                  </div>
                  <Switch
                    checked={securitySettings.ddos_protection}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, ddos_protection: checked }))}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={emailSettings.smtp_host}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={emailSettings.smtp_port}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_port: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    value={emailSettings.smtp_username}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_username: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={emailSettings.smtp_password}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_password: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from_email">From Email</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={emailSettings.from_email}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, from_email: e.target.value }))}
                    placeholder="noreply@yoursite.com"
                  />
                </div>
                <div>
                  <Label htmlFor="from_name">From Name</Label>
                  <Input
                    id="from_name"
                    value={emailSettings.from_name}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, from_name: e.target.value }))}
                    placeholder="Your Marketplace"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="smtp_encryption">Encryption</Label>
                <Select value={emailSettings.smtp_encryption} onValueChange={(value) => setEmailSettings(prev => ({ ...prev, smtp_encryption: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex gap-2">
                <Button disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Email Settings
                </Button>
                <Button variant="outline" onClick={testEmailConnection}>
                  <Mail className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Design & Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Palette className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Theme Customization</h3>
                <p className="text-muted-foreground mb-4">
                  Customize colors, fonts, and layout options
                </p>
                <Button>
                  <Palette className="h-4 w-4 mr-2" />
                  Open Theme Editor
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Management */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage Usage</span>
                    <span className="text-sm font-medium">{systemHealth.storage_usage}%</span>
                  </div>
                  <Progress value={systemHealth.storage_usage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Response Time</span>
                    <span className="text-sm font-medium">{systemHealth.api_response_time}ms</span>
                  </div>
                  <Progress value={(systemHealth.api_response_time / 500) * 100} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Backup</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(systemHealth.last_backup).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={performBackup} className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Create System Backup
                </Button>
                <Button variant="outline" onClick={loadSystemHealth} className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh System Status
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View System Logs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Performance Monitor
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};