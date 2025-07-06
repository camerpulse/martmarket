import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Activity, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Zap,
  Eye,
  RefreshCw,
  Settings,
  Server,
  Database,
  Clock,
  TrendingUp,
  FileText,
  Bug,
  Code,
  Undo2,
  Play
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogDetailsDialog } from './LogDetailsDialog';
import { ThreatMonitoringPanel } from './ThreatMonitoringPanel';

interface AIConfig {
  id?: string;
  ai_mode: string;
  auto_fix_enabled: boolean;
  ddos_protection_enabled: boolean;
  captcha_enabled: boolean;
  emergency_mode: boolean;
}

interface AILog {
  id: string;
  action_type: string;
  severity: string;
  title: string;
  description: string;
  created_at: string;
  success: boolean;
  risk_level: number;
  rollback_available?: boolean;
}

interface SystemMetric {
  id: string;
  metric_type: string;
  metric_value: number;
  status: string;
  captured_at: string;
}

export function HeavenlyFireAI() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [logs, setLogs] = useState<AILog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    loadAIData();
    const interval = setInterval(loadAIData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAIData = async () => {
    try {
      // Load AI configuration
      const { data: configData } = await supabase
        .from('heavenly_fire_config')
        .select('*')
        .single();

      if (configData) {
        setConfig(configData);
      }

      // Load recent logs
      const { data: logsData } = await supabase
        .from('heavenly_fire_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setLogs(logsData || []);

      // Load system metrics
      const { data: metricsData } = await supabase
        .from('system_health_metrics')
        .select('*')
        .order('captured_at', { ascending: false })
        .limit(5);

      setMetrics(metricsData || []);

      // Get AI status
      const { data: statusData } = await supabase.functions.invoke('heavenly-fire-ai', {
        body: { action: 'get_status' }
      });

      if (statusData?.status) {
        setSystemStatus(statusData.status);
      }

    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAIMode = async (mode: string) => {
    try {
      const { error } = await supabase
        .from('heavenly_fire_config')
        .update({ ai_mode: mode })
        .eq('id', config?.id);

      if (error) throw error;

      setConfig(prev => prev ? { ...prev, ai_mode: mode } : null);
      
      toast({
        title: "AI Mode Updated",
        description: `Heavenly Fire AI is now in ${mode} mode`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update AI mode",
        variant: "destructive",
      });
    }
  };

  const toggleAutoFix = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('heavenly_fire_config')
        .update({ auto_fix_enabled: enabled })
        .eq('id', config?.id);

      if (error) throw error;

      setConfig(prev => prev ? { ...prev, auto_fix_enabled: enabled } : null);
      
      toast({
        title: enabled ? "Auto-Fix Enabled" : "Auto-Fix Disabled",
        description: enabled ? "AI will now automatically fix detected issues" : "AI will only monitor and alert",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle auto-fix",
        variant: "destructive",
      });
    }
  };

  const toggleDDoSProtection = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('heavenly_fire_config')
        .update({ ddos_protection_enabled: enabled })
        .eq('id', config?.id);

      if (error) throw error;

      setConfig(prev => prev ? { ...prev, ddos_protection_enabled: enabled } : null);
      
      toast({
        title: enabled ? "DDoS Protection Enabled" : "DDoS Protection Disabled",
        description: enabled ? "AI will actively monitor and block suspicious traffic" : "DDoS protection is disabled",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle DDoS protection",
        variant: "destructive",
      });
    }
  };

  const testAIAnalysis = async () => {
    try {
      const testError = {
        error_type: 'test_error',
        message: 'This is a test error for AI analysis',
        stack: 'at testFunction (test.js:10:5)',
        system: 'frontend'
      };

      const { data } = await supabase.functions.invoke('heavenly-fire-ai', {
        body: { 
          action: 'analyze_error',
          data: testError
        }
      });

      if (data?.analysis) {
        toast({
          title: "AI Analysis Complete",
          description: `Diagnosis: ${data.analysis.diagnosis}`,
        });
        loadAIData(); // Refresh logs
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test AI analysis",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-100';
      case 'warning': return 'text-amber-500 bg-amber-100';
      case 'info': return 'text-blue-500 bg-blue-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="h-8 w-8 mx-auto mb-4 animate-pulse text-primary" />
          <p>Loading Heavenly Fire AI...</p>
        </div>
      </div>
    );
  }

  const handleRollback = async (logId: string) => {
    try {
      const { data } = await supabase.functions.invoke('heavenly-fire-ai', {
        body: { 
          action: 'rollback_fix',
          data: { log_id: logId }
        }
      });

      toast({
        title: "Rollback Initiated",
        description: "Rolling back the automated fix",
      });
      
      loadAIData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rollback fix",
        variant: "destructive",
      });
    }
  };

  const handleReApply = async (logId: string) => {
    try {
      const { data } = await supabase.functions.invoke('heavenly-fire-ai', {
        body: { 
          action: 'reapply_fix',
          data: { log_id: logId }
        }
      });

      toast({
        title: "Fix Re-applied",
        description: "The fix has been re-applied successfully",
      });
      
      loadAIData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to re-apply fix",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Mode: {config?.ai_mode || 'off'}</span>
              <Badge variant={config?.ai_mode === 'on' ? 'default' : 'secondary'}>
                {config?.ai_mode === 'on' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>DDoS Protection</span>
              <Badge variant={config?.ddos_protection_enabled ? 'default' : 'secondary'}>
                {config?.ddos_protection_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-blue-500" />
              Auto-Fix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant={config?.auto_fix_enabled ? 'default' : 'secondary'}>
                {config?.auto_fix_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Heavenly Fire AI Controls
          </CardTitle>
          <CardDescription>
            Independent AI system for platform monitoring and auto-repair
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">AI Mode</label>
                  <p className="text-sm text-muted-foreground">Enable autonomous monitoring and fixing</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={config?.ai_mode === 'off' ? 'default' : 'outline'}
                    onClick={() => updateAIMode('off')}
                  >
                    Off
                  </Button>
                  <Button 
                    size="sm"
                    variant={config?.ai_mode === 'monitor_only' ? 'default' : 'outline'}
                    onClick={() => updateAIMode('monitor_only')}
                  >
                    Monitor
                  </Button>
                  <Button 
                    size="sm"
                    variant={config?.ai_mode === 'on' ? 'default' : 'outline'}
                    onClick={() => updateAIMode('on')}
                  >
                    Full Auto
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Auto-Fix</label>
                  <p className="text-sm text-muted-foreground">Automatically fix detected issues</p>
                </div>
                <Switch
                  checked={config?.auto_fix_enabled || false}
                  onCheckedChange={toggleAutoFix}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">DDoS Protection</label>
                  <p className="text-sm text-muted-foreground">Block malicious traffic automatically</p>
                </div>
                <Switch
                  checked={config?.ddos_protection_enabled || false}
                  onCheckedChange={toggleDDoSProtection}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Button onClick={testAIAnalysis} className="w-full">
                <Brain className="h-4 w-4 mr-2" />
                Test AI Analysis
              </Button>
              
              <Button onClick={loadAIData} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>

              {config?.emergency_mode && (
                <div className="p-3 bg-red-100 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Emergency Mode Active</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Platform is in emergency mode due to critical issues
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">AI Activity</TabsTrigger>
          <TabsTrigger value="threats">Threat Monitor</TabsTrigger>
          <TabsTrigger value="fixes">Auto-Fix History</TabsTrigger>
          <TabsTrigger value="metrics">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent AI Activity
              </CardTitle>
              <CardDescription>Latest actions performed by Heavenly Fire AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No AI activity recorded yet. The system is monitoring in the background.
                  </p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="mt-1">
                        {log.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{log.title}</span>
                          <Badge className={getSeverityColor(log.severity)} variant="secondary">
                            {log.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Risk: {log.risk_level}/10
                          </span>
                          {log.rollback_available && (
                            <Badge variant="outline" className="text-amber-600">
                              Rollback Available
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{log.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                          <LogDetailsDialog 
                            log={log} 
                            onRollback={handleRollback}
                            onReApply={handleReApply}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats">
          <ThreatMonitoringPanel />
        </TabsContent>

        <TabsContent value="fixes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Auto-Fix History
              </CardTitle>
              <CardDescription>History of automated fixes applied by Heavenly Fire AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.filter(log => log.action_type.includes('fix')).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No auto-fixes have been applied yet.
                  </p>
                ) : (
                  logs.filter(log => log.action_type.includes('fix')).map((log) => (
                    <div key={log.id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.title}</span>
                          <Badge className={getSeverityColor(log.severity)} variant="secondary">
                            {log.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.rollback_available && (
                            <Button size="sm" variant="outline" onClick={() => handleRollback(log.id)}>
                              <Undo2 className="h-4 w-4 mr-1" />
                              Rollback
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleReApply(log.id)}>
                            <Play className="h-4 w-4 mr-1" />
                            Re-apply
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{log.description}</p>
                      <div className="text-xs text-muted-foreground">
                        Applied: {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          {/* System Health Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                System Health Metrics
              </CardTitle>
              <CardDescription>Real-time platform performance data</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No health metrics available yet. The monitoring system is initializing.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">
                          {metric.metric_type.replace('_', ' ')}
                        </span>
                        {getStatusIcon(metric.status)}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {metric.metric_value.toFixed(1)}
                        {metric.metric_type.includes('percentage') || metric.metric_type.includes('usage') ? '%' : ''}
                      </div>
                      <Progress 
                        value={Math.min(metric.metric_value, 100)} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}