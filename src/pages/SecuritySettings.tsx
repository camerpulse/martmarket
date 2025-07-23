import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  RefreshCw,
  Globe,
  Clock,
  Activity,
  Fingerprint
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TwoFactorAuth from '@/components/security/TwoFactorAuth';

interface SecurityStatus {
  totp_enabled: boolean;
  pgp_enabled: boolean;
  sms_enabled: boolean;
  backup_codes_count: number;
  locked_until: string | null;
  require_mfa_login: boolean;
  require_mfa_transactions: boolean;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  event_level: string;
  ip_address: string;
  location_data: any;
  threat_score: number;
  created_at: string;
}

const SecuritySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [securityScore, setSecurityScore] = useState(0);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [totpCode, setTotpCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [pgpPublicKey, setPgpPublicKey] = useState('');
  const [showSetupTOTP, setShowSetupTOTP] = useState(false);
  const [showSetupPGP, setShowSetupPGP] = useState(false);

  useEffect(() => {
    if (user) {
      loadSecurityStatus();
      loadSecurityOverview();
    }
  }, [user]);

  const loadSecurityStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('mfa-manager', {
        body: { action: 'get_mfa_status' }
      });

      if (error) throw error;

      if (data.success) {
        setSecurityStatus(data);
      }
    } catch (error) {
      console.error('Error loading security status:', error);
      toast({
        title: "Error",
        description: "Failed to load security settings",
        variant: "destructive",
      });
    }
  };

  const loadSecurityOverview = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: { 
          action: 'get_security_status',
          user_id: user?.id 
        }
      });

      if (error) throw error;

      if (data.success) {
        setSecurityScore(data.security_score);
        setRecentEvents(data.recent_events || []);
        setActiveSessions(data.active_sessions);
      }
    } catch (error) {
      console.error('Error loading security overview:', error);
    }
  };

  const setupTOTP = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-manager', {
        body: { action: 'setup_totp' }
      });

      if (error) throw error;

      if (data.success) {
        setQrCode(data.qr_code);
        setBackupCodes(data.backup_codes);
        setShowSetupTOTP(true);
        
        toast({
          title: "TOTP Setup",
          description: "Scan the QR code with your authenticator app",
        });
      }
    } catch (error) {
      console.error('Error setting up TOTP:', error);
      toast({
        title: "Error",
        description: "Failed to setup two-factor authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTPSetup = async () => {
    if (!totpCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-manager', {
        body: { 
          action: 'verify_totp_setup',
          totp_code: totpCode 
        }
      });

      if (error) throw error;

      if (data.success) {
        setShowSetupTOTP(false);
        setTotpCode('');
        await loadSecurityStatus();
        
        toast({
          title: "Success",
          description: "Two-factor authentication has been enabled",
        });
      }
    } catch (error) {
      console.error('Error verifying TOTP:', error);
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupPGP = async () => {
    if (!pgpPublicKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your PGP public key",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-manager', {
        body: { 
          action: 'setup_pgp',
          pgp_public_key: pgpPublicKey.trim()
        }
      });

      if (error) throw error;

      if (data.success) {
        setShowSetupPGP(false);
        setPgpPublicKey('');
        await loadSecurityStatus();
        
        toast({
          title: "Success",
          description: "PGP encryption has been enabled",
        });
      }
    } catch (error) {
      console.error('Error setting up PGP:', error);
      toast({
        title: "Error",
        description: "Failed to setup PGP encryption",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disableMFA = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-manager', {
        body: { action: 'disable_mfa' }
      });

      if (error) throw error;

      if (data.success) {
        await loadSecurityStatus();
        
        toast({
          title: "MFA Disabled",
          description: "Multi-factor authentication has been disabled",
        });
      }
    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast({
        title: "Error",
        description: "Failed to disable MFA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEventLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (!user) {
    return <div className="container mx-auto p-6">Please log in to access security settings.</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          Security Center
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security and monitor threats
        </p>
      </div>

      {/* Security Score Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Security Score
            </span>
            <Badge variant="outline" className={getSecurityScoreColor(securityScore)}>
              {securityScore}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3 mr-4">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  securityScore >= 80 ? 'bg-green-500' : 
                  securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${securityScore}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">{activeSessions}</div>
              <div className="text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{recentEvents.length}</div>
              <div className="text-muted-foreground">Recent Events</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {recentEvents.filter(e => e.threat_score > 5).length}
              </div>
              <div className="text-muted-foreground">High Risk Events</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="mfa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mfa">Multi-Factor Auth</TabsTrigger>
          <TabsTrigger value="pgp">PGP Encryption</TabsTrigger>
          <TabsTrigger value="activity">Security Activity</TabsTrigger>
          <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
        </TabsList>

        {/* Multi-Factor Authentication Tab */}
        <TabsContent value="mfa" className="space-y-6">
          <TwoFactorAuth />
        </TabsContent>

        {/* PGP Encryption Tab */}
        <TabsContent value="pgp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                PGP Encryption
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">End-to-End Encryption</p>
                  <p className="text-sm text-muted-foreground">
                    Secure communications with PGP encryption
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {securityStatus?.pgp_enabled ? (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Button
                      onClick={() => setShowSetupPGP(true)}
                      disabled={loading}
                    >
                      Setup PGP
                    </Button>
                  )}
                </div>
              </div>

              {showSetupPGP && (
                <div className="space-y-4">
                  <Label htmlFor="pgp-key">Paste your PGP public key:</Label>
                  <Textarea
                    id="pgp-key"
                    value={pgpPublicKey}
                    onChange={(e) => setPgpPublicKey(e.target.value)}
                    placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----
...
-----END PGP PUBLIC KEY BLOCK-----"
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={setupPGP}
                      disabled={loading || !pgpPublicKey.trim()}
                    >
                      {loading ? 'Setting up...' : 'Enable PGP'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSetupPGP(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recent Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border ${getEventLevelColor(event.event_level)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{event.event_type.replace(/_/g, ' ')}</p>
                          <p className="text-sm opacity-75">
                            IP: {event.ip_address} • {new Date(event.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Risk: {event.threat_score.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No recent security events
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require MFA for Login</p>
                  <p className="text-sm text-muted-foreground">
                    Always require two-factor authentication when logging in
                  </p>
                </div>
                <Switch
                  checked={securityStatus?.require_mfa_login || false}
                  disabled={!securityStatus?.totp_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require MFA for Transactions</p>
                  <p className="text-sm text-muted-foreground">
                    Require authentication for Bitcoin transactions
                  </p>
                </div>
                <Switch
                  checked={securityStatus?.require_mfa_transactions || false}
                  disabled={!securityStatus?.totp_enabled}
                />
              </div>

              <Button
                variant="outline"
                onClick={loadSecurityOverview}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Security Status
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings;