import { Shield, Lock, Bitcoin, CheckCircle, Users, Clock, AlertTriangle, ArrowRight, Zap, Eye, Server, Key, Fingerprint, Globe, Award, TrendingUp, FileCheck, Database, Gavel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
      
      {/* Classic Hero Section */}
      <div className="bg-card border-b">
        <div className="container px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
              Escrow Security
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Professional Bitcoin escrow service protecting over $50 million in transactions. 
              Our multi-signature cold storage system provides institutional-grade security with complete blockchain transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-3" asChild>
                <Link to="/shop">
                  Start Trading Securely
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3">
                <FileCheck className="mr-2 h-5 w-5" />
                View Security Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Metrics */}
      <div className="bg-muted/30">
        <div className="container px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "99.99%", label: "Service Uptime", icon: <Database className="h-6 w-6" /> },
              { value: "$50M+", label: "Assets Protected", icon: <Bitcoin className="h-6 w-6" /> },
              { value: "256-bit", label: "Encryption Standard", icon: <Lock className="h-6 w-6" /> },
              { value: "24/7", label: "Security Monitoring", icon: <Eye className="h-6 w-6" /> }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3 text-primary">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container px-4 py-16">
        {/* How Escrow Works - Classic Design */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">How Our Escrow System Works</h2>
          <Separator className="w-24 mx-auto mb-6" />
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our time-tested escrow process ensures complete security and transparency for every transaction. 
            Each step is carefully monitored and protected by institutional-grade security measures.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-20">
          {escrowSteps.map((step, index) => (
            <div key={step.step} className="mb-12 last:mb-0">
              <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-start gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mb-4 lg:mb-0">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-bold text-foreground mb-3">{step.title}</h3>
                      <p className="text-lg text-muted-foreground mb-4 leading-relaxed">{step.description}</p>
                      <div className="bg-muted/40 p-4 rounded-lg border-l-4 border-l-primary">
                        <p className="text-sm text-foreground font-medium">{step.detail}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-primary">
                      {step.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {index < escrowSteps.length - 1 && (
                <div className="flex justify-center my-6">
                  <div className="w-0.5 h-8 bg-border"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Security Features - Classic Design */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Security Infrastructure</h2>
            <Separator className="w-24 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our security measures meet and exceed industry standards used by major financial institutions 
              and government agencies worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-serif text-foreground">{feature.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
                  <div className="bg-muted/40 p-3 rounded border-l-2 border-l-primary">
                    <p className="text-sm font-medium text-foreground">{feature.detail}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Service Comparison - Classic Table */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Service Comparison</h2>
            <Separator className="w-24 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how OpesMarket's escrow service compares to traditional alternatives.
            </p>
          </div>

          <Card className="border-2 shadow-lg max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b-2">
                      <th className="text-left p-6 font-serif font-bold text-foreground">Feature</th>
                      <th className="text-center p-6 font-serif font-bold text-muted-foreground">Traditional Escrow</th>
                      <th className="text-center p-6 font-serif font-bold text-primary">OpesMarket Escrow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="p-6 font-medium text-foreground">{row.feature}</td>
                        <td className="p-6 text-center text-muted-foreground">{row.traditional}</td>
                        <td className="p-6 text-center font-semibold text-primary">{row.opesmarket}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certifications - Classic Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Certifications & Compliance</h2>
            <Separator className="w-24 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our security practices are validated by leading industry certification bodies.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {certifications.map((cert, index) => (
              <Card key={index} className="border-2 shadow-md text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-serif font-bold text-primary mb-2">{cert.name}</h3>
                  <p className="text-sm text-muted-foreground">{cert.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Overview - Classic Style */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Technical Specifications</h2>
            <Separator className="w-24 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Detailed technical information about our escrow architecture and security protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Multi-Signature Protocol */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-xl font-serif flex items-center gap-3">
                  <Key className="h-6 w-6 text-primary" />
                  Multi-Signature Protocol
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">
                  Our 3-of-5 multi-signature system requires consensus from multiple parties before any funds can be released.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <div className="font-medium">Buyer Key</div>
                      <div className="text-sm text-muted-foreground">Controlled by purchaser</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <div className="font-medium">Vendor Key</div>
                      <div className="text-sm text-muted-foreground">Controlled by seller</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <div className="font-medium">Platform Keys (3)</div>
                      <div className="text-sm text-muted-foreground">Distributed infrastructure</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cold Storage Details */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-xl font-serif flex items-center gap-3">
                  <Lock className="h-6 w-6 text-primary" />
                  Cold Storage Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">
                  99% of escrow funds stored in offline, air-gapped systems across multiple secure facilities.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">FIPS 140-2 Level 4 HSMs</div>
                      <div className="text-muted-foreground">Hardware security modules with tamper protection</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">Geographic Distribution</div>
                      <div className="text-muted-foreground">5 secure facilities across different regions</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">24/7 Security</div>
                      <div className="text-muted-foreground">Armed guards and environmental monitoring</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monitoring Systems */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-xl font-serif flex items-center gap-3">
                  <Eye className="h-6 w-6 text-primary" />
                  Security Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">
                  AI-powered monitoring system with 99.7% fraud detection accuracy operating 24/7.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Detection Capabilities</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Suspicious patterns</li>
                      <li>• Account takeover</li>
                      <li>• Unusual behavior</li>
                      <li>• Money laundering</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Response Actions</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Transaction freezing</li>
                      <li>• MFA triggers</li>
                      <li>• Human escalation</li>
                      <li>• Auto-disputes</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recovery Systems */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-xl font-serif flex items-center gap-3">
                  <Server className="h-6 w-6 text-primary" />
                  Disaster Recovery
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">
                  Comprehensive backup and recovery procedures ensure continuous operation.
                </p>
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">&lt; 4 Hours</div>
                        <div className="text-sm text-muted-foreground">Recovery Time</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">&lt; 15 Min</div>
                        <div className="text-sm text-muted-foreground">Data Loss Window</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Real-time replication across multiple data centers with encrypted offline backups 
                    in geographically diverse locations.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Transaction Example */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Escrow Transaction Status</h2>
            <Separator className="w-24 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Example of how transaction status is displayed to users throughout the escrow process.
            </p>
          </div>

          <Card className="border-2 shadow-lg max-w-2xl mx-auto">
            <CardHeader className="border-b text-center">
              <CardTitle className="text-xl font-serif flex items-center justify-center gap-3">
                <Bitcoin className="h-6 w-6 text-primary" />
                Transaction #ES-2024-001234
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  <Badge className="bg-primary text-primary-foreground">Funds Secured</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary mb-1">0.0045</div>
                    <div className="text-sm text-muted-foreground">BTC Secured</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary mb-1">12</div>
                    <div className="text-sm text-muted-foreground">Days Remaining</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary mb-1">3/5</div>
                    <div className="text-sm text-muted-foreground">Signatures Req.</div>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Funds will automatically release to vendor in 12 days unless disputed.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button size="sm" variant="outline">
                      <Gavel className="mr-2 h-4 w-4" />
                      Open Dispute
                    </Button>
                    <Button size="sm">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Release Early
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action - Classic Style */}
        <div className="text-center">
          <Card className="border-2 shadow-lg max-w-4xl mx-auto">
            <CardContent className="p-12">
              <div className="mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                  Ready to Experience Secure Trading?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                  Join over <span className="text-primary font-semibold">50,000 users</span> who trust our 
                  institutional-grade escrow system to protect their Bitcoin transactions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="px-8 py-3" asChild>
                  <Link to="/shop">
                    Browse Marketplace
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3" asChild>
                  <Link to="/vendor/register">
                    Become a Vendor
                    <Users className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>$250 Vendor Bond</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Full Escrow Protection</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Professional Support</span>
                  </div>
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