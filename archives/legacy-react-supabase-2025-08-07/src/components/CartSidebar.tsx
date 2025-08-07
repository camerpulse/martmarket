import { Bitcoin, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import PurchaseDialog from "./PurchaseDialog";
import { useState } from "react";

const CartSidebar = () => {
  const { items, itemCount, totalPrice, removeFromCart, updateQuantity, clearCart, isOpen, setIsOpen } = useCart();
  const { user } = useAuth();
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      setIsOpen(false);
      // Redirect to auth page or show login modal
      window.location.href = '/auth';
      return;
    }
    setCheckoutDialogOpen(true);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shopping Cart ({itemCount})
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-full mt-6">
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-4">Start shopping to add items to your cart</p>
                <Button onClick={() => setIsOpen(false)}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        <div className="text-2xl">📦</div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium line-clamp-2 text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">by {item.vendor.store_name}</p>
                        
                        {/* Variations */}
                        {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(item.selectedVariations).map(([name, value]) => (
                              <Badge key={name} variant="outline" className="text-xs">
                                {name}: {value}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Bitcoin className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-primary">
                              {(item.finalPrice || item.price_btc).toFixed(8)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 ml-2"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Cart Summary */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <div className="flex items-center gap-2">
                      <Bitcoin className="h-5 w-5 text-primary" />
                      <span className="text-xl font-bold text-primary">
                        {totalPrice.toFixed(8)} BTC
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={clearCart} className="flex-1">
                      Clear Cart
                    </Button>
                    <Button onClick={handleCheckout} className="flex-1">
                      Checkout
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Checkout Dialog */}
      <PurchaseDialog
        product={null}
        cartItems={items}
        open={checkoutDialogOpen}
        onOpenChange={setCheckoutDialogOpen}
      />
    </>
  );
};

export default CartSidebar;