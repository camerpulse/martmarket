import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, Shield, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentStatusProps {
  orderId: string;
  buyerId: string;
  vendorId: string;
}

interface EscrowTransaction {
  id: string;
  status: string;
  amount_satoshis: number;
  platform_fee_satoshis: number;
  vendor_fee_satoshis: number;
  escrow_address: string;
  funded_at: string | null;
  released_at: string | null;
  auto_release_at: string | null;
  release_txid: string | null;
}

export function PaymentStatus({ orderId, buyerId, vendorId }: PaymentStatusProps) {
  const [escrow, setEscrow] = useState<EscrowTransaction | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [timeUntilAutoRelease, setTimeUntilAutoRelease] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadEscrowData();
    const interval = setInterval(loadEscrowData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (escrow?.auto_release_at && escrow.status === 'funded') {
      const interval = setInterval(updateAutoReleaseTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [escrow?.auto_release_at, escrow?.status]);

  const loadEscrowData = async () => {
    try {
      const { data, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
        console.error('Error loading escrow data:', error);
        return;
      }

      if (data) {
        setEscrow(data);
      }
    } catch (error) {
      console.error('Error loading escrow data:', error);
    }
  };

  const updateAutoReleaseTimer = () => {
    if (!escrow?.auto_release_at) return;

    const releaseTime = new Date(escrow.auto_release_at).getTime();
    const now = Date.now();
    const diff = releaseTime - now;

    if (diff <= 0) {
      setTimeUntilAutoRelease('Auto-release available');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    setTimeUntilAutoRelease(`${days}d ${hours}h ${minutes}m`);
  };

  const releaseEscrow = async () => {
    if (!escrow) return;

    setIsReleasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('payment-processor', {
        body: {
          action: 'release_escrow',
          escrow_id: escrow.id,
          release_type: 'manual'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Escrow Released",
          description: "Payment has been released to the vendor.",
        });
        loadEscrowData(); // Refresh data
      }
    } catch (error: any) {
      console.error('Error releasing escrow:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to release escrow",
        variant: "destructive",
      });
    } finally {
      setIsReleasing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-muted text-muted-foreground';
      case 'funded':
        return 'bg-warning text-warning-foreground';
      case 'released':
        return 'bg-success text-success-foreground';
      case 'disputed':
        return 'bg-destructive text-destructive-foreground';
      case 'refunded':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'funded':
        return <Shield className="h-4 w-4" />;
      case 'released':
        return <CheckCircle className="h-4 w-4" />;
      case 'disputed':
        return <AlertTriangle className="h-4 w-4" />;
      case 'refunded':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatBTC = (satoshis: number) => {
    return (satoshis / 100000000).toFixed(8);
  };

  if (!escrow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>No escrow transaction found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const canRelease = escrow.status === 'funded' && buyerId === buyerId; // Buyer can release
  const isCompleted = escrow.status === 'released';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Escrow Status
          {getStatusIcon(escrow.status)}
        </CardTitle>
        <CardDescription>
          Secure payment protection for your transaction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Status</span>
          <Badge className={getStatusColor(escrow.status)}>
            {escrow.status.charAt(0).toUpperCase() + escrow.status.slice(1)}
          </Badge>
        </div>

        {/* Amount Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Amount:</span>
            <span className="font-mono">{formatBTC(escrow.amount_satoshis)} BTC</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Platform Fee:</span>
            <span className="font-mono">{formatBTC(escrow.platform_fee_satoshis)} BTC</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Vendor Amount:</span>
            <span className="font-mono">{formatBTC(escrow.vendor_fee_satoshis)} BTC</span>
          </div>
        </div>

        {/* Escrow Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Escrow Address</label>
          <div className="p-2 bg-muted rounded-md font-mono text-xs break-all">
            {escrow.escrow_address}
          </div>
        </div>

        {/* Auto-Release Timer */}
        {escrow.status === 'funded' && escrow.auto_release_at && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Auto-release in:</span>
              <span className="font-mono">{timeUntilAutoRelease}</span>
            </div>
            <Progress 
              value={escrow.auto_release_at ? 
                Math.max(0, 100 - ((new Date(escrow.auto_release_at).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)) * 100) : 0
              } 
              className="h-2" 
            />
          </div>
        )}

        {/* Release Button */}
        {canRelease && (
          <Button 
            onClick={releaseEscrow}
            disabled={isReleasing}
            className="w-full"
          >
            {isReleasing ? "Releasing..." : "Release Payment to Vendor"}
          </Button>
        )}

        {/* Transaction Links */}
        {escrow.release_txid && (
          <div className="flex items-center gap-2 text-sm">
            <span>Release Transaction:</span>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto font-mono text-xs"
              onClick={() => window.open(`https://blockstream.info/tx/${escrow.release_txid}`, '_blank')}
            >
              {escrow.release_txid.substring(0, 16)}...
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}

        {/* Status Timeline */}
        <div className="space-y-2 text-xs text-muted-foreground">
          {escrow.funded_at && (
            <div className="flex justify-between">
              <span>Funded:</span>
              <span>{new Date(escrow.funded_at).toLocaleString()}</span>
            </div>
          )}
          {escrow.released_at && (
            <div className="flex justify-between">
              <span>Released:</span>
              <span>{new Date(escrow.released_at).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Security Notice */}
        {!isCompleted && (
          <div className="p-3 bg-muted/50 rounded-md text-xs">
            <strong>Escrow Protection:</strong> Your payment is held securely until you confirm 
            receipt of goods/services or until the auto-release timer expires.
          </div>
        )}
      </CardContent>
    </Card>
  );
};