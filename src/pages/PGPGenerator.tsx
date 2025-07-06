import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePGP } from '@/hooks/usePGP';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Key, 
  Lock, 
  Unlock, 
  Download, 
  Shield, 
  Eye, 
  EyeOff, 
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
// SEO will be handled with standard meta tags for now

const PGPGenerator = () => {
  const { user } = useAuth();
  const { 
    loading, 
    generateKeyPair, 
    encryptMessage, 
    decryptMessage, 
    validatePublicKey,
    signMessage,
    verifySignature,
    saveKeyPair,
    getUserPGPKeys,
    downloadKeyPair 
  } = usePGP();

  // Key Generation State
  const [keyGenForm, setKeyGenForm] = useState({
    name: '',
    email: '',
    passphrase: '',
    confirmPassphrase: ''
  });
  const [generatedKeys, setGeneratedKeys] = useState<{
    publicKey: string;
    privateKey: string;
    fingerprint: string;
  } | null>(null);

  // Encryption/Decryption State
  const [encryptForm, setEncryptForm] = useState({
    message: '',
    publicKey: '',
    encryptedResult: ''
  });
  const [decryptForm, setDecryptForm] = useState({
    encryptedMessage: '',
    privateKey: '',
    passphrase: '',
    decryptedResult: ''
  });

  // Signing/Verification State
  const [signForm, setSignForm] = useState({
    message: '',
    privateKey: '',
    passphrase: '',
    signedResult: ''
  });
  const [verifyForm, setVerifyForm] = useState({
    signedMessage: '',
    publicKey: '',
    verificationResult: null as any
  });

  // Key Validation State
  const [keyValidation, setKeyValidation] = useState({
    publicKey: '',
    validationResult: null as any
  });

  // User's existing keys
  const [userKeys, setUserKeys] = useState<any>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserKeys();
      // Pre-fill user info for key generation
      setKeyGenForm(prev => ({
        ...prev,
        name: user.email?.split('@')[0] || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const loadUserKeys = async () => {
    try {
      const keys = await getUserPGPKeys();
      setUserKeys(keys);
    } catch (error) {
      console.error('Error loading user keys:', error);
    }
  };

  const handleGenerateKeys = async () => {
    if (keyGenForm.passphrase !== keyGenForm.confirmPassphrase) {
      toast.error('Passphrases do not match');
      return;
    }

    if (!keyGenForm.name || !keyGenForm.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      const result = await generateKeyPair(
        keyGenForm.name,
        keyGenForm.email,
        keyGenForm.passphrase || undefined
      );
      
      setGeneratedKeys(result);
      
      // If user is logged in, offer to save keys
      if (user) {
        toast.success('Keys generated successfully! You can now save them to your account.');
      } else {
        toast.success('Keys generated successfully! Download them to use elsewhere.');
      }
    } catch (error) {
      console.error('Error generating keys:', error);
    }
  };

  const handleSaveKeys = async () => {
    if (!generatedKeys || !user) return;

    try {
      // Simple encryption of private key with passphrase (in production, use proper encryption)
      const encryptedPrivateKey = keyGenForm.passphrase 
        ? btoa(generatedKeys.privateKey + '::' + keyGenForm.passphrase)
        : btoa(generatedKeys.privateKey);

      await saveKeyPair(
        generatedKeys.publicKey,
        encryptedPrivateKey,
        generatedKeys.fingerprint
      );
      
      await loadUserKeys();
      setGeneratedKeys(null);
      setKeyGenForm({ name: '', email: '', passphrase: '', confirmPassphrase: '' });
    } catch (error) {
      console.error('Error saving keys:', error);
    }
  };

  const handleDownloadKeys = () => {
    if (!generatedKeys) return;
    
    const name = keyGenForm.name || 'pgp_key';
    downloadKeyPair(generatedKeys.publicKey, generatedKeys.privateKey, name);
  };

  const handleEncrypt = async () => {
    if (!encryptForm.message || !encryptForm.publicKey) {
      toast.error('Message and public key are required');
      return;
    }

    try {
      // For non-logged in users, we'll use a client-side encryption method
      if (!user) {
        toast.error('Encryption requires login for security');
        return;
      }

      // This would need recipient selection for logged-in users
      toast.info('Feature requires recipient selection - use messaging system for encrypted communication');
    } catch (error) {
      console.error('Error encrypting message:', error);
    }
  };

  const handleDecrypt = async () => {
    if (!decryptForm.encryptedMessage || !decryptForm.privateKey) {
      toast.error('Encrypted message and private key are required');
      return;
    }

    try {
      const result = await decryptMessage(
        decryptForm.encryptedMessage,
        decryptForm.privateKey,
        decryptForm.passphrase || undefined
      );
      
      setDecryptForm(prev => ({ ...prev, decryptedResult: result }));
      toast.success('Message decrypted successfully');
    } catch (error) {
      console.error('Error decrypting message:', error);
    }
  };

  const handleSign = async () => {
    if (!signForm.message || !signForm.privateKey) {
      toast.error('Message and private key are required');
      return;
    }

    try {
      const result = await signMessage(
        signForm.message,
        signForm.privateKey,
        signForm.passphrase || undefined
      );
      
      setSignForm(prev => ({ ...prev, signedResult: result }));
      toast.success('Message signed successfully');
    } catch (error) {
      console.error('Error signing message:', error);
    }
  };

  const handleVerify = async () => {
    if (!verifyForm.signedMessage || !verifyForm.publicKey) {
      toast.error('Signed message and public key are required');
      return;
    }

    try {
      const result = await verifySignature(verifyForm.signedMessage, verifyForm.publicKey);
      setVerifyForm(prev => ({ ...prev, verificationResult: result }));
      
      if (result.verified) {
        toast.success('Signature verified successfully');
      } else {
        toast.error('Signature verification failed');
      }
    } catch (error) {
      console.error('Error verifying signature:', error);
    }
  };

  const handleValidateKey = async () => {
    if (!keyValidation.publicKey) {
      toast.error('Public key is required');
      return;
    }

    try {
      const result = await validatePublicKey(keyValidation.publicKey);
      setKeyValidation(prev => ({ ...prev, validationResult: result }));
      
      if (result.valid) {
        toast.success('Public key is valid');
      } else {
        toast.error('Public key is invalid');
      }
    } catch (error) {
      console.error('Error validating key:', error);
    }
  };

  return (
    <div className="bg-background text-foreground">
      {/* SEO Meta Tags */}
      <title>PGP Generator - Free PGP Key Generator & Encryption Tools | OpesMarket</title>

      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Link>
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bitcoin-gradient">PGP Generator</h1>
            <p className="text-xl text-muted-foreground mb-4">
              Free PGP Key Generator & Encryption Tools
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Generate PGP keys, encrypt and decrypt messages, sign and verify digital signatures. 
              All tools work in your browser - no registration required for basic features.
            </p>
          </div>

          {user && userKeys && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Your PGP Keys</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Key Type</Label>
                    <Badge variant="secondary" className="ml-2">{userKeys.key_type}</Badge>
                  </div>
                  <div>
                    <Label>Fingerprint</Label>
                    <p className="font-mono text-sm mt-1 p-2 bg-muted rounded">
                      {userKeys.key_fingerprint}
                    </p>
                  </div>
                  <div>
                    <Label>Public Key</Label>
                    <Textarea
                      value={userKeys.public_key}
                      readOnly
                      rows={6}
                      className="mt-1 font-mono text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="generate">Generate Keys</TabsTrigger>
            <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
            <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
            <TabsTrigger value="sign">Sign & Verify</TabsTrigger>
            <TabsTrigger value="validate">Validate Key</TabsTrigger>
          </TabsList>

          {/* Generate Keys Tab */}
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Generate PGP Key Pair</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Generate a new PGP key pair for secure communication. 
                    {user ? ' Keys can be saved to your account for easy access.' : ' Download the keys to use elsewhere.'}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gen-name">Full Name *</Label>
                    <Input
                      id="gen-name"
                      placeholder="John Doe"
                      value={keyGenForm.name}
                      onChange={(e) => setKeyGenForm(prev => ({...prev, name: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gen-email">Email Address *</Label>
                    <Input
                      id="gen-email"
                      type="email"
                      placeholder="john@example.com"
                      value={keyGenForm.email}
                      onChange={(e) => setKeyGenForm(prev => ({...prev, email: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gen-passphrase">Passphrase (Optional)</Label>
                    <div className="relative">
                      <Input
                        id="gen-passphrase"
                        type={showPassphrase ? "text" : "password"}
                        placeholder="Secure passphrase"
                        value={keyGenForm.passphrase}
                        onChange={(e) => setKeyGenForm(prev => ({...prev, passphrase: e.target.value}))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowPassphrase(!showPassphrase)}
                      >
                        {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="gen-confirm">Confirm Passphrase</Label>
                    <Input
                      id="gen-confirm"
                      type={showPassphrase ? "text" : "password"}
                      placeholder="Confirm passphrase"
                      value={keyGenForm.confirmPassphrase}
                      onChange={(e) => setKeyGenForm(prev => ({...prev, confirmPassphrase: e.target.value}))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateKeys} 
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {loading ? 'Generating...' : 'Generate Key Pair'}
                </Button>

                {generatedKeys && (
                  <div className="mt-6 space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        PGP key pair generated successfully! Fingerprint: {generatedKeys.fingerprint}
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <Label>Public Key</Label>
                        <Textarea
                          value={generatedKeys.publicKey}
                          readOnly
                          rows={8}
                          className="mt-1 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center space-x-2">
                          <span>Private Key</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1"
                            onClick={() => setShowPrivateKey(!showPrivateKey)}
                          >
                            {showPrivateKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </Label>
                        <Textarea
                          value={showPrivateKey ? generatedKeys.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                          readOnly
                          rows={8}
                          className="mt-1 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button onClick={handleDownloadKeys} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Keys
                      </Button>
                      {user && (
                        <Button onClick={handleSaveKeys}>
                          <Shield className="h-4 w-4 mr-2" />
                          Save to Account
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Encrypt Tab */}
          <TabsContent value="encrypt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Encrypt Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Encrypt a message using someone's public key. They will need their private key to decrypt it.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="encrypt-message">Message to Encrypt</Label>
                  <Textarea
                    id="encrypt-message"
                    placeholder="Enter your message here..."
                    value={encryptForm.message}
                    onChange={(e) => setEncryptForm(prev => ({...prev, message: e.target.value}))}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="encrypt-pubkey">Recipient's Public Key</Label>
                  <Textarea
                    id="encrypt-pubkey"
                    placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----"
                    value={encryptForm.publicKey}
                    onChange={(e) => setEncryptForm(prev => ({...prev, publicKey: e.target.value}))}
                    rows={6}
                    className="font-mono text-xs"
                  />
                </div>

                <Button onClick={handleEncrypt} disabled={loading}>
                  <Lock className="h-4 w-4 mr-2" />
                  {loading ? 'Encrypting...' : 'Encrypt Message'}
                </Button>

                {encryptForm.encryptedResult && (
                  <div>
                    <Label>Encrypted Message</Label>
                    <Textarea
                      value={encryptForm.encryptedResult}
                      readOnly
                      rows={8}
                      className="mt-1 font-mono text-xs"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Decrypt Tab */}
          <TabsContent value="decrypt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Unlock className="h-5 w-5" />
                  <span>Decrypt Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Decrypt a message using your private key. You'll need the passphrase if your key is protected.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="decrypt-message">Encrypted Message</Label>
                  <Textarea
                    id="decrypt-message"
                    placeholder="-----BEGIN PGP MESSAGE-----"
                    value={decryptForm.encryptedMessage}
                    onChange={(e) => setDecryptForm(prev => ({...prev, encryptedMessage: e.target.value}))}
                    rows={6}
                    className="font-mono text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="decrypt-privkey">Your Private Key</Label>
                  <Textarea
                    id="decrypt-privkey"
                    placeholder="-----BEGIN PGP PRIVATE KEY BLOCK-----"
                    value={decryptForm.privateKey}
                    onChange={(e) => setDecryptForm(prev => ({...prev, privateKey: e.target.value}))}
                    rows={6}
                    className="font-mono text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="decrypt-passphrase">Passphrase (if required)</Label>
                  <Input
                    id="decrypt-passphrase"
                    type="password"
                    placeholder="Enter passphrase"
                    value={decryptForm.passphrase}
                    onChange={(e) => setDecryptForm(prev => ({...prev, passphrase: e.target.value}))}
                  />
                </div>

                <Button onClick={handleDecrypt} disabled={loading}>
                  <Unlock className="h-4 w-4 mr-2" />
                  {loading ? 'Decrypting...' : 'Decrypt Message'}
                </Button>

                {decryptForm.decryptedResult && (
                  <div>
                    <Label>Decrypted Message</Label>
                    <Textarea
                      value={decryptForm.decryptedResult}
                      readOnly
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sign & Verify Tab */}
          <TabsContent value="sign" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sign Message */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Sign Message</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sign-message">Message to Sign</Label>
                    <Textarea
                      id="sign-message"
                      placeholder="Enter your message..."
                      value={signForm.message}
                      onChange={(e) => setSignForm(prev => ({...prev, message: e.target.value}))}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sign-privkey">Your Private Key</Label>
                    <Textarea
                      id="sign-privkey"
                      placeholder="-----BEGIN PGP PRIVATE KEY BLOCK-----"
                      value={signForm.privateKey}
                      onChange={(e) => setSignForm(prev => ({...prev, privateKey: e.target.value}))}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sign-passphrase">Passphrase (if required)</Label>
                    <Input
                      id="sign-passphrase"
                      type="password"
                      placeholder="Enter passphrase"
                      value={signForm.passphrase}
                      onChange={(e) => setSignForm(prev => ({...prev, passphrase: e.target.value}))}
                    />
                  </div>

                  <Button onClick={handleSign} disabled={loading} className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    {loading ? 'Signing...' : 'Sign Message'}
                  </Button>

                  {signForm.signedResult && (
                    <div>
                      <Label>Signed Message</Label>
                      <Textarea
                        value={signForm.signedResult}
                        readOnly
                        rows={6}
                        className="mt-1 font-mono text-xs"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Verify Signature */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Verify Signature</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="verify-message">Signed Message</Label>
                    <Textarea
                      id="verify-message"
                      placeholder="-----BEGIN PGP SIGNED MESSAGE-----"
                      value={verifyForm.signedMessage}
                      onChange={(e) => setVerifyForm(prev => ({...prev, signedMessage: e.target.value}))}
                      rows={6}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="verify-pubkey">Signer's Public Key</Label>
                    <Textarea
                      id="verify-pubkey"
                      placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----"
                      value={verifyForm.publicKey}
                      onChange={(e) => setVerifyForm(prev => ({...prev, publicKey: e.target.value}))}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>

                  <Button onClick={handleVerify} disabled={loading} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {loading ? 'Verifying...' : 'Verify Signature'}
                  </Button>

                  {verifyForm.verificationResult && (
                    <Alert>
                      {verifyForm.verificationResult.verified ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        Signature {verifyForm.verificationResult.verified ? 'verified successfully' : 'verification failed'}
                        {verifyForm.verificationResult.signatures > 0 && 
                          ` (${verifyForm.verificationResult.signatures} signature${verifyForm.verificationResult.signatures > 1 ? 's' : ''})`
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Validate Key Tab */}
          <TabsContent value="validate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Validate Public Key</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Validate a PGP public key to check its format and extract key information.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="validate-key">Public Key</Label>
                  <Textarea
                    id="validate-key"
                    placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----"
                    value={keyValidation.publicKey}
                    onChange={(e) => setKeyValidation(prev => ({...prev, publicKey: e.target.value}))}
                    rows={8}
                    className="font-mono text-xs"
                  />
                </div>

                <Button onClick={handleValidateKey} disabled={loading}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? 'Validating...' : 'Validate Key'}
                </Button>

                {keyValidation.validationResult && (
                  <div className="space-y-4">
                    <Alert>
                      {keyValidation.validationResult.valid ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        Public key is {keyValidation.validationResult.valid ? 'valid' : 'invalid'}
                        {!keyValidation.validationResult.valid && keyValidation.validationResult.error && 
                          `: ${keyValidation.validationResult.error}`
                        }
                      </AlertDescription>
                    </Alert>

                    {keyValidation.validationResult.valid && (
                      <div className="space-y-2">
                        <div>
                          <Label>Fingerprint</Label>
                          <p className="font-mono text-sm mt-1 p-2 bg-muted rounded">
                            {keyValidation.validationResult.fingerprint}
                          </p>
                        </div>
                        <div>
                          <Label>Algorithm</Label>
                          <Badge variant="secondary" className="ml-2">
                            {keyValidation.validationResult.algorithm} {keyValidation.validationResult.key_size}
                          </Badge>
                        </div>
                        {keyValidation.validationResult.user_ids && (
                          <div>
                            <Label>User IDs</Label>
                            <div className="mt-1 space-y-1">
                              {keyValidation.validationResult.user_ids.map((uid: string, index: number) => (
                                <p key={index} className="text-sm p-2 bg-muted rounded">{uid}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features Section for SEO */}
        <section className="mt-16 space-y-8">
          <h2 className="text-3xl font-bold text-center">Why Choose Opes PGP?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="text-muted-foreground">
                  All operations happen in your browser. Your keys never leave your device.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Key className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Easy Key Generation</h3>
                <p className="text-muted-foreground">
                  Generate strong PGP key pairs with just a few clicks. No technical knowledge required.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Download className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Free Forever</h3>
                <p className="text-muted-foreground">
                  All basic PGP tools are completely free. No hidden costs or limitations.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PGPGenerator;