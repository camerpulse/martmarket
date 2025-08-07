import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Key, Plus, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePGPKeyPair, savePGPKeyPair, getUserPGPKeys, UserPGPKey } from '@/lib/pgp';

export default function PGPKeyManager() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<UserPGPKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showKeyGen, setShowKeyGen] = useState(false);
  
  const [keyGenForm, setKeyGenForm] = useState({
    name: '',
    email: '',
    keyName: '',
    passphrase: '',
    confirmPassphrase: ''
  });

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const userKeys = await getUserPGPKeys();
      setKeys(userKeys);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load PGP keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewKey = async () => {
    if (keyGenForm.passphrase !== keyGenForm.confirmPassphrase) {
      toast({
        title: "Error",
        description: "Passphrases do not match",
        variant: "destructive",
      });
      return;
    }

    if (keyGenForm.passphrase.length < 8) {
      toast({
        title: "Error",
        description: "Passphrase must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const keyPair = await generatePGPKeyPair(
        keyGenForm.name,
        keyGenForm.email,
        keyGenForm.passphrase
      );

      await savePGPKeyPair(
        keyGenForm.keyName,
        keyPair,
        keyGenForm.passphrase,
        keys.length === 0 // Set as default if it's the first key
      );

      toast({
        title: "Success",
        description: "PGP key pair generated and saved successfully",
      });

      setShowKeyGen(false);
      setKeyGenForm({
        name: '',
        email: '',
        keyName: '',
        passphrase: '',
        confirmPassphrase: ''
      });
      
      await loadKeys();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate PGP key pair",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const formatFingerprint = (fingerprint: string) => {
    return fingerprint.match(/.{1,4}/g)?.join(' ') || fingerprint;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Key className="h-5 w-5 animate-pulse mr-2" />
            <span>Loading PGP keys...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">PGP Keys</h3>
        <Dialog open={showKeyGen} onOpenChange={setShowKeyGen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Generate New Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate New PGP Key Pair</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your private key will be encrypted and stored securely. Remember your passphrase - it cannot be recovered.
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., My Main Key"
                  value={keyGenForm.keyName}
                  onChange={(e) => setKeyGenForm(prev => ({ ...prev, keyName: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={keyGenForm.name}
                  onChange={(e) => setKeyGenForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={keyGenForm.email}
                  onChange={(e) => setKeyGenForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="passphrase">Passphrase</Label>
                <Input
                  id="passphrase"
                  type="password"
                  placeholder="Strong passphrase"
                  value={keyGenForm.passphrase}
                  onChange={(e) => setKeyGenForm(prev => ({ ...prev, passphrase: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassphrase">Confirm Passphrase</Label>
                <Input
                  id="confirmPassphrase"
                  type="password"
                  placeholder="Confirm passphrase"
                  value={keyGenForm.confirmPassphrase}
                  onChange={(e) => setKeyGenForm(prev => ({ ...prev, confirmPassphrase: e.target.value }))}
                />
              </div>

              <Button
                onClick={generateNewKey}
                disabled={generating || !keyGenForm.name || !keyGenForm.email || !keyGenForm.keyName || !keyGenForm.passphrase}
                className="w-full"
              >
                {generating ? 'Generating...' : 'Generate Key Pair'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {keys.length === 0 ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No PGP keys found. Generate a key pair to start using encrypted messaging.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{key.key_name}</h4>
                      {key.is_default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Fingerprint: {formatFingerprint(key.key_fingerprint)}
                    </p>
                  </div>
                  <Key className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}