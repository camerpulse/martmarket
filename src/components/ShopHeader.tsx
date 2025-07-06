import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Package, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface ShopHeaderProps {
  onSearchChange: (search: string) => void;
  searchValue: string;
}

const ShopHeader = ({ onSearchChange, searchValue }: ShopHeaderProps) => {
  const navigate = useNavigate();
  const { items } = useCart();
  const { toast } = useToast();
  const [notifications] = useState(2); // Mock notifications
  
  const cartCount = items.length;

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleNotificationsClick = () => {
    navigate("/notifications");
  };

  const handleTrackOrderClick = () => {
    navigate("/track-order");
  };

  return (
    <Card className="mb-4 sm:mb-8">
      <CardContent className="p-3 sm:p-4 md:p-6">
        {/* Mobile-First Layout */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4 sm:items-center">
          {/* Search Bar - Full width on mobile */}
          <div className="flex-1 w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-10 sm:h-12 text-sm sm:text-lg w-full"
              />
            </div>
          </div>

          {/* Action Buttons - Prominent on mobile */}
          <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Track Order - Icon only on mobile */}
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
              onClick={handleTrackOrderClick}
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Track Order</span>
            </Button>

            {/* Notifications - Always visible */}
            <Button 
              variant="outline" 
              size="sm" 
              className="relative p-2"
              onClick={handleNotificationsClick}
            >
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Shopping Cart - Always prominent */}
            <Button 
              variant="outline" 
              size="sm" 
              className="relative p-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={handleCartClick}
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats - Simplified on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-primary">12.5K+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Products</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-primary">850+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Vendors</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-primary">50K+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Customers</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-primary">99.5%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Success</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopHeader;