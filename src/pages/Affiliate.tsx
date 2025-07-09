import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  ArrowLeft, 
  Share2, 
  DollarSign, 
  Users, 
  TrendingUp,
  Copy,
  Bitcoin,
  Gift,
  Target,
  Calendar,
  ExternalLink,
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AffiliateProgram {
  id: string;
  referral_code: string;
  commission_rate: number;
  total_referrals: number;
  total_earnings_btc: number;
  is_active: boolean;
  created_at: string;
}

interface AffiliateReferral {
  id: string;
  referred_user_id: string;
  referral_code: string;
  order_id?: string;
  commission_btc?: number;
  status: string;
  created_at: string;
  confirmed_at?: string;
}

const Affiliate = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [affiliateProgram, setAffiliateProgram] = useState<AffiliateProgram | null>(null);
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [customCode, setCustomCode] = useState('');

  useEffect(() => {
    if (user) {
      loadAffiliateData();
    }
  }, [user]);

  const loadAffiliateData = async () => {
    try {
      setLoading(true);
      
      // Load affiliate program
      const { data: programData, error: programError } = await supabase
        .from('affiliate_programs')
        .select('*')
        .eq('affiliate_id', user.id)
        .single();

      if (programError && programError.code !== 'PGRST116') {
        throw programError;
      }

      setAffiliateProgram(programData);

      // Load referrals if program exists
      if (programData) {
        const { data: referralsData, error: referralsError } = await supabase
          .from('affiliate_referrals')
          .select('*')
          .eq('affiliate_id', user.id)
          .order('created_at', { ascending: false });

        if (referralsError) throw referralsError;
        setReferrals(referralsData || []);
      }
    } catch (error) {
      console.error('Error loading affiliate data:', error);
      toast.error('Failed to load affiliate data');
    } finally {
      setLoading(false);
    }
  };

  const createAffiliateProgram = async () => {
    if (!user) return;

    try {
      const referralCode = customCode.trim() || generateReferralCode();
      
      const { error } = await supabase
        .from('affiliate_programs')
        .insert({
          affiliate_id: user.id,
          referral_code: referralCode,
          commission_rate: 0.05, // 5% default
          is_active: true
        });

      if (error) throw error;

      toast.success('Affiliate program created successfully!');
      loadAffiliateData();
    } catch (error) {
      console.error('Error creating affiliate program:', error);
      toast.error('Failed to create affiliate program');
    }
  };

  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const copyReferralLink = () => {
    if (!affiliateProgram) return;
    
    const referralLink = `${window.location.origin}?ref=${affiliateProgram.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const copyReferralCode = () => {
    if (!affiliateProgram) return;
    
    navigator.clipboard.writeText(affiliateProgram.referral_code);
    toast.success('Referral code copied to clipboard!');
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading affiliate program...</div>
      </div>
    );
  }

  if (!affiliateProgram) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Link>
            </Button>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <Share2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">{t('affiliate.title')}</CardTitle>
              <p className="text-muted-foreground">
                {t('affiliate.subtitle')}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <Bitcoin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">5% Commission</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn 5% in Bitcoin on every purchase
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Lifetime Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn from all future purchases
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Real-time Stats</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your performance live
                  </p>
                </div>
              </div>

              {/* Custom Referral Code */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-code">Custom Referral Code (Optional)</Label>
                  <Input
                    id="custom-code"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                    placeholder="Enter custom code or leave blank for auto-generated"
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use letters and numbers only. If blank, we'll generate one for you.
                  </p>
                </div>

                <Button onClick={createAffiliateProgram} className="w-full">
                  <Gift className="h-4 w-4 mr-2" />
                  Create Affiliate Account
                </Button>
              </div>

              {/* Terms */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Program Terms:</strong> Minimum payout is 0.001 BTC. 
                  Commissions are paid monthly. Referrals must result in completed purchases to qualify.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const pendingEarnings = referrals
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + (r.commission_btc || 0), 0);

  const confirmedEarnings = referrals
    .filter(r => r.status === 'confirmed' || r.status === 'paid')
    .reduce((sum, r) => sum + (r.commission_btc || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <Share2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{t('affiliate.title')}</h1>
              <p className="text-muted-foreground">
                {t('affiliate.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{affiliateProgram.total_referrals}</div>
                  <p className="text-xs text-muted-foreground">
                    Lifetime referrals
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <Bitcoin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{affiliateProgram.total_earnings_btc.toFixed(6)}</div>
                  <p className="text-xs text-muted-foreground">
                    BTC earned all-time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingEarnings.toFixed(6)}</div>
                  <p className="text-xs text-muted-foreground">
                    BTC pending confirmation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(affiliateProgram.commission_rate * 100).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Per successful referral
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Referral Link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg border">
                    <code className="text-sm break-all">
                      {window.location.origin}?ref={affiliateProgram.referral_code}
                    </code>
                  </div>
                  <Button onClick={copyReferralLink} className="w-full">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Referral Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg border text-center">
                    <code className="text-2xl font-bold">
                      {affiliateProgram.referral_code}
                    </code>
                  </div>
                  <Button onClick={copyReferralCode} variant="outline" className="w-full">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No referrals yet</h3>
                    <p className="text-muted-foreground">
                      Share your referral link to start earning commissions!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Referral #{referral.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(referral.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            referral.status === 'confirmed' ? 'default' :
                            referral.status === 'paid' ? 'default' :
                            'secondary'
                          }>
                            {referral.status}
                          </Badge>
                          {referral.commission_btc && (
                            <p className="text-sm font-medium mt-1">
                              {referral.commission_btc.toFixed(6)} BTC
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Materials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use these ready-made materials to promote OpesMarket:
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Banner Images
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Social Media Posts
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Email Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <Target className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <strong>Target crypto enthusiasts</strong> who value privacy and security
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Share2 className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <strong>Share on social media</strong> highlighting our anonymous features
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Gift className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <strong>Offer incentives</strong> to encourage signups through your link
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payout Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Payout Schedule:</strong> Commissions are paid monthly on the 1st of each month. 
                    Minimum payout threshold is 0.001 BTC.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Next Payout</Label>
                    <p className="text-2xl font-bold">{confirmedEarnings.toFixed(6)} BTC</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Payout Progress</Label>
                    <Progress value={(confirmedEarnings / 0.001) * 100} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {((confirmedEarnings / 0.001) * 100).toFixed(1)}% to minimum payout
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Affiliate;