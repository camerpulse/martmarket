import { HelpCircle, Shield, Bitcoin, Package, MessageSquare, Clock, AlertTriangle, CheckCircle, User, Eye, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const FAQ = () => {
  const faqCategories = [
    {
      category: "Getting Started",
      icon: <User className="h-5 w-5" />,
      questions: [
        {
          question: "How do I create an account on OpesMarket?",
          answer: "Creating an account is simple and anonymous. Visit our registration page, choose a unique username, set a strong password, and enable two-factor authentication. We recommend using a VPN and Tor browser for additional privacy. No personal information is required."
        },
        {
          question: "What do I need to start buying on OpesMarket?",
          answer: "You need: 1) A verified account with 2FA enabled, 2) Bitcoin to fund your wallet, 3) A secure communication method (our encrypted messaging), and 4) A delivery address. We recommend using a VPN and secure email for additional privacy."
        },
        {
          question: "Is OpesMarket legal to use?",
          answer: "OpesMarket operates as a marketplace platform. Users are responsible for complying with their local laws and regulations. We prohibit illegal activities and have strict vendor verification processes. Always research your local laws before making purchases."
        },
        {
          question: "How do I fund my OpesMarket wallet?",
          answer: "We accept Bitcoin only. Go to your wallet section, generate a unique deposit address, and send Bitcoin from your external wallet. Wait for network confirmations (usually 1-3 confirmations). Your balance will appear once confirmed."
        }
      ]
    },
    {
      category: "Payments & Bitcoin",
      icon: <Bitcoin className="h-5 w-5" />,
      questions: [
        {
          question: "Why does OpesMarket only accept Bitcoin?",
          answer: "Bitcoin provides the best combination of privacy, security, and decentralization. Unlike traditional payment methods, Bitcoin transactions can't be reversed, don't require personal information, and give users complete control over their funds."
        },
        {
          question: "How does the escrow system work?",
          answer: "Our multi-signature escrow holds your Bitcoin securely until order completion. Funds are released to vendors only after you confirm delivery or after 14 days automatically. If there's a dispute, our mediation team reviews the case and makes a fair decision."
        },
        {
          question: "What fees does OpesMarket charge?",
          answer: "We charge a 2.5% escrow fee on completed transactions. Vendors pay an additional 1% processing fee. Bitcoin network fees are handled automatically. There are no hidden fees - all costs are displayed clearly during checkout."
        },
        {
          question: "Can I get a refund if something goes wrong?",
          answer: "Yes, our escrow system provides full buyer protection. If you don't receive your order or it's significantly different from described, you can open a dispute. Our mediation team will review the case and can authorize full or partial refunds."
        },
        {
          question: "How long does it take for Bitcoin deposits to show up?",
          answer: "Bitcoin deposits typically appear within 10-60 minutes depending on network congestion. We require 1 confirmation for small amounts (under 0.01 BTC) and 3 confirmations for larger amounts. You'll receive email notifications when deposits are confirmed."
        }
      ]
    },
    {
      category: "Security & Privacy",
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          question: "How secure is OpesMarket?",
          answer: "We use bank-level security including: multi-signature Bitcoin wallets, end-to-end encrypted messaging, 2FA requirements, cold storage for 99% of funds, regular security audits, and 24/7 monitoring systems. We never store personal information."
        },
        {
          question: "Do you keep logs of user activity?",
          answer: "We maintain minimal logs necessary for security and dispute resolution. We don't track browsing habits, don't store personal information, and automatically delete old logs. We operate under strict privacy policies and never cooperate with authorities without valid legal orders."
        },
        {
          question: "Should I use Tor or VPN with OpesMarket?",
          answer: "We strongly recommend using Tor browser and/or a VPN for additional privacy. Our site works perfectly with Tor and we have onion addresses available. This provides an extra layer of anonymity and protects your identity and location."
        },
        {
          question: "How do I secure my OpesMarket account?",
          answer: "Enable 2FA immediately, use a unique strong password, never share login credentials, always log out after sessions, use secure email, enable login notifications, and regularly review your account activity."
        },
        {
          question: "What information do vendors see about me?",
          answer: "Vendors only see your username, shipping address (for delivery), and order details. They cannot see your real name, email, or any other personal information. All communication goes through our encrypted messaging system."
        }
      ]
    },
    {
      category: "Orders & Shipping",
      icon: <Package className="h-5 w-5" />,
      questions: [
        {
          question: "How long do orders take to arrive?",
          answer: "Delivery times vary by vendor and shipping method. Domestic orders typically take 2-5 business days, while international orders can take 1-3 weeks. Check each vendor's shipping policy for specific timeframes and options."
        },
        {
          question: "What if my order doesn't arrive?",
          answer: "If your order doesn't arrive within the expected timeframe, contact the vendor first through our messaging system. If no resolution is reached, open a dispute before the auto-release date. Our mediation team will investigate and can authorize refunds."
        },
        {
          question: "Can I track my order?",
          answer: "Many vendors provide tracking numbers for orders. You'll receive tracking information through our secure messaging system once your order ships. Some vendors use anonymous tracking methods to protect your privacy."
        },
        {
          question: "What if I receive the wrong item?",
          answer: "Contact the vendor immediately through our messaging system with photos of what you received. Most vendors will resolve the issue quickly. If not, open a dispute and our mediation team can authorize exchanges or refunds."
        },
        {
          question: "How discreet is shipping?",
          answer: "All reputable vendors use discreet packaging with no identifying marks. Many use vacuum sealing, multiple layers, and decoy items. Check vendor profiles for their specific stealth and packaging methods."
        }
      ]
    },
    {
      category: "Vendors & Reviews",
      icon: <Eye className="h-5 w-5" />,
      questions: [
        {
          question: "How do I know if a vendor is trustworthy?",
          answer: "Check vendor statistics: completion rate, response time, number of sales, customer reviews, and trust score. Look for vendors with high ratings, many positive reviews, and quick response times. Avoid new vendors with no history."
        },
        {
          question: "Can I message other users?",
          answer: "Yes, you can message any user on the platform through our end-to-end encrypted messaging system. This includes vendors for questions about products, buyers for general inquiries, or anyone for community discussions. All messages are protected with military-grade PGP encryption."
        },
        {
          question: "How do vendor reviews work?",
          answer: "Only verified buyers can leave reviews after completing purchases. Reviews include ratings for product quality, shipping speed, communication, and stealth. Reviews are permanent and cannot be removed, ensuring authenticity."
        },
        {
          question: "What should I do if a vendor asks me to pay outside the platform?",
          answer: "Never pay vendors outside of OpesMarket's escrow system. This is against our terms of service and removes all buyer protections. Report any vendor who asks for direct payments immediately."
        }
      ]
    },
    {
      category: "Disputes & Support",
      icon: <MessageSquare className="h-5 w-5" />,
      questions: [
        {
          question: "When should I open a dispute?",
          answer: "Open a dispute if: your order doesn't arrive within the expected timeframe, you receive wrong/damaged items, the vendor becomes unresponsive, or you suspect fraudulent activity. Always try contacting the vendor first."
        },
        {
          question: "How does dispute resolution work?",
          answer: "Our trained mediation team reviews all evidence including order details, messages, photos, and tracking information. We aim to resolve disputes within 5-7 business days. Decisions can include full refunds, partial refunds, or re-shipment orders."
        },
        {
          question: "How do I contact customer support?",
          answer: "Use our secure contact form or encrypted messaging system. We respond to all inquiries within 24 hours. For urgent issues, mark your message as 'Priority'. We also have community forums for general questions."
        },
        {
          question: "What if I have a technical problem with the site?",
          answer: "Report technical issues through our support system with details about your browser, operating system, and what you were trying to do. We also have a status page showing any known issues or maintenance schedules."
        }
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
                <HelpCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Find answers to common questions about OpesMarket, Bitcoin payments, security, 
              ordering, and vendor interactions. Our comprehensive FAQ covers everything you need to know.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-3" asChild>
                <Link to="/contact">
                  Contact Support
                  <MessageSquare className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3" asChild>
                <Link to="/how-to-order">
                  How to Order
                  <Package className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-16">
        {/* Quick Navigation */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">FAQ Categories</h2>
            <Separator className="w-24 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground">Jump to the section most relevant to your questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faqCategories.map((category, index) => (
              <Card key={index} className="border-2 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="text-primary">{category.icon}</div>
                    <h3 className="font-serif font-bold text-lg">{category.category}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {category.questions.length} Questions
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="max-w-4xl mx-auto">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-muted/20">
                  <CardTitle className="text-2xl font-serif flex items-center gap-3">
                    {category.icon}
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, questionIndex) => (
                      <AccordionItem key={questionIndex} value={`${categoryIndex}-${questionIndex}`} className="border-b-2">
                        <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-muted/20 transition-colors">
                          <span className="font-medium text-foreground pr-4">{item.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <div className="pt-2 text-muted-foreground leading-relaxed">
                            {item.answer}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="text-center mt-16">
          <Card className="border-2 shadow-lg max-w-3xl mx-auto">
            <CardContent className="p-12">
              <div className="mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
                  Still Have Questions?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Can't find what you're looking for? Our support team is available 24/7 
                  to help with any questions or issues.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="px-8 py-3" asChild>
                  <Link to="/contact">
                    Contact Support
                    <MessageSquare className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3" asChild>
                  <Link to="/forum">
                    Community Forum
                    <HelpCircle className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span>Encrypted Communication</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Response Within 24h</span>
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

export default FAQ;