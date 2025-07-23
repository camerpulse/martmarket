import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Smartphone, AlertTriangle, CheckCircle, Copy, Download, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

interface MFASettings {
  id: string;
  is_enabled: boolean;
  backup_codes: string[];
  created_at: string;
  enabled_at?: string;
}

export default function TwoFactorAuth() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mfaSettings, setMfaSettings] = useState<MFASettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      loadMFASettings();
    }
  }, [user]);

  const loadMFASettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_mfa')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setMfaSettings(data);
    } catch (error: any) {
      console.error('Error loading MFA settings:', error);
      toast({
        title: "Error",
        description: "Failed to load 2FA settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSecret = () => {
    const secret = new OTPAuth.Secret({ size: 20 });
    return secret.base32;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  };

  const startSetup = async () => {
    try {
      const secret = generateSecret();
      const codes = generateBackupCodes();
      
      setTotpSecret(secret);
      setBackupCodes(codes);

      // Generate QR code
      const totp = new OTPAuth.TOTP({
        issuer: 'Opes Market',
        label: user?.email || 'user',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
      });

      const qrUrl = await QRCode.toDataURL(totp.toString());
      setQrCodeUrl(qrUrl);
      setSetupMode(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate 2FA setup",
        variant: "destructive",
      });
    }
  };

  const verifySetup = async () => {
    if (!verificationCode || !totpSecret) return;

    setIsVerifying(true);
    try {
      // Verify TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: 'Opes Market',
        label: user?.email || 'user',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: totpSecret,
      });

      const delta = totp.validate({ token: verificationCode, window: 1 });
      if (delta === null) {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Save MFA settings to database
      const { data, error } = await supabase
        .from('user_mfa')
        .upsert({
          user_id: user?.id,
          secret: totpSecret,
          is_enabled: true,
          backup_codes: backupCodes,
          enabled_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setMfaSettings(data);
      setSetupMode(false);
      setShowBackupCodes(true);

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled for your account.",
      });

      // Create notification
      await supabase.rpc('create_notification', {
        p_user_id: user?.id,
        p_title: '2FA Enabled',
        p_message: 'Two-factor authentication has been successfully enabled for your account.',
        p_type: 'success',
        p_category: 'security'
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to enable 2FA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const disable2FA = async () => {
    try {
      const { error } = await supabase
        .from('user_mfa')
        .update({ is_enabled: false })
        .eq('user_id', user?.id);

      if (error) throw error;

      setMfaSettings(prev => prev ? { ...prev, is_enabled: false } : null);

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled for your account.",
      });

      // Create notification
      await supabase.rpc('create_notification', {
        p_user_id: user?.id,
        p_title: '2FA Disabled',
        p_message: 'Two-factor authentication has been disabled for your account.',
        p_type: 'warning',
        p_category: 'security'
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadBackupCodes = () => {
    const content = `Opes Market - Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe and secure. Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'opes-market-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Shield className="h-5 w-5 animate-pulse mr-2" />
            <span>Loading 2FA settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Two-Factor Authentication</CardTitle>
            </div>
            {mfaSettings?.is_enabled && (
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            )}
          </div>
          <CardDescription>
            Add an extra layer of security to your account with two-factor authentication (2FA).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mfaSettings?.is_enabled ? (
            <div className="space-y-4">
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Enable 2FA to protect your account with time-based one-time passwords (TOTP) from apps like Google Authenticator or Authy.
                </AlertDescription>
              </Alert>
              
              <Button onClick={startSetup} className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Enable Two-Factor Authentication
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">2FA is enabled</p>
                    <p className="text-sm text-muted-foreground">
                      Enabled on {new Date(mfaSettings.enabled_at || mfaSettings.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={disable2FA}
                  className="text-red-600 hover:text-red-700"
                >
                  Disable 2FA
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Keep your backup codes safe. You can use them to access your account if you lose your authenticator device.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={setupMode} onOpenChange={setSetupMode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app, then enter the verification code.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {qrCodeUrl && (
              <div className="text-center">
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto border rounded-lg" />
                <p className="text-sm text-muted-foreground mt-2">
                  Scan this QR code with Google Authenticator, Authy, or another TOTP app
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="secret">Manual Entry Key (if needed)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="secret"
                  value={totpSecret}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(totpSecret)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <Button 
              onClick={verifySetup} 
              disabled={verificationCode.length !== 6 || isVerifying}
              className="w-full"
            >
              {isVerifying ? 'Verifying...' : 'Verify and Enable 2FA'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Your Backup Codes</DialogTitle>
            <DialogDescription>
              These backup codes can be used to access your account if you lose your authenticator device. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Store these codes in a safe place. You won't be able to see them again.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-background rounded border">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Codes
              </Button>
              <Button 
                variant="outline" 
                onClick={downloadBackupCodes}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <Button onClick={() => setShowBackupCodes(false)} className="w-full">
              I've Saved My Backup Codes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}