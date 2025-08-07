import { Bitcoin, Search, User, ShoppingBag, Shield, LogOut, MessageCircle, Settings, Heart, Users, DollarSign, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useVendorStatus } from "@/hooks/useVendorStatus";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useTranslation } from "@/hooks/useTranslation";
import { useCart } from "@/hooks/useCart";
import LanguageSelector from "./LanguageSelector";
import BitcoinPrice from "./BitcoinPrice";
import CartSidebar from "./CartSidebar";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const Header = () => {
  const { user, signOut } = useAuth();
  const { isVendor, hasActiveBond, loading } = useVendorStatus();
  const { isAdmin, loading: adminLoading } = useAdminStatus();
  const { t } = useTranslation();
  const { itemCount, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Bitcoin className="h-7 w-7 md:h-8 md:w-8 text-primary animate-glow" />
          <span className="text-2xl md:text-2xl font-bold bitcoin-gradient">MartMarket</span>
        </Link>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('nav.search', 'Search products, vendors...')}
              className="pl-10 bg-muted/50 border-border focus:border-primary"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          <BitcoinPrice />
          <Button variant="ghost" size="sm" className="hover:text-primary" asChild>
            <Link to="/shop">{t('nav.shop', 'Shop')}</Link>
          </Button>
          <Button variant="ghost" size="sm" className="hover:text-primary" asChild>
            <Link to="/forum">
              <Users className="h-4 w-4 mr-2" />
              {t('nav.forum', 'Forum')}
            </Link>
          </Button>
          {user && (
            <>
              <Button variant="ghost" size="sm" className="hover:text-primary" asChild>
                <Link to="/wishlist">
                  <Heart className="h-4 w-4 mr-2" />
                  {t('nav.wishlist', 'Wishlist')}
                </Link>
              </Button>
               <Button variant="ghost" size="sm" className="hover:text-primary" asChild>
                 <Link to="/affiliate">
                   <DollarSign className="h-4 w-4 mr-2" />
                   {t('nav.affiliate', 'Affiliate')}
                 </Link>
               </Button>
               <Button variant="ghost" size="sm" className="hover:text-primary" asChild>
                 <Link to="/pgp-tools">
                   <Shield className="h-4 w-4 mr-2" />
                   PGP Tools
                 </Link>
               </Button>
            </>
          )}
          <LanguageSelector />
          {user ? (
            <div className="flex items-center space-x-0.5">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span className="text-muted-foreground">Welcome back!</span>
              </div>
              
              {/* User Profile & Orders Links */}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/orders">{t('nav.orders', 'My Orders')}</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/messages">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('nav.messages', 'Messages')}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">{t('nav.profile', 'Profile')}</Link>
              </Button>
              
              {/* Admin Dashboard Link */}
              {!adminLoading && isAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
                </Button>
              )}
              
              {/* Vendor-specific buttons */}
              {!loading && (
                <>
                  {isVendor ? (
                    <div className="flex items-center space-x-1">
                      {hasActiveBond ? (
                        <>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/vendor/dashboard">
                              <Shield className="h-4 w-4 mr-2" />
                              Vendor Dashboard
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/vendor/products">Manage Products</Link>
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/vendor/register">
                            <Shield className="h-4 w-4 mr-2" />
                            Complete Setup
                          </Link>
                        </Button>
                      )}
                    </div>
                   ) : (
                     <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                       <Link to="/vendor/register">{t('nav.become_vendor', 'Become a Vendor')}</Link>
                     </Button>
                   )}
                </>
              )}
              
            {/* Shopping Cart */}
            <Button variant="outline" size="icon" className="relative" onClick={() => setIsOpen(true)}>
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
            
            <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" />
                {t('nav.logout', 'Logout')}
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
                <Link to="/auth">
                  <User className="h-4 w-4 mr-2" />
                  {t('nav.login', 'Login')}
                </Link>
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                <Link to="/vendor/register">{t('nav.become_vendor', 'Become a Vendor')}</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu */}
        <div className="flex items-center space-x-2 lg:hidden">
          <BitcoinPrice />
          <LanguageSelector />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 pt-6">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products, vendors..."
                    className="pl-10 bg-muted/50 border-border focus:border-primary"
                  />
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex flex-col space-y-3">
                  <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link to="/shop">Shop</Link>
                  </Button>
                  
                  <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link to="/forum">
                      <Users className="h-4 w-4 mr-2" />
                      Forum
                    </Link>
                  </Button>

                  {user ? (
                    <>
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/wishlist">
                          <Heart className="h-4 w-4 mr-2" />
                          Wishlist
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/affiliate">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Affiliate
                        </Link>
                      </Button>

                      <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/pgp-tools">
                          <Shield className="h-4 w-4 mr-2" />
                          PGP Tools
                        </Link>
                      </Button>

                      <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/orders">My Orders</Link>
                      </Button>

                      <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/messages">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Messages
                        </Link>
                      </Button>

                      <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/profile">Profile</Link>
                      </Button>

                      {!adminLoading && isAdmin && (
                        <Button variant="outline" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                          <Link to="/admin">
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </Button>
                      )}

                      {!loading && (
                        <>
                          {isVendor ? (
                            <div className="flex flex-col space-y-2">
                              {hasActiveBond ? (
                                <>
                                  <Button variant="outline" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                    <Link to="/vendor/dashboard">
                                      <Shield className="h-4 w-4 mr-2" />
                                      Vendor Dashboard
                                    </Link>
                                  </Button>
                                  <Button variant="outline" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                    <Link to="/vendor/products">Manage Products</Link>
                                  </Button>
                                </>
                              ) : (
                                <Button variant="outline" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                  <Link to="/vendor/register">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Complete Setup
                                  </Link>
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button className="justify-start bg-primary hover:bg-primary/90" asChild onClick={() => setMobileMenuOpen(false)}>
                              <Link to="/vendor/register">Become a Vendor</Link>
                            </Button>
                          )}
                        </>
                      )}

                      <Button variant="ghost" className="justify-start text-destructive" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="justify-start border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/auth">
                          <User className="h-4 w-4 mr-2" />
                          Login
                        </Link>
                      </Button>
                      <Button className="justify-start bg-primary hover:bg-primary/90" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/vendor/register">Become a Vendor</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <CartSidebar />
    </header>
  );
};

export default Header;