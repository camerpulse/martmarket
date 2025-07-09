import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";
import { Bitcoin, Shield, Users, Zap, Globe, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Bitcoin className="h-12 w-12 text-primary animate-glow" />
              <span className="text-4xl font-bold bitcoin-gradient">OpesMarket</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              About OpesMarket
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The premier AI-powered anonymous marketplace for secure Bitcoin transactions
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Our Mission
            </h2>
            <Card>
              <CardContent className="p-8">
                <p className="text-lg leading-relaxed text-center">
                  OpesMarket is revolutionizing online commerce by providing the world's most secure, private, and intelligent marketplace. We believe in true digital freedom where privacy is paramount, transactions are transparent, and trust is built through cutting-edge AI technology rather than compromising personal data.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardContent className="p-6 text-center">
                <Bitcoin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  Bitcoin-Only
                </h3>
                <p className="text-muted-foreground">
                  Fully decentralized payments using only Bitcoin, ensuring true financial sovereignty and privacy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-verified mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  Military-Grade Security
                </h3>
                <p className="text-muted-foreground">
                  Advanced encryption, multi-signature escrow, and AI-powered fraud detection protect every transaction.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Lock className="h-12 w-12 text-trust-high mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  Complete Privacy
                </h3>
                <p className="text-muted-foreground">
                  Zero personal data collection with anonymous browsing and PGP-encrypted communications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  Trusted Community
                </h3>
                <p className="text-muted-foreground">
                  Verified vendors with reputation-based trust scores and transparent community feedback.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-warning mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  AI-Powered Intelligence
                </h3>
                <p className="text-muted-foreground">
                  Smart recommendations, automated security monitoring, and intelligent dispute resolution.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Globe className="h-12 w-12 text-info mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  Global Accessibility
                </h3>
                <p className="text-muted-foreground">
                  Available worldwide with multilingual support and seamless cross-border transactions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-8">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Privacy First
                </h3>
                <p className="text-muted-foreground">
                  Your privacy is non-negotiable. We never collect personal data and ensure complete anonymity.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-verified">
                  Trust & Safety
                </h3>
                <p className="text-muted-foreground">
                  Building trust through transparency, verified vendors, and AI-powered security measures.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-secondary">
                  Innovation
                </h3>
                <p className="text-muted-foreground">
                  Continuously improving with cutting-edge technology and user-centered design.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;