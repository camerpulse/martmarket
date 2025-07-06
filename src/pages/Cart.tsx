import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bitcoin, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustIndicator from "@/components/TrustIndicator";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsProcessing(true);
    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Proceeding to Checkout",
        description: "Redirecting to secure payment processing...",
      });
      
      // In a real app, this would redirect to actual checkout
      navigate("/auth");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/shop">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              <span className="bitcoin-gradient">Shopping Cart</span>
            </h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          // Empty Cart
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="text-6xl">🛒</div>
              <h2 className="text-2xl font-semibold">Your cart is empty</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Looks like you haven't added any products to your cart yet. Start shopping to fill it up!
              </p>
              <Button asChild>
                <Link to="/shop">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image Placeholder */}
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="text-2xl">📦</div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              by {item.vendor?.store_name || 'Unknown Vendor'}
                            </p>
                            {item.vendor && (
                              <TrustIndicator 
                                score={item.vendor.trust_score} 
                                isVerified={item.vendor.is_verified} 
                                size="sm" 
                              />
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock_quantity}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <Bitcoin className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-primary">
                              {(item.price_btc * item.quantity).toFixed(8)}
                            </span>
                            <span className="text-sm text-muted-foreground">BTC</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Clear Cart */}
              <div className="flex justify-end">
                <Button variant="outline" onClick={clearCart} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <div className="flex items-center gap-1">
                        <Bitcoin className="h-4 w-4 text-primary" />
                        <span>{totalPrice.toFixed(8)} BTC</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee (2%)</span>
                      <div className="flex items-center gap-1">
                        <Bitcoin className="h-4 w-4 text-primary" />
                        <span>{(totalPrice * 0.02).toFixed(8)} BTC</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <div className="flex items-center gap-1">
                        <Bitcoin className="h-4 w-4 text-primary" />
                        <span className="text-primary">
                          {(totalPrice * 1.02).toFixed(8)} BTC
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90" 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Proceed to Checkout"}
                  </Button>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/shop">Continue Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;