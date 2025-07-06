import { useState } from "react";
import { Bitcoin, Shield, Clock, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  description: string;
  price_btc: number;
  stock_quantity: number;
  shipping_info: string;
  vendor_id: string; // Add vendor_id to interface
  vendor: {
    store_name: string;
    trust_score: number;
    is_verified: boolean;
  };
  category: {
    name: string;
  };
}

interface PurchaseDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PurchaseDialog = ({ product, open, onOpenChange }: PurchaseDialogProps) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [processing, setProcessing] = useState(false);

  if (!product) return null;

  const subtotal = product.price_btc * quantity;
  const platformFee = subtotal * 0.05; // 5% platform fee
  const total = subtotal + platformFee;

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please login to make a purchase");
      return;
    }

    if (quantity > product.stock_quantity) {
      toast.error("Not enough stock available");
      return;
    }

    setProcessing(true);
    
    try {
      // Create order with escrow
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          vendor_id: product.vendor_id, // Use actual vendor_id
          product_id: product.id,
          quantity,
          total_btc: total,
          platform_fee_btc: platformFee,
          shipping_address: shippingAddress || null,
          status: 'pending_payment'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Generate Bitcoin address for escrow payment
      const { data: addressData, error: addressError } = await supabase.functions.invoke(
        'generate-bitcoin-address',
        {
          body: {
            purpose: 'escrow',
            order_id: order.id,
            user_id: user.id
          }
        }
      );

      if (addressError) throw addressError;

      // Create payment request
      const { error: paymentError } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          order_id: order.id,
          bitcoin_address_id: addressData.address_id,
          amount_satoshis: Math.round(total * 100000000), // Convert BTC to satoshis
          payment_type: 'escrow',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        });

      if (paymentError) throw paymentError;

      toast.success("Order created! Redirecting to payment...");
      
      // Redirect to order confirmation page
      window.location.href = `/order/${order.id}`;
      
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Secure Purchase with Escrow</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-2xl">📦</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    by {product.vendor.store_name}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {product.category.name}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Bitcoin className="h-4 w-4 text-primary" />
                    <span className="font-bold text-primary">{product.price_btc} BTC</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stock_quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div>
              <Label>Shipping Info</Label>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground p-2 bg-muted rounded">
                <Truck className="h-4 w-4" />
                <span>{product.shipping_info}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <Label htmlFor="shipping">Shipping Address (if required)</Label>
            <Textarea
              id="shipping"
              placeholder="Enter your shipping address if this product requires physical delivery..."
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              rows={3}
            />
          </div>

          {/* Special Instructions */}
          <div>
            <Label htmlFor="instructions">Special Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Any special instructions for the vendor..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={2}
            />
          </div>

          <Separator />

          {/* Price Breakdown */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Price Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({quantity}x)</span>
                  <span className="flex items-center space-x-1">
                    <Bitcoin className="h-4 w-4 text-primary" />
                    <span>{subtotal.toFixed(8)} BTC</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (5%)</span>
                  <span className="flex items-center space-x-1">
                    <Bitcoin className="h-4 w-4 text-primary" />
                    <span>{platformFee.toFixed(8)} BTC</span>
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="flex items-center space-x-1 text-primary">
                    <Bitcoin className="h-5 w-5" />
                    <span>{total.toFixed(8)} BTC</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-primary">Escrow Protection</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your payment will be held in escrow until you confirm delivery. 
                    The vendor will only receive payment after successful completion.
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Auto-release: 7 days</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Dispute protection</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={processing || !user || quantity > product.stock_quantity}
            className="w-full h-12 text-lg"
          >
            {processing ? (
              "Processing..."
            ) : !user ? (
              "Login Required"
            ) : quantity > product.stock_quantity ? (
              "Out of Stock"
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Create Escrow Order - {total.toFixed(8)} BTC
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;