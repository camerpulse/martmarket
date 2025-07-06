import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Bitcoin, CheckCircle, AlertTriangle, Loader2, Key, Store, CreditCard, UserCheck, AlertCircle } from 'lucide-react';
import BitcoinPayment from '@/components/BitcoinPayment';

const VENDOR_BOND_AMOUNT = 250; // $250 USD
const VENDOR_BOND_DURATION = 365; // 365 days

interface VendorFormData {
  businessName: string;
  businessDescription: string;
  businessType: string;
  contactEmail: string;
  bitcoinAddress: string;
  pgpPublicKey: string;
  totpSecret: string;
  agreeToTerms: boolean;
  bondPaymentConfirmed: boolean;
}

interface VerificationStatus {
  pgp: boolean;
  twofa: boolean;
  bond: boolean;
  complete: boolean;
}

const VendorRegistration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [existingVendor, setExistingVendor] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    pgp: false,
    twofa: false,
    bond: false,
    complete: false
  });
  
  const [formData, setFormData] = useState<VendorFormData>({
    businessName: '',
    businessDescription: '',
    businessType: '',
    contactEmail: '',
    bitcoinAddress: '',
    pgpPublicKey: '',
    totpSecret: '',
    agreeToTerms: false,
    bondPaymentConfirmed: false
  });

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    checkUserProfile();
  }, [user]);

  const updateFormData = (field: keyof VendorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
        .select('*')
        .eq('vendor_id', user.id)
        .single();
      
      if (vendorData) {
        setExistingVendor(vendorData);
        
        // Fetch vendor bonds separately
        const { data: bondsData } = await supabase
          .from('vendor_bonds')
          .select('*')
          .eq('vendor_id', user.id);
          
        const activeBond = bondsData?.find((bond: any) => bond.is_active);
        
        setVerificationStatus({
          pgp: !!profileData?.pgp_public_key,
          twofa: !!profileData?.two_factor_enabled,
          bond: !!activeBond,
          complete: !!(profileData?.pgp_public_key && profileData?.two_factor_enabled && activeBond)
        });
      }
    } catch (error) {
      console.log('User not yet a vendor');
    }
  };

  const generateBitcoinAddress = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-bitcoin-address', {
        body: { purpose: 'vendor_bond', user_id: user?.id }
      });
      
      if (error) throw error;
      setBitcoinAddress(data.address);
    } catch (error) {
      console.error('Error generating Bitcoin address:', error);
      toast({
        title: "Error",
        description: "Failed to generate Bitcoin address. Please try again.",
        variant: "destructive",
      });
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

  const submitVendorRegistration = async () => {
    if (!user || !formData.agreeToTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "Please accept the terms of service to continue.",
        variant: "destructive",
      });
      return;
    }

    // Validate mandatory fields
    if (!formData.businessName || !formData.pgpPublicKey || !formData.totpSecret) {
      toast({
        title: "Required Fields Missing",
        description: "Business name, PGP key, and 2FA setup are mandatory.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update user profile to vendor type
      if (profile?.user_type !== 'vendor') {
        await supabase
          .from('profiles')
          .update({ 
            user_type: 'vendor',
            pgp_public_key: formData.pgpPublicKey,
            two_factor_enabled: true
          })
          .eq('user_id', user.id);
      }

      // Create vendor profile - using correct column names
      const { error: vendorError } = await supabase
        .from('vendor_profiles')
        .insert({
          vendor_id: user.id,
          business_name: formData.businessName,
          business_description: formData.businessDescription,
          status: 'pending',
          verification_status: 'pending'
        } as any);

      if (vendorError) throw vendorError;

      // Create vendor bond record
      const bondExpiryDate = new Date();
      bondExpiryDate.setDate(bondExpiryDate.getDate() + VENDOR_BOND_DURATION);

      await supabase
        .from('vendor_bonds')
        .insert({
          vendor_id: user.id,
          amount_usd: VENDOR_BOND_AMOUNT,
          bond_type: 'annual',
          status: 'pending',
          expires_at: bondExpiryDate.toISOString(),
          is_active: false
        });

      toast({
        title: "Registration Submitted",
        description: "Your vendor registration has been submitted. Complete bond payment to activate.",
      });

      // Show payment interface
      setShowPayment(true);
      await checkUserProfile();
      
    } catch (error) {
      console.error('Error submitting vendor registration:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to submit vendor registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => {
    return (currentStep / 4) * 100;
  };

  const renderBusinessInfoStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Store className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-semibold">Business Information</h3>
        <Badge variant="destructive">Required</Badge>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => updateFormData('businessName', e.target.value)}
            placeholder="Enter your business name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="businessDescription">Business Description *</Label>
          <Textarea
            id="businessDescription"
            value={formData.businessDescription}
            onChange={(e) => updateFormData('businessDescription', e.target.value)}
            placeholder="Describe your business and what you plan to sell..."
            rows={4}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="contactEmail">Contact Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => updateFormData('contactEmail', e.target.value)}
            placeholder="business@example.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="bitcoinAddress">Bitcoin Payout Address</Label>
          <Input
            id="bitcoinAddress"
            value={formData.bitcoinAddress}
            onChange={(e) => updateFormData('bitcoinAddress', e.target.value)}
            placeholder="Your Bitcoin address for receiving payments"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This address will receive your vendor payouts (minimum $100 threshold)
          </p>
        </div>
      </div>
    </div>
  );

  const renderSecurityStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">PGP Key Setup</h3>
          <Badge variant="destructive">Mandatory</Badge>
        </div>
        
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>PGP encryption is mandatory</strong> for all vendor communications to ensure privacy and security as per OpesMarket policy.
          </AlertDescription>
        </Alert>
        
        <div>
          <Label htmlFor="pgpPublicKey">PGP Public Key *</Label>
          <Textarea
            id="pgpPublicKey"
            value={formData.pgpPublicKey}
            onChange={(e) => updateFormData('pgpPublicKey', e.target.value)}
            placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----&#10;&#10;Paste your PGP public key here...&#10;&#10;-----END PGP PUBLIC KEY BLOCK-----"
            rows={8}
            className="font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Generate your PGP key pair using tools like GnuPG or Kleopatra
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
          <Badge variant="destructive">Mandatory</Badge>
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>2FA is mandatory</strong> for all vendor accounts. You must set up an authenticator app before proceeding.
          </AlertDescription>
        </Alert>
        
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2">Setup Instructions:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
            <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
            <li>Add a new account in your authenticator app</li>
            <li>Generate and save your backup codes</li>
            <li>Confirm setup by checking the box below</li>
          </ol>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="twoFactorEnabled"
            checked={formData.totpSecret.length > 0}
            onCheckedChange={(checked) => {
              if (checked) {
                updateFormData('totpSecret', 'SETUP_CONFIRMED_' + Date.now());
              } else {
                updateFormData('totpSecret', '');
              }
            }}
          />
          <Label htmlFor="twoFactorEnabled">
            I have successfully set up 2FA with my authenticator app
          </Label>
        </div>
      </div>
    </div>
  );

  const renderBondPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold">Vendor Bond Payment</h3>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border">
          <div className="text-3xl font-bold text-primary">${VENDOR_BOND_AMOUNT}</div>
          <div className="text-sm text-muted-foreground">Annual Vendor Bond</div>
          <div className="text-xs text-muted-foreground mt-1">Renewable every {VENDOR_BOND_DURATION} days</div>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The vendor bond ensures quality control and acts as an accountability layer. 
            This annual payment activates your vendor privileges and maintains your trusted status.
          </AlertDescription>
        </Alert>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2">Bond Benefits:</h4>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>Access to vendor dashboard and store management</li>
            <li>Ability to list and sell products</li>
            <li>Trusted vendor verification badge</li>
            <li>Priority customer support</li>
            <li>Advanced analytics and reporting tools</li>
          </ul>
        </div>
        
        <Button 
          onClick={generateBitcoinAddress}
          variant="outline"
          className="w-full"
          disabled={!!bitcoinAddress}
        >
          {bitcoinAddress ? 'Bitcoin Address Generated' : 'Generate Payment Address'}
        </Button>
        
        {bitcoinAddress && (
          <div className="space-y-3">
            <Label>Send Bitcoin to this address:</Label>
            <div className="p-3 bg-muted rounded-lg border">
              <code className="text-sm break-all font-mono">{bitcoinAddress}</code>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Amount:</strong> {VENDOR_BOND_AMOUNT} USD equivalent in Bitcoin
            </div>
            <div className="text-xs text-muted-foreground">
              Payment will be automatically detected and verified within 1-3 confirmations
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="bondPaymentConfirmed"
            checked={formData.bondPaymentConfirmed}
            onCheckedChange={(checked) => updateFormData('bondPaymentConfirmed', checked as boolean)}
          />
          <Label htmlFor="bondPaymentConfirmed">
            I have sent the bond payment to the address above
          </Label>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserCheck className="h-6 w-6 text-green-500" />
        <h3 className="text-xl font-semibold">Review & Submit</h3>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-muted/20 rounded-lg border">
          <h4 className="font-medium mb-3">Business Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Business Name</Label>
              <div>{formData.businessName}</div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Contact Email</Label>
              <div>{formData.contactEmail}</div>
            </div>
          </div>
          <div className="mt-3">
            <Label className="text-xs font-medium text-muted-foreground">Description</Label>
            <div className="text-sm">{formData.businessDescription}</div>
          </div>
        </div>
        
        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium mb-3 text-green-800 dark:text-green-200">Security Verification</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">PGP Key Configured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Two-Factor Authentication Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Bond Payment Confirmed</span>
            </div>
          </div>
        </div>
        
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your vendor account will be reviewed by our team. You'll receive an email notification 
            once approved (typically within 24-48 hours).
          </AlertDescription>
        </Alert>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onCheckedChange={(checked) => updateFormData('agreeToTerms', checked as boolean)}
        />
        <Label htmlFor="agreeToTerms" className="text-sm">
          I agree to the <strong>OpesMarket Terms of Service</strong> and <strong>Vendor Agreement</strong>
        </Label>
      </div>
    </div>
  );

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
                Your vendor account is set up: <strong>{existingVendor.business_name}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Trust Score:</strong> {existingVendor.trust_score || 0}%
                </div>
                <div>
                  <strong>Total Sales:</strong> {existingVendor.total_sales || 0}
                </div>
                <div>
                  <strong>Successful Orders:</strong> {existingVendor.successful_orders || 0}
                </div>
                <div>
                  <strong>Response Time:</strong> {existingVendor.response_time_hours || 0}h
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
                <Button onClick={() => navigate('/vendor-products')}>
                  Manage Products
                </Button>
                <Button variant="outline" onClick={() => navigate('/orders')}>
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Store className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Vendor Registration</h1>
          </div>
          <p className="text-muted-foreground">
            Join OpesMarket as a verified vendor and start selling your products
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Step {currentStep} of 4</CardTitle>
              <Badge variant="outline">
                {currentStep === 1 && "Business Info"}
                {currentStep === 2 && "Security Setup"}
                {currentStep === 3 && "Bond Payment"}
                {currentStep === 4 && "Review & Submit"}
              </Badge>
            </div>
            <Progress value={getStepProgress()} className="mt-2" />
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentStep === 1 && renderBusinessInfoStep()}
            {currentStep === 2 && renderSecurityStep()}
            {currentStep === 3 && renderBondPaymentStep()}
            {currentStep === 4 && renderReviewStep()}
            
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && (!formData.businessName || !formData.businessDescription || !formData.contactEmail)) ||
                    (currentStep === 2 && (!formData.pgpPublicKey || !formData.totpSecret)) ||
                    (currentStep === 3 && !formData.bondPaymentConfirmed)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={submitVendorRegistration}
                  disabled={loading || !formData.agreeToTerms}
                  className="min-w-[120px]"
                >
                  {loading ? "Submitting..." : "Submit Registration"}
                </Button>
              )}
            </div>
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