import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Heart, 
  Users, 
  CheckCircle, 
  Mail, 
  FileText,
  Gavel,
  Eye,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SafetyAndTerms = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [petitionForm, setPetitionForm] = useState({
    fullName: '',
    email: '',
    agreement: false
  });
  const [signed, setSigned] = useState(false);
  const [signaturesCount, setSignaturesCount] = useState(2847); // Mock count

  const handlePetitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!petitionForm.agreement) {
      toast({
        title: "Agreement Required",
        description: "You must agree to the petition terms to sign.",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, this would save to database
      toast({
        title: "Petition Signed Successfully",
        description: "Thank you for taking a stand against child abuse and human trafficking.",
      });
      
      setSigned(true);
      setSignaturesCount(prev => prev + 1);
      setPetitionForm({ fullName: '', email: '', agreement: false });
    } catch (error) {
      console.error('Error signing petition:', error);
      toast({
        title: "Error",
        description: "Failed to sign petition. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Safety & Community Standards
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              OpesMarket is committed to creating a safe, ethical marketplace. We have zero tolerance for illegal content and actively work to protect vulnerable individuals worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            
            {/* Prohibited Content Warning */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Critical Warning */}
              <Alert className="border-destructive bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <AlertDescription className="text-destructive font-semibold text-lg">
                  <strong>ZERO TOLERANCE POLICY</strong><br />
                  Any attempt to sell, distribute, or promote child exploitation material, human trafficking, or terrorism-related products will result in immediate account termination and law enforcement notification.
                </AlertDescription>
              </Alert>

              {/* Prohibited Content */}
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-destructive">
                    <Ban className="h-6 w-6" />
                    <span>Strictly Prohibited Content</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-destructive/5 rounded-lg">
                      <h4 className="font-semibold text-destructive mb-2">Child Exploitation Material</h4>
                      <p className="text-sm text-muted-foreground">
                        Any content involving minors in sexual or exploitative situations is strictly forbidden. This includes but is not limited to images, videos, or any related materials.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-destructive/5 rounded-lg">
                      <h4 className="font-semibold text-destructive mb-2">Human Trafficking</h4>
                      <p className="text-sm text-muted-foreground">
                        Any services, products, or content related to human trafficking, forced labor, or sexual exploitation of individuals is absolutely prohibited.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-destructive/5 rounded-lg">
                      <h4 className="font-semibold text-destructive mb-2">Terrorism & Violence</h4>
                      <p className="text-sm text-muted-foreground">
                        Products, services, or content that promote terrorism, violence against individuals or groups, or facilitate harmful activities are not allowed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reporting System */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <span>Report Suspicious Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    If you encounter any prohibited content or suspicious activity, report it immediately:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Emergency Reports: safety@opesmail.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-verified" />
                      <span className="text-sm">All reports are reviewed within 1 hour</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-trust-high" />
                      <span className="text-sm">Anonymous reporting available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Legal Consequences */}
              <Card className="border-warning/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-warning">
                    <Gavel className="h-5 w-5" />
                    <span>Legal Consequences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Immediate account termination and permanent ban</li>
                    <li>• All relevant information forwarded to law enforcement agencies</li>
                    <li>• Full cooperation with international authorities and investigations</li>
                    <li>• Potential criminal prosecution under applicable laws</li>
                    <li>• Civil liability for damages caused to victims and platform</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Petition Section */}
            <div className="space-y-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-primary">
                    <Heart className="h-5 w-5" />
                    <span>Stand Against Abuse</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {signaturesCount.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      People have signed our petition
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Our Pledge:</h4>
                    <p className="text-sm text-muted-foreground">
                      "We stand united against child abuse, human trafficking, and all forms of exploitation. We commit to creating a safe digital environment and supporting survivors of abuse."
                    </p>
                  </div>
                </CardContent>
              </Card>

              {!signed ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sign the Petition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePetitionSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={petitionForm.fullName}
                          onChange={(e) => setPetitionForm({ ...petitionForm, fullName: e.target.value })}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={petitionForm.email}
                          onChange={(e) => setPetitionForm({ ...petitionForm, email: e.target.value })}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="agreement"
                          checked={petitionForm.agreement}
                          onChange={(e) => setPetitionForm({ ...petitionForm, agreement: e.target.checked })}
                          className="mt-0.5"
                          required
                        />
                        <Label htmlFor="agreement" className="text-xs text-muted-foreground">
                          I agree to stand against child abuse, human trafficking, and support OpesMarket's zero-tolerance policy on exploitation.
                        </Label>
                      </div>
                      
                      <Button type="submit" className="w-full">
                        <Heart className="h-4 w-4 mr-2" />
                        Sign Petition
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-success/20 bg-success/5">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                    <h4 className="font-semibold text-success mb-2">Thank You!</h4>
                    <p className="text-sm text-muted-foreground">
                      Your signature has been recorded. Together, we can make a difference.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Additional Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Support Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium">National Child Abuse Hotline</h5>
                      <p className="text-sm text-muted-foreground">1-800-4-A-CHILD (1-800-422-4453)</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Human Trafficking Hotline</h5>
                      <p className="text-sm text-muted-foreground">1-888-373-7888</p>
                    </div>
                    <div>
                      <h5 className="font-medium">FBI Internet Crime Complaint</h5>
                      <p className="text-sm text-muted-foreground">ic3.gov</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Community Standards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Community Standards & Enforcement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">AI Monitoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI systems continuously scan for prohibited content and suspicious patterns.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-verified/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-verified" />
                  </div>
                  <h4 className="font-semibold mb-2">Human Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Trained moderators review all reports and take swift action against violations.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <h4 className="font-semibold mb-2">Law Enforcement</h4>
                  <p className="text-sm text-muted-foreground">
                    Direct partnerships with agencies worldwide to combat illegal activities.
                  </p>
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

export default SafetyAndTerms;