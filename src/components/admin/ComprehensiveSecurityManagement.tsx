import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Search, 
  RefreshCw, 
  Download, 
  Eye, 
  AlertTriangle,
  Activity,
  Lock,
  Unlock,
  Ban,
  CheckCircle,
  XCircle,
  Users,
  Globe,
  Cpu,
  Database,
  Key,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_level: string;
  threat_score: number;
  event_data: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  profiles?: {
    display_name: string;
  };
}

interface SecuritySettings {
  two_factor_required: boolean;
  session_timeout_hours: number;
  max_login_attempts: number;
  password_min_length: number;
  require_strong_passwords: boolean;
}

export const ComprehensiveSecurityManagement = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [securitySettings, setSecuritySettings] = useState<any>({
    two_factor_required: false,
    session_timeout_hours: 24,
    max_login_attempts: 5,
    password_min_length: 8,
    require_strong_passwords: true
  });

  useEffect(() => {
    loadSecurityEvents();
    loadSecuritySettings();
  }, []);

  const loadSecurityEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select(`
          *,
          profiles(display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setEvents(data as any || []);
    } catch (error) {
      console.error('Error loading security events:', error);
      toast({
        title: "Error",
        description: "Failed to load security events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSecuritySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'two_factor_required',
          'session_timeout_hours',
          'max_login_attempts',
          'password_min_length',
          'require_strong_passwords'
        ]);

      if (error) throw error;
      
      const settings = { ...securitySettings };
      data?.forEach(setting => {
        if (setting.setting_key in settings) {
          const value = setting.setting_value;
          if (setting.setting_key === 'two_factor_required' || setting.setting_key === 'require_strong_passwords') {
            settings[setting.setting_key as keyof SecuritySettings] = value === 'true';
          } else {
            settings[setting.setting_key as keyof SecuritySettings] = parseInt(value) as any;
          }
        }
      });
      setSecuritySettings(settings);
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const updateSecuritySetting = async (key: string, value: string | boolean | number) => {
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          setting_key: key,
          setting_value: value.toString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Security setting updated successfully",
      });
    } catch (error) {
      console.error('Error updating security setting:', error);
      toast({
        title: "Error",
        description: "Failed to update security setting",
        variant: "destructive",
      });
    }
  };

  const banUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('user_bans')
        .insert({
          user_id: userId,
          banned_by: (await supabase.auth.getUser()).data.user?.id,
          ban_reason: reason,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User banned successfully",
      });

      loadSecurityEvents();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.ip_address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = levelFilter === 'all' || event.event_level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      info: { variant: 'secondary' as const, icon: CheckCircle },
      warning: { variant: 'secondary' as const, icon: AlertTriangle },
      critical: { variant: 'destructive' as const, icon: XCircle },
      high: { variant: 'destructive' as const, icon: AlertTriangle }
    };

    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.info;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {level.toUpperCase()}
      </Badge>
    );
  };

  const getThreatScoreBadge = (score: number) => {
    let variant: 'secondary' | 'destructive' | 'default' = 'secondary';
    let color = 'text-green-600';
    
    if (score >= 7) {
      variant = 'destructive';
      color = 'text-red-600';
    } else if (score >= 4) {
      variant = 'default';
      color = 'text-yellow-600';
    }

    return (
      <Badge variant={variant} className={color}>
        {score.toFixed(1)}
      </Badge>
    );
  };

  const getSecurityStats = () => {
    const total = events.length;
    const critical = events.filter(e => e.event_level === 'critical').length;
    const warnings = events.filter(e => e.event_level === 'warning').length;
    const highThreat = events.filter(e => e.threat_score >= 7).length;

    return { total, critical, warnings, highThreat };
  };

  const stats = getSecurityStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warnings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Threat</p>
                <p className="text-2xl font-bold text-red-600">{stats.highThreat}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="two-factor">Require Two-Factor Authentication</Label>
                <Switch
                  id="two-factor"
                  checked={securitySettings.two_factor_required}
                  onCheckedChange={(checked) => {
                    setSecuritySettings(prev => ({ ...prev, two_factor_required: checked }));
                    updateSecuritySetting('two_factor_required', checked);
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="strong-passwords">Require Strong Passwords</Label>
                <Switch
                  id="strong-passwords"
                  checked={securitySettings.require_strong_passwords}
                  onCheckedChange={(checked) => {
                    setSecuritySettings(prev => ({ ...prev, require_strong_passwords: checked }));
                    updateSecuritySetting('require_strong_passwords', checked);
                  }}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={securitySettings.session_timeout_hours}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setSecuritySettings(prev => ({ ...prev, session_timeout_hours: value }));
                    updateSecuritySetting('session_timeout_hours', value);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="max-attempts">Max Login Attempts</Label>
                <Input
                  id="max-attempts"
                  type="number"
                  value={securitySettings.max_login_attempts}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setSecuritySettings(prev => ({ ...prev, max_login_attempts: value }));
                    updateSecuritySetting('max_login_attempts', value);
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Events
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => loadSecurityEvents()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Threat Score</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading security events...
                    </TableCell>
                  </TableRow>
                ) : filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No security events found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        {event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell>
                        {event.profiles?.display_name || 'System'}
                      </TableCell>
                      <TableCell>
                        {getLevelBadge(event.event_level)}
                      </TableCell>
                      <TableCell>
                        {getThreatScoreBadge(event.threat_score)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {event.ip_address}
                      </TableCell>
                      <TableCell>
                        {new Date(event.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedEvent(event);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {event.user_id && event.threat_score >= 7 && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => banUser(event.user_id, `High threat score: ${event.threat_score}`)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Security Event Details</DialogTitle>
            <DialogDescription>
              Detailed information about this security event
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Event Type</Label>
                  <p>{selectedEvent.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Level</Label>
                  {getLevelBadge(selectedEvent.event_level)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <p>{selectedEvent.profiles?.display_name || 'System'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Threat Score</Label>
                  {getThreatScoreBadge(selectedEvent.threat_score)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">IP Address</Label>
                  <p className="font-mono">{selectedEvent.ip_address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p>{new Date(selectedEvent.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">User Agent</Label>
                <p className="text-sm bg-muted p-2 rounded font-mono break-all">
                  {selectedEvent.user_agent || 'Not available'}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Event Data</Label>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
                  {JSON.stringify(selectedEvent.event_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};