import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  Cpu, 
  HardDrive,
  MemoryStick,
  Network,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  lastUpdated: Date;
  history: { timestamp: Date; value: number }[];
}

interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  autoResolve: boolean;
}

export function RealTimeMonitor() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    initializeMonitoring();
    const interval = setInterval(updateMetrics, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const initializeMonitoring = () => {
    // Initialize system metrics
    const initialMetrics: SystemMetric[] = [
      {
        id: 'cpu',
        name: 'CPU Usage',
        value: 45,
        unit: '%',
        status: 'healthy',
        trend: 'stable',
        threshold: 80,
        lastUpdated: new Date(),
        history: []
      },
      {
        id: 'memory',
        name: 'Memory Usage',
        value: 62,
        unit: '%',
        status: 'healthy',
        trend: 'up',
        threshold: 85,
        lastUpdated: new Date(),
        history: []
      },
      {
        id: 'disk',
        name: 'Disk Usage',
        value: 73,
        unit: '%',
        status: 'warning',
        trend: 'up',
        threshold: 90,
        lastUpdated: new Date(),
        history: []
      },
      {
        id: 'network',
        name: 'Network I/O',
        value: 234,
        unit: 'MB/s',
        status: 'healthy',
        trend: 'stable',
        threshold: 1000,
        lastUpdated: new Date(),
        history: []
      },
      {
        id: 'response_time',
        name: 'Response Time',
        value: 127,
        unit: 'ms',
        status: 'healthy',
        trend: 'down',
        threshold: 2000,
        lastUpdated: new Date(),
        history: []
      },
      {
        id: 'active_connections',
        name: 'Active Connections',
        value: 1547,
        unit: 'connections',
        status: 'healthy',
        trend: 'stable',
        threshold: 10000,
        lastUpdated: new Date(),
        history: []
      },
      {
        id: 'error_rate',
        name: 'Error Rate',
        value: 0.12,
        unit: '%',
        status: 'healthy',
        trend: 'down',
        threshold: 1,
        lastUpdated: new Date(),
        history: []
      },
      {
        id: 'security_score',
        name: 'Security Score',
        value: 94.7,
        unit: '%',
        status: 'healthy',
        trend: 'up',
        threshold: 80,
        lastUpdated: new Date(),
        history: []
      }
    ];

    setMetrics(initialMetrics);
    setIsConnected(true);
  };

  const updateMetrics = async () => {
    try {
      // Simulate real-time data updates
      setMetrics(prev => prev.map(metric => {
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        let newValue = metric.value + (metric.value * variation);
        
        // Apply some realistic constraints and trends
        switch (metric.id) {
          case 'cpu':
            newValue = Math.max(10, Math.min(95, newValue));
            break;
          case 'memory':
            newValue = Math.max(20, Math.min(90, newValue));
            break;
          case 'disk':
            newValue = Math.max(50, Math.min(95, newValue + 0.01)); // Slowly increasing
            break;
          case 'network':
            newValue = Math.max(50, Math.min(800, newValue));
            break;
          case 'response_time':
            newValue = Math.max(50, Math.min(500, newValue));
            break;
          case 'active_connections':
            newValue = Math.max(500, Math.min(5000, newValue));
            break;
          case 'error_rate':
            newValue = Math.max(0, Math.min(2, newValue));
            break;
          case 'security_score':
            newValue = Math.max(80, Math.min(100, newValue));
            break;
        }

        // Determine status based on thresholds
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (metric.id === 'security_score') {
          if (newValue < 85) status = 'warning';
          if (newValue < 75) status = 'critical';
        } else if (metric.id === 'error_rate') {
          if (newValue > 0.5) status = 'warning';
          if (newValue > 1) status = 'critical';
        } else {
          const percentage = (newValue / metric.threshold) * 100;
          if (percentage > 75) status = 'warning';
          if (percentage > 90) status = 'critical';
        }

        // Determine trend
        const trend = newValue > metric.value ? 'up' : newValue < metric.value ? 'down' : 'stable';

        // Update history (keep last 20 points)
        const history = [...metric.history, { timestamp: new Date(), value: newValue }].slice(-20);

        return {
          ...metric,
          value: newValue,
          status,
          trend,
          lastUpdated: new Date(),
          history
        };
      }));

      // Check for new alerts
      checkForAlerts();
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error updating metrics:', error);
      setIsConnected(false);
    }
  };

  const checkForAlerts = () => {
    metrics.forEach(metric => {
      if (metric.status === 'critical' && !alerts.some(a => a.id === `${metric.id}_critical` && !a.resolved)) {
        const newAlert: SystemAlert = {
          id: `${metric.id}_critical`,
          severity: 'critical',
          title: `Critical: ${metric.name}`,
          description: `${metric.name} is at ${metric.value.toFixed(1)}${metric.unit}, exceeding critical threshold`,
          timestamp: new Date(),
          resolved: false,
          autoResolve: true
        };
        setAlerts(prev => [newAlert, ...prev]);
        
        // Trigger automatic remediation
        triggerAutoRemediation(metric);
      }
    });
  };

  const triggerAutoRemediation = async (metric: SystemMetric) => {
    try {
      await supabase.functions.invoke('autonomous-decision-engine', {
        body: { 
          action: 'auto_remediate',
          data: { 
            metric_id: metric.id,
            metric_value: metric.value,
            threshold: metric.threshold,
            severity: 'critical'
          }
        }
      });
    } catch (error) {
      console.error('Error triggering auto-remediation:', error);
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'cpu': return <Cpu className="h-4 w-4" />;
      case 'memory': return <MemoryStick className="h-4 w-4" />;
      case 'disk': return <HardDrive className="h-4 w-4" />;
      case 'network': return <Network className="h-4 w-4" />;
      case 'response_time': return <Clock className="h-4 w-4" />;
      case 'active_connections': return <Wifi className="h-4 w-4" />;
      case 'error_rate': return <AlertTriangle className="h-4 w-4" />;
      case 'security_score': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const criticalAlerts = unresolvedAlerts.filter(a => a.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">
            {isConnected ? 'Real-time monitoring active' : 'Connection lost'}
          </span>
          <Badge variant="outline" className="text-xs">
            Updated {lastUpdate.toLocaleTimeString()}
          </Badge>
        </div>
        {criticalAlerts.length > 0 && (
          <Badge variant="destructive">
            {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getMetricIcon(metric.id)}
                  {metric.name}
                </div>
                {getTrendIcon(metric.trend)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {metric.value < 10 ? metric.value.toFixed(2) : metric.value.toFixed(0)}
                  </span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(metric.status)} variant="secondary">
                    {metric.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    /{metric.threshold}{metric.unit}
                  </span>
                </div>

                {metric.id !== 'security_score' && metric.id !== 'error_rate' && (
                  <Progress 
                    value={(metric.value / metric.threshold) * 100} 
                    className="h-2"
                  />
                )}

                {/* Mini chart */}
                {metric.history.length > 1 && (
                  <div className="h-12 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metric.history}>
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke={metric.status === 'critical' ? '#ef4444' : metric.status === 'warning' ? '#f59e0b' : '#10b981'}
                          fill={metric.status === 'critical' ? '#ef4444' : metric.status === 'warning' ? '#f59e0b' : '#10b981'}
                          fillOpacity={0.1}
                          strokeWidth={1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Alerts */}
      {unresolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Active Alerts ({unresolvedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unresolvedAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                        className="text-xs"
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium text-sm">{alert.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {alert.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics[0]?.history || []}>
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis />
                {metrics.slice(0, 3).map((metric, index) => (
                  <Line 
                    key={metric.id}
                    type="monotone" 
                    dataKey="value" 
                    data={metric.history}
                    stroke={['#3b82f6', '#ef4444', '#10b981'][index]}
                    strokeWidth={2}
                    dot={false}
                    name={metric.name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
