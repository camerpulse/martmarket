import { Bitcoin, Shield, Lock, Zap } from "lucide-react";
import { Link } from "react-router-dom";
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
            <h3 className="font-semibold mb-4">{t('footer.menu.marketplace')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/shop" className="hover:text-primary transition-colors">{t('footer.menu.browse_products')}</Link></li>
              <li><Link to="/vendors" className="hover:text-primary transition-colors">{t('footer.menu.verified_vendors')}</Link></li>
              <li><Link to="/how-to-order" className="hover:text-primary transition-colors">{t('footer.menu.how_to_order')}</Link></li>
              <li><Link to="/selling-guide" className="hover:text-primary transition-colors">{t('footer.menu.selling_guide')}</Link></li>
              <li><Link to="/escrow-security" className="hover:text-primary transition-colors">{t('footer.menu.escrow_security')}</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition-colors">{t('footer.menu.categories')}</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.menu.support')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary transition-colors">{t('footer.menu.faq')}</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">{t('footer.menu.about_us')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t('footer.menu.contact')}</Link></li>
              <li><Link to="/safety-terms" className="hover:text-primary transition-colors">{t('footer.menu.forbidden')}</Link></li>
              <li><Link to="/pgp-tools" className="hover:text-primary transition-colors">{t('footer.menu.pgp_tools')}</Link></li>
              <li><Link to="/forum" className="hover:text-primary transition-colors">{t('footer.menu.help_center')}</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            {t('footer.copyright')}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{t('footer.status.secure')}</span>
            <div className="w-2 h-2 bg-trust-high rounded-full animate-trust-pulse" />
            <span>{t('footer.status.online')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;