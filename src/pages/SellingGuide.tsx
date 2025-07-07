import { Store, Shield, Bitcoin, TrendingUp, Users, Star, Package, MessageSquare, CheckCircle, AlertTriangle, Award, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const SellingGuide = () => {
  const vendorSteps = [
    {
      step: 1,
      title: "Vendor Registration",
      description: "Apply to become a verified vendor with required documentation and bond",
      icon: <Store className="h-6 w-6" />,
      details: [
        "Submit vendor application form",
        "Provide business/identity verification",
        "Pay $250 vendor bond in Bitcoin",
        "Complete vendor training program",
        "Wait for approval (2-5 business days)"
      ]
    },
    {
      step: 2,
      title: "Setup Your Store",
      description: "Configure your vendor profile and store settings",
      icon: <Users className="h-6 w-6" />,
      details: [
        "Upload professional store logo/banner",
        "Write compelling store description",
        "Set shipping zones and methods",
        "Configure payment preferences",
        "Enable encrypted messaging"
      ]
    },
    {
      step: 3,
      title: "List Your Products",
      description: "Create detailed product listings with photos and descriptions",
      icon: <Package className="h-6 w-6" />,
      details: [
        "Upload high-quality product photos",
        "Write detailed descriptions",
        "Set competitive pricing",
        "Configure inventory management",
        "Add product variants and options"
      ]
    },
    {
      step: 4,
      title: "Start Selling",
      description: "Process orders, communicate with customers, and build reputation",
      icon: <TrendingUp className="h-6 w-6" />,
      details: [
        "Monitor incoming orders",
        "Communicate with buyers",
        "Process and ship orders promptly",
        "Provide tracking information",
        "Build positive feedback score"
      ]
    }
  ];

  const requirements = [
    {
      title: "Financial Requirements",
      icon: <Bitcoin className="h-6 w-6 text-primary" />,
      items: [
        "$250 USD vendor bond (refundable upon good standing exit)",
        "Minimum 0.01 BTC operational balance recommended",
        "2.5% transaction fee on all sales",
        "Automatic tax calculation for applicable jurisdictions"
      ]
    },
    {
      title: "Verification Requirements",
      icon: <Shield className="h-6 w-6 text-primary" />,
      items: [
        "Valid government-issued identification",
        "Business registration (if applicable)",
        "PGP key for secure communications",
        "Proof of product sourcing legitimacy",
        "Background check completion"
      ]
    },
    {
      title: "Performance Standards",
      icon: <Star className="h-6 w-6 text-primary" />,
      items: [
        "95%+ order completion rate required",
        "Response time under 24 hours",
        "Maintain 4.5+ average rating",
        "Zero tolerance for fraudulent activity",
        "Comply with all marketplace policies"
      ]
    }
  ];

  const benefits = [
    {
      title: "Access to Global Market",
      description: "Reach customers worldwide through our secure platform",
      icon: <Users className="h-8 w-8" />
    },
    {
      title: "Secure Bitcoin Payments",
      description: "Receive payments in Bitcoin with escrow protection",
      icon: <Bitcoin className="h-8 w-8" />
    },
    {
      title: "Built-in Trust System",
      description: "Build reputation through verified customer reviews",
      icon: <Star className="h-8 w-8" />
    },
    {
      title: "Professional Tools",
      description: "Access advanced analytics, inventory management, and more",
      icon: <TrendingUp className="h-8 w-8" />
    },
    {
      title: "24/7 Vendor Support",
      description: "Dedicated support team available around the clock",
      icon: <MessageSquare className="h-8 w-8" />
    },
    {
      title: "Marketing Opportunities",
      description: "Featured listings and promotional opportunities available",
      icon: <Award className="h-8 w-8" />
    }
  ];

  const policies = [
    {
      category: "Prohibited Items",
      rules: [
        "Weapons, explosives, or dangerous materials",
        "Stolen goods or fraudulent items",
        "Personal information or identity documents",
        "Harmful or toxic substances",
        "Child exploitation material (zero tolerance)",
        "Services that harm individuals or property"
      ]
    },
    {
      category: "Quality Standards",
      rules: [
        "Products must match descriptions exactly",
        "High-quality photos required for all listings",
        "Accurate weight and quantity specifications",
        "Professional packaging and stealth methods",
        "Prompt shipping within stated timeframes",
        "Honest and transparent communication"
      ]
    },
    {
      category: "Communication Rules",
      rules: [
        "Use only OpesMarket messaging system",
        "Professional and respectful communication",
        "No requests for external contact methods",
        "Respond to customer inquiries within 24 hours",
        "Provide tracking information when available",
        "Handle disputes professionally and promptly"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-card border-b">
        <div className="container px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
                <Store className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
              Selling on OpesMarket
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Comprehensive guide to becoming a successful vendor on OpesMarket. Learn about requirements, 
              best practices, and how to build a thriving business on our secure platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-3" asChild>
                <Link to="/vendor/register">
                  Apply to Become Vendor
                  <Store className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3" asChild>
                <Link to="/contact">
                  Contact Vendor Support
                  <MessageSquare className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-16">
        {/* Important Notice */}
        <Alert className="mb-12 border-2 border-primary/20">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="text-base">
            <strong>Vendor Requirements:</strong> All vendors must complete verification, maintain high performance standards, 
            and comply with our strict quality guidelines. We have zero tolerance for fraudulent activity.
          </AlertDescription>
        </Alert>

        {/* Getting Started Steps */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Getting Started as a Vendor</h2>
            <Separator className="w-24 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Follow these steps to become a verified vendor and start selling on OpesMarket
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {vendorSteps.map((step, index) => (
              <div key={step.step} className="mb-12 last:mb-0">
                <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row items-start gap-8">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 lg:mb-0">
                          {step.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-2xl font-serif font-bold text-foreground">{step.title}</h3>
                          <div className="text-primary">{step.icon}</div>
                        </div>
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{step.description}</p>
                        <div className="bg-muted/40 p-4 rounded-lg border-l-4 border-l-primary">
                          <ul className="space-y-2">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {index < vendorSteps.length - 1 && (
                  <div className="flex justify-center my-6">
                    <div className="w-0.5 h-8 bg-border"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Vendor Requirements</h2>
            <Separator className="w-24 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              All vendors must meet these requirements to maintain their status on OpesMarket
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {requirements.map((req, index) => (
              <Card key={index} className="border-2 shadow-lg">
                <CardHeader className="border-b bg-muted/20">
                  <CardTitle className="text-xl font-serif flex items-center gap-3">
                    {req.icon}
                    {req.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {req.items.map((item, idx) => (
                      <li key={idx} className="text-sm leading-relaxed">
                        <span className="text-muted-foreground">• {item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Vendor Benefits</h2>
            <Separator className="w-24 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Advantages of selling on OpesMarket's secure and trusted platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6 text-primary">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-4">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Policies */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Vendor Policies</h2>
            <Separator className="w-24 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Important policies and guidelines all vendors must follow
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {policies.map((policy, index) => (
              <Card key={index} className="border-2 shadow-lg">
                <CardHeader className="border-b bg-muted/20">
                  <CardTitle className="text-xl font-serif text-foreground">{policy.category}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {policy.rules.map((rule, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground leading-relaxed">
                        • {rule}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Tips */}
        <div className="mb-20">
          <Card className="border-2 shadow-lg max-w-5xl mx-auto">
            <CardHeader className="border-b text-center">
              <CardTitle className="text-2xl font-serif">Tips for Vendor Success</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-serif font-bold mb-4 text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Building Reputation
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Respond to messages within 12 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Ship orders within 24-48 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Use professional packaging</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Provide accurate product descriptions</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-serif font-bold mb-4 text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Maximizing Sales
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Upload high-quality product photos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Offer competitive pricing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Provide multiple shipping options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Maintain good inventory levels</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="border-2 shadow-lg max-w-4xl mx-auto">
            <CardContent className="p-12">
              <div className="mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Store className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                  Ready to Start Selling?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                  Join our community of successful vendors and start building your business on OpesMarket's 
                  secure and trusted platform today.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="px-8 py-3" asChild>
                  <Link to="/vendor/register">
                    Apply Now
                    <Store className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3" asChild>
                  <Link to="/contact">
                    Ask Questions
                    <MessageSquare className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>$250 Vendor Bond</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>2-5 Day Approval</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Bitcoin className="h-4 w-4 text-primary" />
                    <span>Bitcoin Payments</span>
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

export default SellingGuide;