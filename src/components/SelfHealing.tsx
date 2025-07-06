import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Activity, 
  Zap, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Settings,
  Brain,
  Shield,
  Wrench,
  Clock,
  TrendingUp,
  Target,
  Cpu,
  Database,
  Network
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HealingAction {
  id: string;
  type: string;
  description: string;
  status: 'detected' | 'analyzing' | 'healing' | 'resolved' | 'failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  healingStarted?: Date;
  resolvedAt?: Date;
  autoHealed: boolean;
  success: boolean;
  steps: HealingStep[];
  affectedSystems: string[];
  rootCause?: string;
  prevention?: string;
}

interface HealingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration: number;
  output?: string;
}

interface SystemHealth {
  component: string;
  status: 'healthy' | 'degraded' | 'critical' | 'healing';
  lastCheck: Date;
  uptime: number;
  healingAttempts: number;
  autoRecovery: boolean;
}

export function SelfHealing() {
  const { toast } = useToast();
  const [healingActions, setHealingActions] = useState<HealingAction[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [healingStats, setHealingStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [autoHealingEnabled, setAutoHealingEnabled] = useState(true);

  useEffect(() => {
    initializeSelfHealing();
    const interval = setInterval(monitorAndHeal, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const initializeSelfHealing = () => {
    // Initialize system health components
    const initialHealth: SystemHealth[] = [
      {
        component: 'API Gateway',
        status: 'healthy',
        lastCheck: new Date(),
        uptime: 99.97,
        healingAttempts: 0,
        autoRecovery: true
      },
      {
        component: 'Database',
        status: 'healthy',
        lastCheck: new Date(),
        uptime: 99.99,
        healingAttempts: 1,
        autoRecovery: true
      },
      {
        component: 'Edge Functions',
        status: 'healthy',
        lastCheck: new Date(),
        uptime: 99.95,
        healingAttempts: 0,
        autoRecovery: true
      },
      {
        component: 'Authentication',
        status: 'healthy',
        lastCheck: new Date(),
        uptime: 99.98,
        healingAttempts: 0,
        autoRecovery: true
      },
      {
        component: 'File Storage',
        status: 'healthy',
        lastCheck: new Date(),
        uptime: 99.94,
        healingAttempts: 2,
        autoRecovery: true
      },
      {
        component: 'AI Systems',
        status: 'healthy',
        lastCheck: new Date(),
        uptime: 99.89,
        healingAttempts: 3,
        autoRecovery: true
      }
    ];

    // Initialize recent healing actions
    const initialActions: HealingAction[] = [
      {
        id: '1',
        type: 'Memory Leak',
        description: 'Detected memory leak in AI processing module',
        status: 'resolved',
        severity: 'medium',
        detectedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        healingStarted: new Date(Date.now() - 43 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 40 * 60 * 1000),
        autoHealed: true,
        success: true,
        affectedSystems: ['AI Systems', 'API Gateway'],
        rootCause: 'Insufficient garbage collection in pattern analysis',
        prevention: 'Implemented automatic memory cleanup after each analysis cycle',
        steps: [
          {
            id: '1-1',
            name: 'Detect Memory Pattern',
            description: 'Analyze memory usage patterns',
            status: 'success',
            duration: 15000,
            output: 'Memory leak identified in AI pattern analyzer'
          },
          {
            id: '1-2', 
            name: 'Isolate Process',
            description: 'Isolate affected process',
            status: 'success',
            duration: 30000,
            output: 'Process isolated successfully'
          },
          {
            id: '1-3',
            name: 'Apply Fix',
            description: 'Implement garbage collection fix',
            status: 'success',
            duration: 120000,
            output: 'Memory leak resolved, system stabilized'
          }
        ]
      },
      {
        id: '2',
        type: 'Connection Pool Exhaustion',
        description: 'Database connection pool reaching critical limits',
        status: 'resolved',
        severity: 'high',
        detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        healingStarted: new Date(Date.now() - 119 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 115 * 60 * 1000),
        autoHealed: true,
        success: true,
        affectedSystems: ['Database', 'API Gateway'],
        rootCause: 'Sudden spike in concurrent users without connection scaling',
        prevention: 'Implemented dynamic connection pool scaling based on load',
        steps: [
          {
            id: '2-1',
            name: 'Scale Connection Pool',
            description: 'Increase maximum connections',
            status: 'success',
            duration: 10000,
            output: 'Connection pool scaled from 20 to 50 connections'
          },
          {
            id: '2-2',
            name: 'Optimize Queries',
            description: 'Kill long-running queries',
            status: 'success',
            duration: 45000,
            output: '3 long-running queries terminated'
          },
          {
            id: '2-3',
            name: 'Load Balance',
            description: 'Redistribute connection load',
            status: 'success',
            duration: 180000,
            output: 'Load balanced across 3 database replicas'
          }
        ]
      }
    ];

    setSystemHealth(initialHealth);
    setHealingActions(initialActions);
    setHealingStats({
      totalHealed: 127,
      successRate: 94.2,
      avgHealingTime: 4.3,
      preventedOutages: 23
    });
    setLoading(false);
  };

  const monitorAndHeal = async () => {
    // Simulate continuous monitoring and healing
    if (Math.random() < 0.05 && autoHealingEnabled) { // 5% chance of detecting an issue
      const issues = [
        'High CPU Usage',
        'Slow Query Performance', 
        'API Response Timeout',
        'Edge Function Cold Start',
        'Security Anomaly',
        'Cache Miss Rate Spike'
      ];

      const randomIssue = issues[Math.floor(Math.random() * issues.length)];
      await detectAndHeal(randomIssue);
    }

    // Update system health
    setSystemHealth(prev => prev.map(component => ({
      ...component,
      lastCheck: new Date(),
      status: Math.random() > 0.95 ? 'degraded' : component.status // 5% chance of degradation
    })));
  };

  const detectAndHeal = async (issueType: string) => {
    const newAction: HealingAction = {
      id: Date.now().toString(),
      type: issueType,
      description: `Detected ${issueType.toLowerCase()} requiring immediate attention`,
      status: 'detected',
      severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      detectedAt: new Date(),
      autoHealed: true,
      success: false,
      affectedSystems: ['API Gateway'],
      steps: [
        {
          id: '1',
          name: 'Analyze Issue',
          description: `Analyzing ${issueType.toLowerCase()}`,
          status: 'pending',
          duration: 0
        },
        {
          id: '2',
          name: 'Apply Healing',
          description: 'Implementing automated fix',
          status: 'pending', 
          duration: 0
        },
        {
          id: '3',
          name: 'Verify Fix',
          description: 'Verifying system stability',
          status: 'pending',
          duration: 0
        }
      ]
    };

    setHealingActions(prev => [newAction, ...prev.slice(0, 9)]); // Keep last 10

    // Start healing process
    setTimeout(() => startHealing(newAction.id), 1000);
  };

  const startHealing = (actionId: string) => {
    setHealingActions(prev => prev.map(action => {
      if (action.id === actionId) {
        const updatedSteps = [...action.steps];
        updatedSteps[0] = { ...updatedSteps[0], status: 'running' };
        
        return {
          ...action,
          status: 'analyzing',
          healingStarted: new Date(),
          steps: updatedSteps
        };
      }
      return action;
    }));

    // Simulate healing progression
    setTimeout(() => progressHealing(actionId, 0), 2000);
  };

  const progressHealing = (actionId: string, stepIndex: number) => {
    setHealingActions(prev => prev.map(action => {
      if (action.id === actionId) {
        const updatedSteps = [...action.steps];
        
        // Complete current step
        if (stepIndex < updatedSteps.length) {
          updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            status: 'success',
            duration: Math.random() * 30000 + 5000,
            output: `Step ${stepIndex + 1} completed successfully`
          };

          // Start next step
          if (stepIndex + 1 < updatedSteps.length) {
            updatedSteps[stepIndex + 1] = {
              ...updatedSteps[stepIndex + 1],
              status: 'running'
            };
            
            // Continue to next step
            setTimeout(() => progressHealing(actionId, stepIndex + 1), 3000);
            
            return {
              ...action,
              status: 'healing',
              steps: updatedSteps
            };
          } else {
            // All steps complete
            return {
              ...action,
              status: 'resolved',
              success: true,
              resolvedAt: new Date(),
              steps: updatedSteps,
              rootCause: 'System overload due to increased traffic',
              prevention: 'Implemented auto-scaling and load balancing'
            };
          }
        }
      }
      return action;
    }));
  };

  const manualHeal = async (actionId: string) => {
    try {
      await supabase.functions.invoke('heavenly-fire-ai', {
        body: { 
          action: 'manual_heal',
          data: { action_id: actionId }
        }
      });

      toast({
        title: "Manual Healing Initiated",
        description: "Heavenly Fire AI is applying manual healing procedures",
      });

    } catch (error) {
      console.error('Error triggering manual healing:', error);
      toast({
        title: "Healing Failed",
        description: "Failed to initiate manual healing",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'healing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealingStatusIcon = (status: string) => {
    switch (status) {
      case 'detected': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'analyzing': return <Brain className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'healing': return <Wrench className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComponentIcon = (component: string) => {
    switch (component.toLowerCase()) {
      case 'database': return <Database className="h-4 w-4" />;
      case 'api gateway': return <Network className="h-4 w-4" />;
      case 'ai systems': return <Brain className="h-4 w-4" />;
      case 'authentication': return <Shield className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Heart className="h-8 w-8 mx-auto mb-4 animate-pulse text-primary" />
          <p>Initializing self-healing systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Self-Healing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Healed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healingStats.totalHealed}</div>
            <p className="text-xs text-muted-foreground">Issues resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healingStats.successRate}%</div>
            <p className="text-xs text-muted-foreground">Auto-healing success</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Heal Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healingStats.avgHealingTime}m</div>
            <p className="text-xs text-muted-foreground">Time to resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outages Prevented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{healingStats.preventedOutages}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              System Health Status
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Auto-Healing:</span>
              <Badge variant={autoHealingEnabled ? "default" : "secondary"}>
                {autoHealingEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemHealth.map((component) => (
              <div key={component.component} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getComponentIcon(component.component)}
                    <span className="font-medium text-sm">{component.component}</span>
                  </div>
                  {getStatusIcon(component.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Uptime:</span>
                    <span className="font-medium">{component.uptime.toFixed(2)}%</span>
                  </div>
                  
                  <Progress value={component.uptime} className="h-1" />
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Last check: {component.lastCheck.toLocaleTimeString()}</span>
                    {component.healingAttempts > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {component.healingAttempts} healed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Healing Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Healing Actions History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healingActions.map((action) => (
              <div key={action.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getHealingStatusIcon(action.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{action.type}</span>
                        <Badge 
                          variant="secondary" 
                          className={getSeverityColor(action.severity)}
                        >
                          {action.severity.toUpperCase()}
                        </Badge>
                        {action.autoHealed && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Auto-Healed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {action.status === 'resolved' && action.healingStarted && action.resolvedAt 
                        ? `${((action.resolvedAt.getTime() - action.healingStarted.getTime()) / 1000 / 60).toFixed(1)}m`
                        : action.status
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {action.detectedAt.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Healing Steps */}
                <div className="space-y-2 mb-3">
                  {action.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 w-32">
                        {getHealingStatusIcon(step.status)}
                        <span className="font-medium">{step.name}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-muted-foreground">{step.description}</span>
                        {step.duration > 0 && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {(step.duration / 1000).toFixed(1)}s
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Information */}
                {action.status === 'resolved' && (
                  <div className="border-t pt-3 space-y-2">
                    {action.rootCause && (
                      <div className="text-sm">
                        <span className="font-medium">Root Cause:</span>
                        <span className="text-muted-foreground ml-2">{action.rootCause}</span>
                      </div>
                    )}
                    {action.prevention && (
                      <div className="text-sm">
                        <span className="font-medium">Prevention:</span>
                        <span className="text-muted-foreground ml-2">{action.prevention}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Healing Option */}
                {(action.status === 'detected' || action.status === 'failed') && (
                  <div className="border-t pt-3">
                    <Button 
                      size="sm" 
                      onClick={() => manualHeal(action.id)}
                      className="flex items-center gap-2"
                    >
                      <Wrench className="h-4 w-4" />
                      Trigger Manual Healing
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}