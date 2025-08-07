import { ShoppingCart, Bitcoin, Shield, Clock, CheckCircle, AlertTriangle, User, Package, CreditCard, MessageSquare, Star, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const HowToOrder = () => {
  const orderSteps = [
    {
      step: 1,
      title: "Create Your Account",
      description: "Register with a secure username and enable two-factor authentication",
      icon: <User className="h-6 w-6" />,
      details: [
        "Choose a unique, anonymous username",
        "Set a strong password (12+ characters)",
        "Enable 2FA with authenticator app",
        "Verify your email address",
        "Complete security setup wizard"
      ]
    },
    {
      step: 2,
      title: "Browse Products",
      description: "Search through verified vendor listings and product categories",
      icon: <Eye className="h-6 w-6" />,
      details: [
        "Use category filters to narrow search",
        "Check vendor ratings and reviews",
        "Compare prices across vendors",
        "Read product descriptions carefully",
        "Check shipping policies and times"
      ]
    },
    {
      step: 3,
      title: "Fund Your Wallet",
      description: "Add Bitcoin to your secure MartMarket wallet",
      icon: <Bitcoin className="h-6 w-6" />,
      details: [
        "Generate unique deposit address",
        "Send Bitcoin from your wallet",
        "Wait for network confirmations",
        "Funds appear in your account",
        "Check current Bitcoin rates"
      ]
    },
    {
      step: 4,
      title: "Place Your Order",
      description: "Select products and proceed through secure checkout",
      icon: <ShoppingCart className="h-6 w-6" />,
      details: [
        "Add items to cart",
        "Review order details",
        "Enter shipping information",
        "Select shipping method",
        "Confirm order placement"
      ]
    },
    {
      step: 5,
      title: "Escrow Protection",
      description: "Your Bitcoin is held securely until order completion",
      icon: <Shield className="h-6 w-6" />,
      details: [
        "Funds locked in multi-sig escrow",
        "Vendor receives order notification",
        "Order processing begins",
        "Tracking information provided",
        "Automatic dispute protection"
      ]
    },
    {
      step: 6,
      title: "Receive & Review",
      description: "Confirm delivery and leave feedback for the vendor",
      icon: <Package className="h-6 w-6" />,
      details: [
        "Receive package discreetly",
        "Verify product quality",
        "Release escrow funds",
        "Leave honest vendor review",
        "Build your reputation score"
      ]
    }
  ];

  const securityTips = [
    {
      title: "Account Security",
      tips: [
        "Never share your login credentials",
        "Use unique passwords for MartMarket",
        "Enable 2FA on all accounts",
        "Log out after each session",
        "Use VPN for additional privacy"
      ]
    },
    {
      title: "Payment Safety",
      tips: [
        "Only use Bitcoin for payments",
        "Verify wallet addresses carefully",
        "Never send Bitcoin directly to vendors",
        "Use our escrow system exclusively",
        "Keep transaction records private"
      ]
    },
    {
      title: "Communication",
      tips: [
        "Use only our encrypted messaging",
        "Never share personal information",
        "Keep all communication on-platform",
        "Don't click external links",
        "Report suspicious behavior"
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
                <ShoppingCart className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
              How to Order
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Complete step-by-step guide to placing your first secure order on OpesMarket. 
              Learn how to buy safely with Bitcoin while maintaining your privacy and security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-3" asChild>
                <Link to="/auth">
                  Create Account Now
                  <User className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3" asChild>
                <Link to="/shop">
                  Browse Products
                  <Eye className="ml-2 h-5 w-5" />
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
            <strong>Important:</strong> Always use our secure escrow system and never send Bitcoin directly to vendors. 
            OpesMarket provides buyer protection through multi-signature escrow for all transactions.
          </AlertDescription>
        </Alert>

        {/* Step-by-Step Guide */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Step-by-Step Ordering Process</h2>
            <Separator className="w-24 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Follow these steps to place your first secure order on OpesMarket. Each step includes important 
              security considerations and best practices.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {orderSteps.map((step, index) => (
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
                {index < orderSteps.length - 1 && (
                  <div className="flex justify-center my-6">
                    <div className="w-0.5 h-8 bg-border"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Guidelines */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Security Guidelines</h2>
            <Separator className="w-24 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Essential security practices to protect yourself while ordering on OpesMarket.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {securityTips.map((section, index) => (
              <Card key={index} className="border-2 shadow-lg">
                <CardHeader className="border-b bg-muted/20">
                  <CardTitle className="text-xl font-serif flex items-center gap-3">
                    <Shield className="h-6 w-6 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {section.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Information */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Payment Information</h2>
            <Separator className="w-24 mx-auto mb-6" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-xl font-serif flex items-center gap-3">
                  <Bitcoin className="h-6 w-6 text-primary" />
                  Bitcoin Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">
                  OpesMarket exclusively uses Bitcoin for all transactions to ensure privacy and security.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm">All payments processed through secure escrow</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm">Automatic exchange rate calculations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm">Network fees handled automatically</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm">Instant deposit confirmations</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-xl font-serif flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  Escrow Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">
                  Your Bitcoin is protected by our multi-signature escrow system throughout the entire transaction.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm">Funds held until delivery confirmation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm">Automatic release after 14 days</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm">Dispute resolution available</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm">Full refund protection</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="mb-20">
          <Card className="border-2 shadow-lg max-w-4xl mx-auto">
            <CardHeader className="border-b text-center">
              <CardTitle className="text-2xl font-serif">Quick Reference Checklist</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-serif font-bold mb-4 text-lg">Before Ordering:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Account verified and 2FA enabled</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Bitcoin wallet funded</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Vendor ratings reviewed</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Shipping policies understood</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-serif font-bold mb-4 text-lg">After Ordering:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Order confirmation received</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Tracking information monitored</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Package received and verified</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Honest review left for vendor</span>
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
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                  Ready to Start Shopping?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                  Join thousands of satisfied customers who trust OpesMarket for secure, private shopping. 
                  Start your journey with complete buyer protection.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="px-8 py-3" asChild>
                  <Link to="/auth">
                    Create Free Account
                    <User className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3" asChild>
                  <Link to="/contact">
                    Need Help?
                    <MessageSquare className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>100% Escrow Protected</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Bitcoin className="h-4 w-4 text-primary" />
                    <span>Bitcoin Only Payments</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span>Verified Vendors Only</span>
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

export default HowToOrder;