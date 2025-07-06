import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Bitcoin, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import BitcoinPayment from '@/components/BitcoinPayment';

const VendorRegistration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [existingVendor, setExistingVendor] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    bitcoinAddress: '',
    pgpPublicKey: ''
  });

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    checkUserProfile();
  }, [user]);

  const checkUserProfile = async () => {
    try {
      // Check user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setProfile(profileData);

      // Check if already a vendor
      const { data: vendorData } = await supabase
        .from('vendor_profiles')
        .select('*, vendor_bonds(*)')
        .eq('vendor_id', user.id)
        .single();
      
      if (vendorData) {
        setExistingVendor(vendorData);
      }
    } catch (error) {
      console.log('User not yet a vendor');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.storeName.trim()) {
      toast({
        title: "Store name required",
        description: "Please enter your store name.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // First, update user profile to vendor type if needed
      if (profile?.user_type !== 'vendor') {
        await supabase
          .from('profiles')
          .update({ user_type: 'vendor' })
          .eq('user_id', user.id);
      }

      // Create vendor profile
      const { error: vendorError } = await supabase
        .from('vendor_profiles')
        .insert({
          vendor_id: user.id,
          store_name: formData.storeName,
          description: formData.description,
          bitcoin_address: formData.bitcoinAddress
        });

      if (vendorError) throw vendorError;

      // Update PGP key if provided
      if (formData.pgpPublicKey.trim()) {
        await supabase
          .from('profiles')
          .update({ pgp_public_key: formData.pgpPublicKey })
          .eq('user_id', user.id);
      }

      toast({
        title: "Vendor profile created!",
        description: "Now proceed with bond payment to activate your vendor account."
      });

      // Show payment interface
      setShowPayment(true);
      
      // Refresh data
      await checkUserProfile();
      
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBondPayment = () => {
    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    toast({
      title: "Bond payment received!",
      description: "Your vendor account is now active."
    });
    checkUserProfile(); // Refresh vendor status
    setShowPayment(false);
  };

  // If already a vendor, show status
  if (existingVendor) {
    const activeBond = existingVendor.vendor_bonds?.find((bond: any) => bond.is_active);
    
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-bitcoin mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
            <p className="text-muted-foreground">Manage your OpesMarket store</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Vendor Profile Active
              </CardTitle>
              <CardDescription>
                Your vendor account is set up: <strong>{existingVendor.store_name}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Trust Score:</strong> {existingVendor.trust_score}%
                </div>
                <div>
                  <strong>Total Sales:</strong> {existingVendor.total_sales}
                </div>
                <div>
                  <strong>Successful Orders:</strong> {existingVendor.successful_orders}
                </div>
                <div>
                  <strong>Response Time:</strong> {existingVendor.response_time_hours}h
                </div>
              </div>
              
              {activeBond ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Bond Status: <strong>Active</strong> (Expires: {new Date(activeBond.expires_at).toLocaleDateString()})
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Bond payment required to activate vendor privileges.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-2">
                <Button onClick={() => navigate('/vendor/products')}>
                  Manage Products
                </Button>
                <Button variant="outline" onClick={() => navigate('/vendor/orders')}>
                  View Orders
                </Button>
                {!activeBond && (
                  <Button variant="default" onClick={handleBondPayment}>
                    <Bitcoin className="h-4 w-4 mr-2" />
                    Pay Bond ($250)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bitcoin Payment Interface */}
          {showPayment && !activeBond && (
            <div className="mt-6">
              <BitcoinPayment
                purpose="vendor_bond"
                onPaymentComplete={handlePaymentComplete}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-bitcoin mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Become a Vendor</h1>
          <p className="text-muted-foreground">Join OpesMarket as a verified vendor</p>
        </div>

        <Alert className="mb-6">
          <Bitcoin className="h-4 w-4" />
          <AlertDescription>
            <strong>Annual Vendor Bond: $250</strong> - Required to maintain vendor status and ensure quality standards.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Registration</CardTitle>
            <CardDescription>
              Complete your vendor profile to proceed with bond payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, storeName: e.target.value }))}
                  placeholder="Enter your store name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Store Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your store and products..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bitcoinAddress">Bitcoin Address (for payouts)</Label>
                <Input
                  id="bitcoinAddress"
                  value={formData.bitcoinAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, bitcoinAddress: e.target.value }))}
                  placeholder="Your Bitcoin address for receiving payments"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pgpKey">PGP Public Key (recommended)</Label>
                <Textarea
                  id="pgpKey"
                  value={formData.pgpPublicKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, pgpPublicKey: e.target.value }))}
                  placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  PGP encryption ensures secure communications with buyers
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Vendor Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bitcoin Payment Interface */}
        {showPayment && (
          <div className="mt-6">
            <BitcoinPayment
              purpose="vendor_bond"
              onPaymentComplete={handlePaymentComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorRegistration;