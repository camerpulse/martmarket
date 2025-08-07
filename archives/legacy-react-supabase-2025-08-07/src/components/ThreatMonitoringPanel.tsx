import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Clock, 
  Activity,
  Ban,
  CheckCircle,
  XCircle,
  Globe,
  User,
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityIncident {
  id: string;
  incident_type: string;
  severity: string;
  source_ip: string | unknown;
  user_agent: string;
  attack_pattern: any;
  status: string;
  started_at: string;
  resolved_at?: string;
  mitigation_actions?: any;
}

interface ThreatMetrics {
  total_threats: number;
  active_threats: number;
  blocked_ips: number;
  threat_level: string;
  ddos_attempts: number;
  sql_injection_attempts: number;
  xss_attempts: number;
}

export function ThreatMonitoringPanel() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [metrics, setMetrics] = useState<ThreatMetrics | null>(null);
  const [realtimeThreats, setRealtimeThreats] = useState<any[]>([]);

  useEffect(() => {
    loadThreatData();
    const interval = setInterval(loadThreatData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadThreatData = async () => {
    try {
      // Load security incidents
      const { data: incidentsData } = await supabase
        .from('security_incidents')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      setIncidents(incidentsData || []);

      // Simulate real-time threat metrics
      const mockMetrics: ThreatMetrics = {
        total_threats: Math.floor(Math.random() * 1000) + 500,
        active_threats: Math.floor(Math.random() * 10) + 1,
        blocked_ips: Math.floor(Math.random() * 50) + 20,
        threat_level: Math.random() > 0.8 ? 'HIGH' : Math.random() > 0.5 ? 'MEDIUM' : 'LOW',
        ddos_attempts: Math.floor(Math.random() * 20),
        sql_injection_attempts: Math.floor(Math.random() * 15),
        xss_attempts: Math.floor(Math.random() * 10)
      };

      setMetrics(mockMetrics);

      // Simulate real-time threat feed
      const mockRealtime = Array.from({ length: 5 }, (_, i) => ({
        id: `rt-${i}`,
        timestamp: new Date(Date.now() - i * 30000).toISOString(),
        type: ['DDoS', 'SQL Injection', 'XSS', 'Brute Force', 'Bot Traffic'][Math.floor(Math.random() * 5)],
        source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
        blocked: Math.random() > 0.3
      }));

      setRealtimeThreats(mockRealtime);

    } catch (error) {
      console.error('Error loading threat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const blockThreat = async (threatId: string, sourceIp: string) => {
    try {
      // Simulate blocking threat
      await supabase.functions.invoke('heavenly-fire-ai', {
        body: { 
          action: 'block_threat',
          data: { threat_id: threatId, source_ip: sourceIp }
        }
      });

      toast({
        title: "Threat Blocked",
        description: `Successfully blocked threat from ${sourceIp}`,
      });

      loadThreatData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to block threat",
        variant: "destructive",
      });
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500 bg-red-100';
      case 'HIGH': return 'text-orange-500 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-100';
      case 'LOW': return 'text-green-500 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="h-8 w-8 mx-auto mb-4 animate-pulse text-primary" />
          <p>Loading threat monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Threat Level Alert */}
      {metrics && metrics.threat_level !== 'LOW' && (
        <Alert className={`border-l-4 ${
          metrics.threat_level === 'CRITICAL' ? 'border-red-500 bg-red-50' :
          metrics.threat_level === 'HIGH' ? 'border-orange-500 bg-orange-50' :
          'border-yellow-500 bg-yellow-50'
        }`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Current threat level is <strong>{metrics.threat_level}</strong>. 
            Enhanced monitoring is active with {metrics.active_threats} active threats detected.
          </AlertDescription>
        </Alert>
      )}

      {/* Threat Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Total Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_threats}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              Active Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{metrics?.active_threats}</div>
            <p className="text-xs text-muted-foreground">Currently being monitored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-red-500" />
              Blocked IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.blocked_ips}</div>
            <p className="text-xs text-muted-foreground">Automatically blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Threat Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getThreatLevelColor(metrics?.threat_level || 'LOW')} variant="secondary">
              {metrics?.threat_level || 'LOW'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Current status</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="realtime">Real-time Feed</TabsTrigger>
          <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
          <TabsTrigger value="analytics">Threat Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Threat Feed
              </CardTitle>
              <CardDescription>Live monitoring of security threats and attacks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {realtimeThreats.map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {threat.blocked ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">{threat.type}</span>
                      </div>
                      <Badge className={getThreatLevelColor(threat.severity)} variant="secondary">
                        {threat.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{threat.source}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(threat.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      {!threat.blocked && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => blockThreat(threat.id, threat.source)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Security Incidents
              </CardTitle>
              <CardDescription>Detailed security incident reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No security incidents recorded.
                  </p>
                ) : (
                  incidents.map((incident) => (
                    <div key={incident.id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{incident.incident_type}</span>
                          <Badge className={getThreatLevelColor(incident.severity)} variant="secondary">
                            {incident.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(incident.started_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Source IP:</span>
                          <span className="ml-2 font-mono">{String(incident.source_ip)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <span className={`ml-2 capitalize ${
                            incident.status === 'resolved' ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {incident.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">DDoS Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{metrics?.ddos_attempts}</div>
                <Progress value={(metrics?.ddos_attempts || 0) * 5} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">SQL Injections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{metrics?.sql_injection_attempts}</div>
                <Progress value={(metrics?.sql_injection_attempts || 0) * 7} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">XSS Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{metrics?.xss_attempts}</div>
                <Progress value={(metrics?.xss_attempts || 0) * 10} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}