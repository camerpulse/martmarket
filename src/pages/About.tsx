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
              {t('about.title', 'About OpesMarket')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('about.subtitle', 'The world\'s most secure anonymous marketplace, powered by Bitcoin and AI technology.')}
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {t('about.mission.title', 'Our Mission')}
            </h2>
            <Card>
              <CardContent className="p-8">
                <p className="text-lg leading-relaxed text-center">
                  {t('about.mission.description', 'OpesMarket is dedicated to creating a secure, anonymous, and trustworthy marketplace where privacy is paramount. We leverage cutting-edge Bitcoin technology and AI-powered security systems to ensure safe transactions while maintaining complete user anonymity.')}
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
                  {t('about.features.bitcoin.title', 'Bitcoin Only')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.features.bitcoin.description', 'All transactions are conducted exclusively in Bitcoin, ensuring true financial privacy and decentralization.')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-verified mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  {t('about.features.security.title', 'AI Security')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.features.security.description', 'Advanced AI algorithms continuously monitor and protect against fraud, ensuring a safe trading environment.')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Lock className="h-12 w-12 text-trust-high mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  {t('about.features.privacy.title', 'Anonymous')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.features.privacy.description', 'Complete anonymity with end-to-end encryption and no personal data collection.')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  {t('about.features.vendors.title', 'Verified Vendors')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.features.vendors.description', 'All vendors undergo strict verification processes to ensure product quality and reliability.')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-warning mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  {t('about.features.escrow.title', 'Smart Escrow')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.features.escrow.description', 'Automated escrow system protects both buyers and sellers with intelligent dispute resolution.')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Globe className="h-12 w-12 text-info mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  {t('about.features.global.title', 'Global Access')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.features.global.description', 'Available worldwide with multi-language support and 24/7 accessibility.')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-8">
              {t('about.values.title', 'Our Values')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  {t('about.values.privacy.title', 'Privacy First')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.values.privacy.description', 'Your privacy is non-negotiable. We never collect personal data and ensure complete anonymity.')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-verified">
                  {t('about.values.trust.title', 'Trust & Safety')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.values.trust.description', 'Building trust through transparency, verified vendors, and AI-powered security measures.')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-secondary">
                  {t('about.values.innovation.title', 'Innovation')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.values.innovation.description', 'Continuously improving with cutting-edge technology and user-centered design.')}
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