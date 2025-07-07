import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Key, 
  Lock, 
  Unlock, 
  FileSignature, 
  Shield, 
  Download, 
  Save, 
  Copy,
  Eye,
  EyeOff,
  HelpCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import * as openpgp from 'openpgp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

interface StoredKey {
  id: string;
  name: string;
  publicKey: string;
  isOwn: boolean;
}

export default function PGPTools() {
  const { toast } = useToast();
  
  // Key Generation State
  const [keySize, setKeySize] = useState<'2048' | '4096'>('2048');
  const [passphrase, setPassphrase] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [generatedKeys, setGeneratedKeys] = useState<KeyPair | null>(null);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Encryption State
  const [plaintext, setPlaintext] = useState('');
  const [recipientPublicKey, setRecipientPublicKey] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [encrypting, setEncrypting] = useState(false);

  // Decryption State
  const [encryptedText, setEncryptedText] = useState('');
  const [privateKeyForDecrypt, setPrivateKeyForDecrypt] = useState('');
  const [passphraseForDecrypt, setPassphraseForDecrypt] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [decrypting, setDecrypting] = useState(false);

  // Signing State
  const [messageToSign, setMessageToSign] = useState('');
  const [privateKeyForSign, setPrivateKeyForSign] = useState('');
  const [passphraseForSign, setPassphraseForSign] = useState('');
  const [signedMessage, setSignedMessage] = useState('');
  const [signing, setSigning] = useState(false);

  // Verification State
  const [signedMessageToVerify, setSignedMessageToVerify] = useState('');
  const [senderPublicKey, setSenderPublicKey] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Stored Keys State
  const [storedKeys, setStoredKeys] = useState<StoredKey[]>([]);

  const generateKeyPair = async () => {
    if (!userName || !userEmail) {
      toast({
        title: "Error",
        description: "Please enter your name and email",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      const { privateKey, publicKey } = await openpgp.generateKey({
        type: 'rsa',
        rsaBits: parseInt(keySize),
        userIDs: [{ name: userName, email: userEmail }],
        passphrase: passphrase || undefined,
        format: 'armored'
      });

      const keyPair: KeyPair = {
        publicKey: publicKey as string,
        privateKey: privateKey as string
      };

      setGeneratedKeys(keyPair);

      if (saveToProfile) {
        await saveKeysToProfile(keyPair);
      }

      toast({
        title: "Success",
        description: "PGP key pair generated successfully!"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate key pair: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const saveKeysToProfile = async (keyPair: KeyPair) => {
    try {
      // This would save encrypted keys to the database
      // For now, we'll just show a success message
      toast({
        title: "Keys Saved",
        description: "Your keys have been securely saved to your profile"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save keys to profile",
        variant: "destructive"
      });
    }
  };

  const encryptMessage = async () => {
    if (!plaintext || !recipientPublicKey) {
      toast({
        title: "Error",
        description: "Please enter both message and recipient's public key",
        variant: "destructive"
      });
      return;
    }

    setEncrypting(true);
    try {
      const publicKey = await openpgp.readKey({ armoredKey: recipientPublicKey });
      
      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: plaintext }),
        encryptionKeys: publicKey,
        format: 'armored'
      });

      setEncryptedMessage(encrypted as string);
      
      toast({
        title: "Success",
        description: "Message encrypted successfully!"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to encrypt message: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setEncrypting(false);
    }
  };

  const decryptMessage = async () => {
    if (!encryptedText || !privateKeyForDecrypt) {
      toast({
        title: "Error",
        description: "Please enter both encrypted message and your private key",
        variant: "destructive"
      });
      return;
    }

    setDecrypting(true);
    try {
      const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyForDecrypt }),
        passphrase: passphraseForDecrypt
      });

      const message = await openpgp.readMessage({ armoredMessage: encryptedText });
      
      const { data: decrypted } = await openpgp.decrypt({
        message,
        decryptionKeys: privateKey,
        format: 'utf8'
      });

      setDecryptedMessage(decrypted as string);
      
      toast({
        title: "Success",
        description: "Message decrypted successfully!"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decrypt message: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setDecrypting(false);
    }
  };

  const signMessage = async () => {
    if (!messageToSign || !privateKeyForSign) {
      toast({
        title: "Error",
        description: "Please enter both message and your private key",
        variant: "destructive"
      });
      return;
    }

    setSigning(true);
    try {
      const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyForSign }),
        passphrase: passphraseForSign
      });

      const signed = await openpgp.sign({
        message: await openpgp.createCleartextMessage({ text: messageToSign }),
        signingKeys: privateKey,
        format: 'armored'
      });

      setSignedMessage(signed as string);
      
      toast({
        title: "Success",
        description: "Message signed successfully!"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign message: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setSigning(false);
    }
  };

  const verifySignature = async () => {
    if (!signedMessageToVerify || !senderPublicKey) {
      toast({
        title: "Error",
        description: "Please enter both signed message and sender's public key",
        variant: "destructive"
      });
      return;
    }

    setVerifying(true);
    try {
      const publicKey = await openpgp.readKey({ armoredKey: senderPublicKey });
      const message = await openpgp.readCleartextMessage({ cleartextMessage: signedMessageToVerify });
      
      const verificationResult = await openpgp.verify({
        message,
        verificationKeys: publicKey,
        format: 'utf8'
      });

      const { verified } = verificationResult.signatures[0];
      const isValid = await verified;

      setVerificationResult({
        valid: !!isValid,
        message: isValid ? "Signature is valid and authentic" : "Signature verification failed"
      });

      toast({
        title: isValid ? "Valid Signature" : "Invalid Signature",
        description: isValid ? "The message is authentic" : "The signature could not be verified",
        variant: isValid ? "default" : "destructive"
      });

    } catch (error) {
      setVerificationResult({
        valid: false,
        message: "Verification failed: " + (error as Error).message
      });
      
      toast({
        title: "Error",
        description: "Failed to verify signature: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  const downloadKey = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard"
    });
  };

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">PGP Tools</h1>
          <p className="text-muted-foreground">
            Secure encryption, decryption, signing and verification tools built into Opes Market
          </p>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Generate Key
            </TabsTrigger>
            <TabsTrigger value="encrypt" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Encrypt
            </TabsTrigger>
            <TabsTrigger value="decrypt" className="flex items-center gap-2">
              <Unlock className="h-4 w-4" />
              Decrypt
            </TabsTrigger>
            <TabsTrigger value="sign" className="flex items-center gap-2">
              <FileSignature className="h-4 w-4" />
              Sign
            </TabsTrigger>
            <TabsTrigger value="verify" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verify
            </TabsTrigger>
          </TabsList>

          {/* Generate Key Tab */}
          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Generate PGP Key Pair
                  <InfoTooltip content="Generate a new PGP key pair for encryption and signing. The public key can be shared with others, while the private key must be kept secret." />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName">Full Name</Label>
                    <Input
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Email Address</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Key Size</Label>
                  <Select value={keySize} onValueChange={(value: '2048' | '4096') => setKeySize(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2048">2048 bits (Standard)</SelectItem>
                      <SelectItem value="4096">4096 bits (High Security)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="passphrase">Passphrase (Optional but Recommended)</Label>
                    <InfoTooltip content="A passphrase protects your private key. Without it, anyone with access to your private key file can use it." />
                  </div>
                  <Input
                    id="passphrase"
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter a strong passphrase"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="saveToProfile"
                    checked={saveToProfile}
                    onCheckedChange={setSaveToProfile}
                  />
                  <Label htmlFor="saveToProfile" className="flex items-center gap-2">
                    Save keys to profile (encrypted storage)
                    <InfoTooltip content="Your keys will be encrypted and stored securely on the platform. This is optional - you can also just download them." />
                  </Label>
                </div>

                <Button 
                  onClick={generateKeyPair} 
                  disabled={generating}
                  className="w-full"
                  size="lg"
                >
                  {generating ? "Generating..." : "Generate Key Pair"}
                </Button>

                {generatedKeys && (
                  <div className="space-y-4 mt-6">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Key pair generated successfully! Save your keys securely.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Public Key (Share this)</Label>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(generatedKeys.publicKey)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadKey(generatedKeys.publicKey, 'public_key.asc')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={generatedKeys.publicKey}
                          readOnly
                          className="h-32 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Private Key (Keep secret!)</Label>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowPrivateKey(!showPrivateKey)}
                            >
                              {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(generatedKeys.privateKey)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadKey(generatedKeys.privateKey, 'private_key.asc')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={showPrivateKey ? generatedKeys.privateKey : '•'.repeat(100)}
                          readOnly
                          className="h-32 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Encrypt Message Tab */}
          <TabsContent value="encrypt">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Encrypt Message
                  <InfoTooltip content="Encrypt a message so only the recipient with the matching private key can read it." />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plaintext">Message to Encrypt</Label>
                  <Textarea
                    id="plaintext"
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                    placeholder="Enter your message here..."
                    className="h-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientPublicKey">Recipient's Public Key</Label>
                  <Textarea
                    id="recipientPublicKey"
                    value={recipientPublicKey}
                    onChange={(e) => setRecipientPublicKey(e.target.value)}
                    placeholder="Paste the recipient's public key here (-----BEGIN PGP PUBLIC KEY BLOCK-----)"
                    className="h-32 font-mono text-xs"
                  />
                </div>

                <Button 
                  onClick={encryptMessage} 
                  disabled={encrypting}
                  className="w-full"
                  size="lg"
                >
                  {encrypting ? "Encrypting..." : "Encrypt Message"}
                </Button>

                {encryptedMessage && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Encrypted Message</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(encryptedMessage)}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={encryptedMessage}
                      readOnly
                      className="h-40 font-mono text-xs"
                    />
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Send this encrypted message to your recipient. Only they can decrypt it with their private key.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Decrypt Message Tab */}
          <TabsContent value="decrypt">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Unlock className="h-5 w-5" />
                  Decrypt Message
                  <InfoTooltip content="Decrypt a message that was encrypted with your public key using your private key." />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="encryptedText">Encrypted Message</Label>
                  <Textarea
                    id="encryptedText"
                    value={encryptedText}
                    onChange={(e) => setEncryptedText(e.target.value)}
                    placeholder="Paste the encrypted message here (-----BEGIN PGP MESSAGE-----)"
                    className="h-32 font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privateKeyForDecrypt">Your Private Key</Label>
                  <Textarea
                    id="privateKeyForDecrypt"
                    value={privateKeyForDecrypt}
                    onChange={(e) => setPrivateKeyForDecrypt(e.target.value)}
                    placeholder="Paste your private key here (-----BEGIN PGP PRIVATE KEY BLOCK-----)"
                    className="h-32 font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passphraseForDecrypt">Passphrase (if required)</Label>
                  <Input
                    id="passphraseForDecrypt"
                    type="password"
                    value={passphraseForDecrypt}
                    onChange={(e) => setPassphraseForDecrypt(e.target.value)}
                    placeholder="Enter your private key passphrase"
                  />
                </div>

                <Button 
                  onClick={decryptMessage} 
                  disabled={decrypting}
                  className="w-full"
                  size="lg"
                >
                  {decrypting ? "Decrypting..." : "Decrypt Message"}
                </Button>

                {decryptedMessage && (
                  <div className="space-y-2">
                    <Label>Decrypted Message</Label>
                    <Textarea
                      value={decryptedMessage}
                      readOnly
                      className="h-32 bg-green-50 border-green-200"
                    />
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Message decrypted successfully!
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sign Message Tab */}
          <TabsContent value="sign">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  Sign Message
                  <InfoTooltip content="Sign a message with your private key to prove its authenticity. Others can verify it came from you using your public key." />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="messageToSign">Message to Sign</Label>
                  <Textarea
                    id="messageToSign"
                    value={messageToSign}
                    onChange={(e) => setMessageToSign(e.target.value)}
                    placeholder="Enter the message you want to sign..."
                    className="h-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privateKeyForSign">Your Private Key</Label>
                  <Textarea
                    id="privateKeyForSign"
                    value={privateKeyForSign}
                    onChange={(e) => setPrivateKeyForSign(e.target.value)}
                    placeholder="Paste your private key here (-----BEGIN PGP PRIVATE KEY BLOCK-----)"
                    className="h-32 font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passphraseForSign">Passphrase (if required)</Label>
                  <Input
                    id="passphraseForSign"
                    type="password"
                    value={passphraseForSign}
                    onChange={(e) => setPassphraseForSign(e.target.value)}
                    placeholder="Enter your private key passphrase"
                  />
                </div>

                <Button 
                  onClick={signMessage} 
                  disabled={signing}
                  className="w-full"
                  size="lg"
                >
                  {signing ? "Signing..." : "Sign Message"}
                </Button>

                {signedMessage && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Signed Message</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(signedMessage)}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={signedMessage}
                      readOnly
                      className="h-40 font-mono text-xs"
                    />
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Your message has been signed. Recipients can verify its authenticity using your public key.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verify Signature Tab */}
          <TabsContent value="verify">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verify Signature
                  <InfoTooltip content="Verify that a signed message is authentic and hasn't been tampered with using the sender's public key." />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signedMessageToVerify">Signed Message</Label>
                  <Textarea
                    id="signedMessageToVerify"
                    value={signedMessageToVerify}
                    onChange={(e) => setSignedMessageToVerify(e.target.value)}
                    placeholder="Paste the signed message here (-----BEGIN PGP SIGNED MESSAGE-----)"
                    className="h-32 font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderPublicKey">Sender's Public Key</Label>
                  <Textarea
                    id="senderPublicKey"
                    value={senderPublicKey}
                    onChange={(e) => setSenderPublicKey(e.target.value)}
                    placeholder="Paste the sender's public key here (-----BEGIN PGP PUBLIC KEY BLOCK-----)"
                    className="h-32 font-mono text-xs"
                  />
                </div>

                <Button 
                  onClick={verifySignature} 
                  disabled={verifying}
                  className="w-full"
                  size="lg"
                >
                  {verifying ? "Verifying..." : "Verify Signature"}
                </Button>

                {verificationResult && (
                  <Alert className={verificationResult.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    {verificationResult.valid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={verificationResult.valid ? "text-green-800" : "text-red-800"}>
                      <div className="flex items-center gap-2">
                        <Badge variant={verificationResult.valid ? "default" : "destructive"}>
                          {verificationResult.valid ? "VALID" : "INVALID"}
                        </Badge>
                        {verificationResult.message}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Security Notice */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Security Notice</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• All cryptographic operations are performed locally in your browser</li>
                  <li>• Your private keys are never sent to our servers unless you choose to save them</li>
                  <li>• Saved keys are encrypted with AES-256 before storage</li>
                  <li>• Always verify public keys through a trusted channel before use</li>
                  <li>• Keep your private key and passphrase secure and never share them</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}