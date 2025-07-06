import { Bitcoin, Search, User, ShoppingBag, Shield, LogOut, MessageCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useVendorStatus } from "@/hooks/useVendorStatus";
import { useAdminStatus } from "@/hooks/useAdminStatus";

const Header = () => {
  const { user, signOut } = useAuth();
  const { isVendor, hasActiveBond, loading } = useVendorStatus();
  const { isAdmin, loading: adminLoading } = useAdminStatus();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Bitcoin className="h-8 w-8 text-primary animate-glow" />
          <span className="text-2xl font-bold bitcoin-gradient">OpesMarket</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products, vendors..."
              className="pl-10 bg-muted/50 border-border focus:border-primary"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="hover:text-primary">
            <Shield className="h-4 w-4 mr-2" />
            Verified Vendors
          </Button>
          <Button variant="ghost" size="sm" className="hover:text-primary">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Cart
          </Button>
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span className="text-muted-foreground">Welcome back!</span>
              </div>
              
              {/* User Profile & Orders Links */}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/orders">My Orders</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/messages">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">Profile</Link>
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
                    <div className="flex items-center space-x-2">
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
                      <Link to="/vendor/register">Become Vendor</Link>
                    </Button>
                  )}
                </>
              )}
              
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
                <Link to="/auth">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                <Link to="/vendor/register">Become Vendor</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;