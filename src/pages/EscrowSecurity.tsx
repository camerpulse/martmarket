import { Shield, Lock, Bitcoin, CheckCircle, Users, Clock, AlertTriangle, ArrowRight, Zap, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const EscrowSecurity = () => {
  const escrowSteps = [
    {
      step: 1,
      title: "Order Placement",
      description: "Buyer places order and funds are held in secure escrow",
      icon: <Users className="h-6 w-6" />,
      detail: "Your Bitcoin is immediately secured in our multi-signature escrow wallet, protected by military-grade encryption."
    },
    {
      step: 2,
      title: "Vendor Notification",
      description: "Vendor receives secure notification and begins order processing",
      icon: <Zap className="h-6 w-6" />,
      detail: "Vendor is notified via encrypted channels and can safely begin fulfillment knowing payment is guaranteed."
    },
    {
      step: 3,
      title: "Shipment & Tracking",
      description: "Item is shipped with tracking information provided",
      icon: <Clock className="h-6 w-6" />,
      detail: "Full transparency with encrypted tracking updates and automatic milestone monitoring."
    },
    {
      step: 4,
      title: "Delivery Confirmation",
      description: "Buyer confirms receipt or automatic release after 14 days",
      icon: <CheckCircle className="h-6 w-6" />,
      detail: "Multiple confirmation methods ensure legitimate transactions while protecting against fraud."
    },
    {
      step: 5,
      title: "Secure Release",
      description: "Funds are released to vendor minus platform fees",
      icon: <Bitcoin className="h-6 w-6" />,
      detail: "Instant Bitcoin transfer to vendor's wallet with full transaction transparency on the blockchain."
    }
  ];

  const securityFeatures = [
    {
      icon: <Shield className="h-8 w-8 text-trust-high" />,
      title: "Multi-Signature Protection",
      description: "All escrow funds require multiple cryptographic signatures for release, preventing single-point failures."
    },
    {
      icon: <Lock className="h-8 w-8 text-trust-high" />,
      title: "Cold Storage Security",
      description: "Escrow funds are stored in offline, air-gapped cold wallets with bank-grade physical security."
    },
    {
      icon: <Eye className="h-8 w-8 text-trust-high" />,
      title: "Blockchain Transparency",
      description: "Every transaction is recorded on the Bitcoin blockchain, providing immutable proof of all transfers."
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-trust-high" />,
      title: "Dispute Resolution",
      description: "Automated dispute detection with human arbitrators and smart contract enforcement."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Hero Section */}
        <div className="container px-4 py-16 md:py-24">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Shield className="h-20 w-20 text-primary animate-pulse" />
                <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping opacity-30"></div>
                <div className="absolute -inset-2 bg-primary/10 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bitcoin-gradient">Fort Knox</span> Level Security
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Our military-grade Bitcoin escrow system protects every transaction with multi-signature wallets, 
              cold storage, and blockchain transparency. Your funds are safer than traditional banks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/shop">
                  Start Trading Securely
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Shield className="mr-2 h-5 w-5" />
                Security Audit Report
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">$50M+</div>
              <div className="text-sm text-muted-foreground">Secured Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">256-bit</div>
              <div className="text-sm text-muted-foreground">Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-16">
        {/* How Escrow Works */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How Our Escrow Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every transaction is protected by our advanced escrow system, ensuring both buyers and vendors are protected throughout the entire process.
          </p>
        </div>

        <div className="space-y-8 mb-16">
          {escrowSteps.map((step, index) => (
            <Card key={step.step} className="card-gradient shadow-card">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center relative">
                      {step.icon}
                      <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                        {step.step}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    <p className="text-sm">{step.detail}</p>
                  </div>
                  {index < escrowSteps.length - 1 && (
                    <div className="hidden md:block">
                      <ArrowRight className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Features */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <span className="bitcoin-gradient">Unbreakable</span> Security Features
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our security infrastructure uses the same technology trusted by major financial institutions and government agencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="card-gradient shadow-card hover:shadow-primary/20 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-4">
                  {feature.icon}
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Escrow Process Visualization */}
        <Card className="mb-16 card-gradient shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Bitcoin className="h-6 w-6" />
              Live Escrow Status Example
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Funds Secured</span>
                <Badge className="bg-trust-high text-white">Active</Badge>
              </div>
              <Progress value={75} className="h-3" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">0.0045 BTC</div>
                  <div className="text-sm text-muted-foreground">Secured Amount</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">12 Days</div>
                  <div className="text-sm text-muted-foreground">Auto-Release In</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">3/5</div>
                  <div className="text-sm text-muted-foreground">Required Signatures</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Trade with Complete Security?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust our escrow system to protect their Bitcoin transactions. 
            Start trading with confidence today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/shop">
                Browse Secure Marketplace
                <Shield className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/vendor/register">
                Become Verified Vendor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EscrowSecurity;