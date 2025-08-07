import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, X, Eye, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  type: 'threat_detected' | 'mfa_required' | 'suspicious_activity' | 'security_recommendation';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action_required: boolean;
  data: any;
  created_at: string;
}

const SecurityAlert = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkSecurityAlerts();
      // Set up real-time subscription for security events
      const channel = supabase
        .channel('security-alerts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'security_events',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            handleNewSecurityEvent(payload.new);
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user]);

  const checkSecurityAlerts = async () => {
    if (!user) return;

    try {
      // Get recent high-risk security events
      const { data: events, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('threat_score', 5.0)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Convert security events to alerts
      const securityAlerts: SecurityAlert[] = (events || []).map(event => ({
        id: event.id,
        type: event.threat_score > 8 ? 'threat_detected' : 'suspicious_activity',
        title: event.threat_score > 8 ? 'Critical Security Threat' : 'Suspicious Activity Detected',
        message: generateAlertMessage(event),
        severity: event.threat_score > 8 ? 'critical' : event.threat_score > 6 ? 'high' : 'medium',
        action_required: event.threat_score > 7,
        data: event,
        created_at: event.created_at
      }));

      // Check for security recommendations
      const { data: mfaStatus } = await supabase.functions.invoke('mfa-manager', {
        body: { action: 'get_mfa_status' }
      });

      if (mfaStatus?.success && !mfaStatus.totp_enabled) {
        securityAlerts.push({
          id: 'mfa-recommendation',
          type: 'security_recommendation',
          title: 'Enable Two-Factor Authentication',
          message: 'Secure your account with 2FA for enhanced protection against unauthorized access.',
          severity: 'medium',
          action_required: false,
          data: { recommendation: 'enable_mfa' },
          created_at: new Date().toISOString()
        });
      }

      setAlerts(securityAlerts);
    } catch (error) {
      console.error('Error checking security alerts:', error);
    }
  };

  const handleNewSecurityEvent = (event: any) => {
    if (event.threat_score >= 5.0) {
      const alert: SecurityAlert = {
        id: event.id,
        type: event.threat_score > 8 ? 'threat_detected' : 'suspicious_activity',
        title: event.threat_score > 8 ? 'Critical Security Threat' : 'New Suspicious Activity',
        message: generateAlertMessage(event),
        severity: event.threat_score > 8 ? 'critical' : event.threat_score > 6 ? 'high' : 'medium',
        action_required: event.threat_score > 7,
        data: event,
        created_at: event.created_at
      };

      setAlerts(prev => [alert, ...prev.slice(0, 4)]);

      // Show toast notification for critical threats
      if (event.threat_score > 8) {
        toast({
          title: "Critical Security Alert",
          description: alert.message,
          variant: "destructive",
        });
      }
    }
  };

  const generateAlertMessage = (event: any): string => {
    switch (event.event_type) {
      case 'login_attempt':
        return `Suspicious login attempt from ${event.ip_address}`;
      case 'multiple_failed_attempts':
        return `Multiple failed login attempts detected from ${event.ip_address}`;
      case 'new_device_login':
        return `Login from new device/location: ${event.location_data?.country || 'Unknown'}`;
      case 'suspicious_activity':
        return `Unusual account activity detected - please review your recent actions`;
      case 'fraud_detected':
        return `Potential fraud detected in your account activity`;
      default:
        return `Security event: ${event.event_type.replace(/_/g, ' ')}`;
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleSecurityAction = async (alert: SecurityAlert) => {
    setLoading(true);
    try {
      switch (alert.data?.recommendation) {
        case 'enable_mfa':
          // Redirect to security settings
          window.location.href = '/security';
          break;
        case 'change_password':
          // Trigger password change flow
          toast({
            title: "Password Change Required",
            description: "Please change your password immediately for security.",
          });
          break;
        default:
          // Log security action taken
          await supabase.functions.invoke('security-monitor', {
            body: {
              action: 'log_event',
              user_id: user?.id,
              event_type: 'security_action_taken',
              event_data: { alert_id: alert.id, action: 'user_acknowledged' }
            }
          });
          break;
      }

      dismissAlert(alert.id);
    } catch (error) {
      console.error('Error handling security action:', error);
      toast({
        title: "Error",
        description: "Failed to process security action",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'high':
        return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'low':
        return 'border-blue-500 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Eye className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert key={alert.id} className={`${getSeverityColor(alert.severity)} border-l-4`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold">{alert.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                <AlertDescription className="mt-1">
                  {alert.message}
                </AlertDescription>
                {alert.action_required && (
                  <div className="mt-3 flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleSecurityAction(alert)}
                      disabled={loading}
                    >
                      {loading ? (
                        'Processing...'
                      ) : (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Take Action
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(alert.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(alert.id)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
};

export default SecurityAlert;