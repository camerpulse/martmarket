import { Shield, Zap, Lock, Award, Bitcoin } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "@/hooks/useTranslation";

const Hero = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="hero-bg absolute inset-0" />
      <div className="container relative px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            <span className="bitcoin-gradient">{t('marketplace.title', 'AI-Powered')}</span> {t('hero.anonymous', 'Anonymous')}
            <br />
            {t('hero.marketplace', 'Marketplace')}
          </h1>
          
          {/* Subheading */}
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in max-w-2xl mx-auto">
            {t('marketplace.subtitle', 'Trade securely with Bitcoin-only transactions, verified vendors, and AI-driven trust scoring.')} 
            {t('hero.privacy', 'Your privacy is our priority.')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
            <Button size="lg" className="bg-primary hover:bg-primary/90 glow-primary">
              {t('hero.start_shopping', 'Start Shopping')}
            </Button>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              {t('hero.become_vendor', 'Become a Vendor')}
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-6 card-gradient rounded-lg shadow-card transition-smooth hover:scale-105">
              <Bitcoin className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">{t('hero.features.bitcoin', 'Bitcoin Only')}</h3>
              <p className="text-sm text-muted-foreground text-center">
                {t('hero.features.bitcoin_desc', 'Secure, private transactions with built-in escrow')}
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 card-gradient rounded-lg shadow-card transition-smooth hover:scale-105">
              <Shield className="h-8 w-8 text-verified mb-3" />
              <h3 className="font-semibold mb-2">{t('vendor.verified', 'Verified Vendors')}</h3>
              <p className="text-sm text-muted-foreground text-center">
                {t('hero.features.vendors_desc', '$250 annual bond ensures quality and accountability')}
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 card-gradient rounded-lg shadow-card transition-smooth hover:scale-105">
              <Zap className="h-8 w-8 text-secondary mb-3" />
              <h3 className="font-semibold mb-2">{t('hero.features.ai', 'AI-Powered')}</h3>
              <p className="text-sm text-muted-foreground text-center">
                {t('hero.features.ai_desc', 'Smart fraud detection and dynamic trust scoring')}
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 card-gradient rounded-lg shadow-card transition-smooth hover:scale-105">
              <Lock className="h-8 w-8 text-trust-high mb-3" />
              <h3 className="font-semibold mb-2">{t('hero.features.anonymous', 'Anonymous')}</h3>
              <p className="text-sm text-muted-foreground text-center">
                {t('hero.features.anonymous_desc', 'End-to-end encryption with optional Tor support')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;