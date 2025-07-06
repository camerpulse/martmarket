import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BitcoinPaymentProps {
  purpose: 'vendor_bond' | 'user_deposit' | 'order_payment';
  amountUsd?: number;
  onPaymentComplete?: () => void;
  showRefresh?: boolean;
}

const BitcoinPayment = ({ purpose, amountUsd, onPaymentComplete, showRefresh = true }: BitcoinPaymentProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    generatePaymentAddress();
  }, [purpose, amountUsd]);

  useEffect(() => {
    if (paymentData && showRefresh) {
      const interval = setInterval(checkPaymentStatus, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [paymentData]);

  const generatePaymentAddress = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-bitcoin-address', {
        body: { purpose, amount_usd: amountUsd }
      });

      if (error) throw error;

      setPaymentData(data);
      console.log('Payment address generated:', data);
      
    } catch (error: any) {
      toast({
        title: "Address generation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.payment_request_id || checking) return;
    
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('payment-processor', {
        body: { 
          action: 'check_confirmations',
          payment_request_id: paymentData.payment_request_id
        }
      });

      if (error) throw error;

      if (data.success && data.confirmation) {
        setPaymentStatus(data.is_confirmed ? 'completed' : 'pending');
        
        if (data.is_confirmed) {
          toast({
            title: "Payment Confirmed!",
            description: "Your Bitcoin payment has been confirmed on the blockchain.",
          });
          if (onPaymentComplete) {
            onPaymentComplete();
          }
        }
      }
      
    } catch (error: any) {
      console.error('Payment check failed:', error);
    } finally {
      setChecking(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Bitcoin address copied to clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the address manually.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-orange-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'partial': return Clock;
      case 'expired': return AlertTriangle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Bitcoin className="h-8 w-8 text-bitcoin mx-auto mb-4 animate-spin" />
          <p>Generating Bitcoin payment address...</p>
        </CardContent>
      </Card>
    );
  }

  if (!paymentData) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to generate payment address. Please try again.
            </AlertDescription>
          </Alert>
          <Button onClick={generatePaymentAddress} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const StatusIcon = getStatusIcon(paymentStatus);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bitcoin className="h-5 w-5 text-bitcoin mr-2" />
          Bitcoin Payment
        </CardTitle>
        <CardDescription>
          Send Bitcoin to the address below to complete your payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge className={`${getStatusColor(paymentStatus)} text-white`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
          </Badge>
        </div>

        {/* Payment Amount */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount (BTC):</span>
            <span className="font-mono font-bold">{paymentData.amount_btc}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount (USD):</span>
            <span className="font-medium">${paymentData.amount_usd}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Satoshis:</span>
            <span className="font-mono">{paymentData.amount_satoshis.toLocaleString()}</span>
          </div>
        </div>

        {/* Bitcoin Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Send Bitcoin to this address:</label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 bg-muted rounded font-mono text-sm break-all">
              {paymentData.address}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(paymentData.address)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expiration Warning */}
        {paymentData.expires_at && paymentStatus === 'pending' && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Payment expires: {new Date(paymentData.expires_at).toLocaleString()}
            </AlertDescription>
          </Alert>
        )}

        {/* Refresh Button */}
        {showRefresh && paymentStatus !== 'completed' && (
          <Button 
            onClick={checkPaymentStatus} 
            disabled={checking}
            variant="outline" 
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking...' : 'Check Payment Status'}
          </Button>
        )}

        {/* Success Message */}
        {paymentStatus === 'completed' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Payment confirmed! Your transaction has been processed successfully.
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Send the exact amount shown above</p>
          <p>• Payment confirmation requires 1+ network confirmations</p>
          <p>• Do not send from exchange addresses</p>
          <p>• This address is single-use only</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BitcoinPayment;