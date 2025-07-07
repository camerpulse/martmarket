import { Shield, Lock, Bitcoin, CheckCircle, Users, Clock, AlertTriangle, ArrowRight, Zap, Eye, Server, Key, Fingerprint, Globe, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      description: "All escrow funds require multiple cryptographic signatures for release, preventing single-point failures.",
      detail: "Our 3-of-5 multi-signature system ensures no single party can access funds without consensus."
    },
    {
      icon: <Lock className="h-8 w-8 text-trust-high" />,
      title: "Cold Storage Security", 
      description: "Escrow funds are stored in offline, air-gapped cold wallets with bank-grade physical security.",
      detail: "99% of funds stored in geographically distributed, climate-controlled vaults with 24/7 armed security."
    },
    {
      icon: <Eye className="h-8 w-8 text-trust-high" />,
      title: "Blockchain Transparency",
      description: "Every transaction is recorded on the Bitcoin blockchain, providing immutable proof of all transfers.",
      detail: "Full audit trail with real-time blockchain verification and transaction transparency."
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-trust-high" />,
      title: "Dispute Resolution",
      description: "Automated dispute detection with human arbitrators and smart contract enforcement.",
      detail: "AI-powered fraud detection with 99.7% accuracy and professional mediation team."
    },
    {
      icon: <Server className="h-8 w-8 text-trust-high" />,
      title: "Infrastructure Security",
      description: "Military-grade infrastructure with DDoS protection and 99.99% uptime guarantee.",
      detail: "Distributed architecture across multiple data centers with real-time failover systems."
    },
    {
      icon: <Key className="h-8 w-8 text-trust-high" />,
      title: "Hardware Security Modules",
      description: "FIPS 140-2 Level 4 certified HSMs protect all cryptographic operations.",
      detail: "Tamper-evident hardware prevents any unauthorized access to cryptographic keys."
    }
  ];

  const comparisonData = [
    { feature: "Multi-Signature Protection", traditional: "❌", opesmarket: "✅ 3-of-5 MultiSig" },
    { feature: "Cold Storage", traditional: "❌", opesmarket: "✅ 99% Offline Storage" },
    { feature: "Dispute Resolution", traditional: "⚠️ Slow Process", opesmarket: "✅ AI + Human Arbitration" },
    { feature: "Transaction Fees", traditional: "3-5%", opesmarket: "0.5-1.5%" },
    { feature: "Release Time", traditional: "3-7 Days", opesmarket: "Instant/Auto 14 Days" },
    { feature: "Blockchain Verification", traditional: "❌", opesmarket: "✅ Full Transparency" },
    { feature: "Insurance Coverage", traditional: "Limited", opesmarket: "✅ Full Coverage" },
    { feature: "24/7 Monitoring", traditional: "❌", opesmarket: "✅ Real-time AI Monitor" }
  ];

  const certifications = [
    { name: "ISO 27001", description: "Information Security Management" },
    { name: "SOC 2 Type II", description: "Security & Availability Controls" },
    { name: "FIPS 140-2", description: "Cryptographic Module Validation" },
    { name: "PCI DSS", description: "Payment Card Industry Standards" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-trust-high/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        {/* Hero Section */}
        <div className="container px-4 py-16 md:py-24 relative z-10">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative bg-background/80 backdrop-blur-sm p-6 rounded-full border border-primary/20">
                  <Shield className="h-20 w-20 text-primary animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-trust-high text-white animate-bounce">SECURE</Badge>
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient bg-300% bg-pos-0">
                Escrow Security
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
              Military-grade Bitcoin escrow protecting <span className="text-primary font-semibold">$50M+</span> in transactions. 
              Our multi-signature, cold storage system offers bank-level security with blockchain transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg px-8 py-4 shadow-xl" asChild>
                <Link to="/shop">
                  Start Secure Trading
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2">
                <Fingerprint className="mr-2 h-6 w-6" />
                Security Audit Report
              </Button>
            </div>
          </div>

          {/* Enhanced Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: "99.99%", label: "Uptime SLA", icon: <TrendingUp className="h-6 w-6" /> },
              { value: "$50M+", label: "Protected Volume", icon: <Bitcoin className="h-6 w-6" /> },
              { value: "256-bit", label: "AES Encryption", icon: <Lock className="h-6 w-6" /> },
              { value: "24/7", label: "AI Monitoring", icon: <Eye className="h-6 w-6" /> }
            ].map((stat, index) => (
              <Card key={index} className="card-gradient shadow-lg hover:shadow-xl transition-all duration-300 border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-3 text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
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

        {/* Enhanced Security Features */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bitcoin-gradient">Unbreakable</span> Security Architecture
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            Our security infrastructure uses the same technology trusted by major financial institutions, 
            government agencies, and Fortune 500 companies worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="card-gradient shadow-card hover:shadow-primary/20 transition-all duration-300 border-l-4 border-l-primary group">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">{feature.description}</p>
                <p className="text-sm font-medium text-primary">{feature.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card className="mb-16 card-gradient shadow-card">
          <CardHeader className="text-center bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardTitle className="text-2xl md:text-3xl flex items-center justify-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              OpesMarket vs Traditional Escrow
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">Traditional Escrow</th>
                    <th className="text-center p-4 font-semibold text-primary">OpesMarket Escrow</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="border-t hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center text-muted-foreground">{row.traditional}</td>
                      <td className="p-4 text-center font-semibold text-primary">{row.opesmarket}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Security Certifications */}
        <Card className="mb-16 card-gradient shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-3">
              <Globe className="h-6 w-6" />
              Security Certifications & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {certifications.map((cert, index) => (
                <div key={index} className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-primary mb-2">{cert.name}</div>
                  <div className="text-sm text-muted-foreground">{cert.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical Deep Dive */}
        <Card className="mb-16 card-gradient shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Technical Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="multisig" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="multisig">Multi-Signature</TabsTrigger>
                <TabsTrigger value="cold">Cold Storage</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                <TabsTrigger value="recovery">Recovery</TabsTrigger>
              </TabsList>
              
              <TabsContent value="multisig" className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold mb-3">3-of-5 Multi-Signature Protocol</h3>
                <p className="text-muted-foreground mb-4">
                  Our escrow system uses a sophisticated 3-of-5 multi-signature scheme where funds can only be released 
                  when at least 3 out of 5 designated key holders agree to the transaction.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Buyer Key</h4>
                    <p className="text-sm text-muted-foreground">Controlled by the purchaser</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Vendor Key</h4>
                    <p className="text-sm text-muted-foreground">Controlled by the seller</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Platform Keys (3)</h4>
                    <p className="text-sm text-muted-foreground">Distributed across secure infrastructure</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="cold" className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold mb-3">Cold Storage Infrastructure</h3>
                <p className="text-muted-foreground mb-4">
                  99% of escrow funds are stored in offline, air-gapped cold storage systems distributed across 
                  multiple geographically separated, climate-controlled facilities.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-trust-high" />
                    <span>Hardware Security Modules (HSMs) with FIPS 140-2 Level 4 certification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-trust-high" />
                    <span>Geographically distributed across 5 secure facilities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-trust-high" />
                    <span>24/7 physical security and environmental monitoring</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="monitoring" className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold mb-3">Real-Time Security Monitoring</h3>
                <p className="text-muted-foreground mb-4">
                  Our AI-powered security system monitors all transactions 24/7, detecting suspicious patterns 
                  and potential fraud attempts with 99.7% accuracy.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Automated Detection</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Suspicious transaction patterns</li>
                      <li>• Account takeover attempts</li>
                      <li>• Unusual login behaviors</li>
                      <li>• Potential money laundering</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Response Systems</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Instant transaction freezing</li>
                      <li>• Multi-factor authentication triggers</li>
                      <li>• Human analyst escalation</li>
                      <li>• Automatic dispute initiation</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="recovery" className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold mb-3">Disaster Recovery & Business Continuity</h3>
                <p className="text-muted-foreground mb-4">
                  Our infrastructure is designed to maintain operations even in extreme circumstances, 
                  with comprehensive backup and recovery procedures.
                </p>
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Recovery Time Objectives</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>RTO: &lt; 4 hours</div>
                      <div>RPO: &lt; 15 minutes</div>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Backup Strategy</h4>
                    <div className="text-sm text-muted-foreground">
                      Real-time replication across multiple data centers with encrypted offline backups 
                      stored in geographically diverse locations.
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

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

        {/* Enhanced Call to Action */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-xl blur-3xl"></div>
          <Card className="relative card-gradient shadow-2xl border-primary/20">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Shield className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Trade with <span className="bitcoin-gradient">Military-Grade</span> Security?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-3xl mx-auto text-lg">
                Join over <span className="text-primary font-semibold">50,000+ users</span> who trust our escrow system 
                to protect their Bitcoin transactions. Experience the most secure marketplace on the darknet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="text-lg px-8 py-4 shadow-xl" asChild>
                  <Link to="/shop">
                    Browse Secure Marketplace
                    <Shield className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2" asChild>
                  <Link to="/vendor/register">
                    Become Verified Vendor
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
              </div>
              <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-trust-high" />
                  <span>$250 Vendor Bond Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-trust-high" />
                  <span>Full Escrow Protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-trust-high" />
                  <span>Instant Dispute Resolution</span>
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

export default EscrowSecurity;