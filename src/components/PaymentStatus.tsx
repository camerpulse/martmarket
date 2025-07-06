import { useState, useEffect } from "react";
import { Bitcoin, Clock, CheckCircle, XCircle, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaymentStatusProps {
  orderId: string;
  onPaymentComplete?: () => void;
}

interface PaymentRequest {
  id: string;
  amount_satoshis: number;
  status: string;
  expires_at: string;
  bitcoin_addresses: {
    address: string;
  };
}

const PaymentStatus = ({ orderId, onPaymentComplete }: PaymentStatusProps) => {
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const fetchPaymentRequest = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_requests')
          .select(`
            id,
            amount_satoshis,
            status,
            expires_at,
            bitcoin_addresses(address)
          `)
          .eq('order_id', orderId)
          .single();

        if (error) throw error;
        setPaymentRequest(data);
      } catch (error) {
        console.error('Error fetching payment request:', error);
        toast.error('Failed to load payment information');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentRequest();

    // Set up real-time updates for payment status
    const channel = supabase
      .channel('payment-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_requests',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          setPaymentRequest(prev => prev ? { ...prev, ...payload.new } : null);
          if (payload.new.status === 'completed') {
            toast.success('Payment confirmed!');
            onPaymentComplete?.();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, onPaymentComplete]);

  useEffect(() => {
    if (!paymentRequest?.expires_at) return;

    const updateTimeLeft = () => {
      const expiryTime = new Date(paymentRequest.expires_at).getTime();
      const now = new Date().getTime();
      const difference = expiryTime - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("Expired");
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [paymentRequest?.expires_at]);

  const copyAddress = async () => {
    if (paymentRequest?.bitcoin_addresses?.address) {
      await navigator.clipboard.writeText(paymentRequest.bitcoin_addresses.address);
      toast.success('Bitcoin address copied to clipboard');
    }
  };

  const checkPayment = async () => {
    if (!paymentRequest) return;

    try {
      const { error } = await supabase.functions.invoke('check-bitcoin-payment', {
        body: { payment_request_id: paymentRequest.id }
      });

      if (error) throw error;
      toast.success('Payment check initiated');
    } catch (error) {
      console.error('Error checking payment:', error);
      toast.error('Failed to check payment status');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-lg text-muted-foreground">Loading payment information...</div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentRequest) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-lg text-destructive">Payment information not found</div>
        </CardContent>
      </Card>
    );
  }

  const btcAmount = paymentRequest.amount_satoshis / 100000000;
  const isExpired = new Date(paymentRequest.expires_at) < new Date();
  const isCompleted = paymentRequest.status === 'completed';
  const isPending = paymentRequest.status === 'pending';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bitcoin className="h-5 w-5 text-primary" />
            <span>Bitcoin Payment Required</span>
            <Badge 
              variant={isCompleted ? "default" : isExpired ? "destructive" : "secondary"}
            >
              {isCompleted ? "Completed" : isExpired ? "Expired" : "Pending"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Amount */}
          <div className="text-center p-6 bg-muted rounded-lg">
            <div className="text-3xl font-bold text-primary flex items-center justify-center space-x-2">
              <Bitcoin className="h-8 w-8" />
              <span>{btcAmount.toFixed(8)} BTC</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {paymentRequest.amount_satoshis.toLocaleString()} satoshis
            </p>
          </div>

          {/* Bitcoin Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Send Bitcoin to this address:</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-muted rounded font-mono text-sm break-all">
                {paymentRequest.bitcoin_addresses?.address}
              </div>
              <Button variant="outline" size="sm" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status and Timer */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <div className="flex items-center space-x-2">
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : isExpired ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500" />
              )}
              <span className="text-sm font-medium">
                {isCompleted ? "Payment Confirmed" : isExpired ? "Payment Expired" : "Awaiting Payment"}
              </span>
            </div>
            {!isCompleted && !isExpired && (
              <div className="text-sm text-muted-foreground">
                Expires in: {timeLeft}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {isPending && !isExpired && (
              <Button onClick={checkPayment} variant="outline" className="flex-1">
                Check Payment Status
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.open(`https://blockstream.info/address/${paymentRequest.bitcoin_addresses?.address}`, '_blank')}
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on Blockchain</span>
            </Button>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded">
            <h4 className="font-semibold text-primary mb-2">Payment Instructions</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Send exactly {btcAmount.toFixed(8)} BTC to the address above</li>
              <li>• Payment will be held in escrow until delivery confirmation</li>
              <li>• You can dispute the order if there are any issues</li>
              <li>• Funds auto-release to vendor after 7 days if no disputes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatus;