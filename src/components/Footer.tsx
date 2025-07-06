import { Bitcoin, Shield, Lock, Zap } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-card border-t border-border">
      <div className="container px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 sm:col-span-2 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Bitcoin className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-xl sm:text-2xl font-bold bitcoin-gradient">OpesMarket</span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md">
              {t('footer.description', 'The world\'s most secure anonymous marketplace. Trade with confidence using Bitcoin, verified vendors, and AI-powered security systems.')}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-4 w-4 text-verified" />
                <span>{t('vendor.verified', 'Verified Vendors')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Lock className="h-4 w-4 text-trust-high" />
                <span>{t('footer.encrypted', 'End-to-End Encrypted')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Zap className="h-4 w-4 text-secondary" />
                <span>{t('footer.ai_powered', 'AI-Powered')}</span>
              </div>
            </div>
          </div>
          
          {/* Marketplace */}
          <div>
            <h3 className="font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Browse Products</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Verified Vendors</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Categories</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Best Sellers</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security Guide</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2025 OpesMarket. All rights reserved. Bitcoin-only anonymous marketplace.
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Secure • Anonymous • AI-Powered</span>
            <div className="w-2 h-2 bg-trust-high rounded-full animate-trust-pulse" />
            <span>Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;