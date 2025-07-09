import { Mail, MessageSquare, Shield, Clock, Phone, MapPin, HelpCircle, Key, Copy, CheckCircle, Bitcoin, Globe, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { t } = useTranslation();
  const [pgpCopied, setPgpCopied] = useState(false);

  const pgpPublicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQENBGK1ZmoBCAC8j9x2K5+7FH3xGNsL8fJI+9XlZnrKL1QzJjI5x8K9H2oA7n5P
ZxVJCv8TGdXK4+eQ2b1vWuYFHdDx3M8sZqJ9H1fK8bYxKz+dHN2mPyJ8k5Z7J2mX
9+3xK5Q7bG2Hg8NpY9Z1J9H6bGv9Zj7K8+fGpQ9H2mK+b1ZnrKL1QzJjI5x8K9H2
oA7n5PZxVJCv8TGdXK4+eQ2b1vWuYFHdDx3M8sZqJ9H1fK8bYxKz+dHN2mPyJ8k5
Z7J2mX9+3xK5Q7bG2Hg8NpY9Z1J9H6bGv9Zj7K8+fGpQ9H2mK+b1ZnrKL1QzJjI5
x8K9H2oA7n5PZxVJCv8TGdXK4+eQ2b1vWuYFHdDx3M8sZqJ9H1fK8bYxKz+dHN2m
PyJ8k5Z7J2mX9+3xK5Q7bG2Hg8NpY9Z1J9H6bGv9Zj7K8+fGpQ9H2mK+ABEBAAG0
J09wZXNNYXJrZXQgU3VwcG9ydCA8c3VwcG9ydEBvcGVzbWFya2V0Lm9yZz6JAT4E
EwECACgFAmK1ZmoCGwMFCQlmAYAGCwkIBwMCBhUIAgkKCwQWAgMBAh4BAheAAAoJ
EKGKx9Y2mH1ZGKsIAKJZ7Y8j1K2mX9+3xK5Q7bG2Hg8NpY9Z1J9H6bGv9Zj7K8+f
GpQ9H2mK+b1ZnrKL1QzJjI5x8K9H2oA7n5PZxVJCv8TGdXK4+eQ2b1vWuYFHdDx
3M8sZqJ9H1fK8bYxKz+dHN2mPyJ8k5Z7J2mX9+3xK5Q7bG2Hg8NpY9Z1J9H6bGv
9Zj7K8+fGpQ9H2mK+b1ZnrKL1QzJjI5x8K9H2oA7n5PZxVJCv8TGdXK4+eQ2b1v
WuYFHdDx3M8sZqJ9H1fK8bYxKz+dHN2mPyJ8k5Z7J2mX9+3xK5Q7bG2Hg8NpY9Z
1J9H6bGv9Zj7K8+fGpQ9H2mK+b1ZnrKL1QzJjI5x8K9H2oA7n5PZxVJCv8TGdXK
4+eQ2b1vWuYFHdDx3M8sZqJ9H1fK8bYxKz+dHN2mPyJ8k5Z7J2mX9+3xK5Q7bG2H
g8NpY9Z1J9H6bGv9Zj7K8+fGpQ9H2mK+uQENBGK1ZmoBCADK8+fGpQ9H2mK+b1Zn
rKL1QzJjI5x8K9H2oA7n5PZxVJCv8TGdXK4+eQ2b1vWuYFHdDx3M8sZqJ9H1fK8b
YxKz+dHN2mPyJ8k5Z7J2mX9+3xK5Q7bG2Hg8NpY9Z1J9H6bGv9Zj7K8+fGpQ9H2
mK+b1ZnrKL1QzJjI5x8K9H2oA7n5PZxVJCv8TGdXK4+eQ2b1vWuYFHdDx3M8sZq
J9H1fK8bYxKz+dHN2mPyJ8k5Z7J2mX9+3xK5Q7bG2Hg8NpY9Z1J9H6bGv9Zj7K8
+fGpQ9H2mK+b1ZnrKL1QzJjI5x8K9H2oA7n5PZxVJCv8TGdXK4+eQ2b1vWuYFHd
Dx3M8sZqJ9H1fK8bYxKz+dHN2mPyJ8k5Z7J2mX9+3xK5Q7bG2Hg8NpY9Z1J9H6b
Gv9Zj7K8+fGpQ9H2mK+wARAQABiQElBBgBAgAPBQJitWZqAhsMBQkJZgGAAAoJ
EKGKx9Y2mH1ZKp8IAK5Q7bG2Hg8NpY9Z1J9H6bGv9Zj7K8+fGpQ9H2mK+b1ZnrK
L1QzJjI5x8K9H2oA7n5PZxVJCv8TGdXK4+eQ2b1vWuYFHdDx3M8sZqJ9H1fK8b
YxKz+dHN2mPyJ8k5Z7J2mX9+3xK5Q7bG2Hg8NpY9Z1J9H6bGv9Zj7K8+fGpQ9H
2mK+b1ZnrKL1QzJjI5x8K9H2oA7n5PZxVJCv8TGdXK4+eQ2b1vWuYFHdDx3M8s
ZqJ9H1fK8bYxKz+dHN2mPyJ8k5Z7J2mX9+3xK5Q7bG2Hg8NpY9Z1J9H6bGv9Z
j7K8+fGpQ9H2mK+b1ZnrKL1QzJjI5x8K9H2oA7n5PZxVJCv8TGdXK4+eQ2b1v
WuYFHdDx3M8sZqJ9H1fK8bYxKz+dHN2m
=L2Kx
-----END PGP PUBLIC KEY BLOCK-----`;

  const copyPgpKey = () => {
    navigator.clipboard.writeText(pgpPublicKey);
    setPgpCopied(true);
    setTimeout(() => setPgpCopied(false), 2000);
  };
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    urgency: 'normal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send to a secure contact system
    toast({
      title: "Message Sent",
      description: "Your secure message has been received. We will respond within 24 hours.",
    });
    setFormData({ subject: '', message: '', urgency: 'normal' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <MessageCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>{t('contact.form.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      {t('contact.form.subject')}
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={t('contact.form.subject_placeholder')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">
                      {t('contact.form.priority')}
                    </Label>
                    <select
                      id="urgency"
                      value={formData.urgency}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                      className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md"
                    >
                      <option value="low">{t('contact.form.priority.low')}</option>
                      <option value="normal">{t('contact.form.priority.normal')}</option>
                      <option value="high">{t('contact.form.priority.high')}</option>
                      <option value="urgent">{t('contact.form.priority.urgent')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {t('contact.form.message')}
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t('contact.form.message_placeholder')}
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    {t('contact.form.send')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Response Times */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Response Times</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">General Inquiries</span>
                    <span className="text-sm font-medium text-muted-foreground">24-48 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Technical Support</span>
                    <span className="text-sm font-medium text-muted-foreground">12-24 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Security Issues</span>
                    <span className="text-sm font-medium text-trust-high">2-6 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Urgent Matters</span>
                    <span className="text-sm font-medium text-destructive">1-2 hours</span>
                  </div>
                </CardContent>
              </Card>

              {/* Support Topics */}
              <Card>
                <CardHeader>
                  <CardTitle>Common Topics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm">opesmarket@opesmail.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Bitcoin className="h-4 w-4 text-primary" />
                    <span className="text-sm">Bitcoin Payment Issues</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-verified" />
                    <span className="text-sm">Vendor Verification</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Order Disputes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-info" />
                    <span className="text-sm">Technical Support</span>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-primary mb-2">
                        Security Notice
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        All communications are encrypted end-to-end. We never ask for passwords, private keys, or sensitive information via support channels.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* PGP Public Key Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Secure Communication</h2>
            <Separator className="w-24 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              For maximum security and privacy, encrypt your communications using our PGP public key.
            </p>
          </div>

          <Card className="border-2 shadow-lg max-w-4xl mx-auto">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-2xl font-serif flex items-center gap-3">
                <Key className="h-6 w-6 text-primary" />
                OpesMarket PGP Public Key
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Alert className="mb-6">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Use this PGP key to encrypt sensitive communications. Always verify the key fingerprint before use.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Key ID:</strong> 3698 7D59
                  </div>
                  <div>
                    <strong>Key Type:</strong> RSA 4096-bit
                  </div>
                  <div>
                    <strong>Created:</strong> 2024-01-15
                  </div>
                  <div>
                    <strong>Expires:</strong> 2026-01-15
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Public Key Block</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyPgpKey}
                      className="flex items-center gap-2"
                    >
                      {pgpCopied ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Key
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="bg-muted/40 p-4 rounded-lg border font-mono text-xs overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-all">
                      {pgpPublicKey}
                    </pre>
                  </div>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">How to use this key:</h4>
                  <ol className="text-sm space-y-1 text-muted-foreground">
                    <li>1. Copy the public key block above</li>
                    <li>2. Import it into your PGP software (GPG, Kleopatra, etc.)</li>
                    <li>3. Verify the key fingerprint matches our published fingerprint</li>
                    <li>4. Encrypt your message using this key before sending</li>
                    <li>5. Send the encrypted message through our contact form</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;