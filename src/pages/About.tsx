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
              {t('about.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {t('about.mission.title')}
            </h2>
            <Card>
              <CardContent className="p-8">
                <p className="text-lg leading-relaxed text-center">
                  {t('about.mission.text')}
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
                  {t('about.feature.bitcoin_only')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.feature.bitcoin_desc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-verified mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  {t('about.feature.security')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.feature.security_desc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Lock className="h-12 w-12 text-trust-high mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  {t('about.feature.privacy')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.feature.privacy_desc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  {t('about.feature.community')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.feature.community_desc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-warning mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  {t('about.feature.ai')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.feature.ai_desc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Globe className="h-12 w-12 text-info mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  {t('about.feature.global')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.feature.global_desc')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-8">
              {t('about.values.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  {t('about.values.privacy')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.values.privacy_desc')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-verified">
                  {t('about.values.trust')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.values.trust_desc')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-secondary">
                  {t('about.values.innovation')}
                </h3>
                <p className="text-muted-foreground">
                  {t('about.values.innovation_desc')}
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