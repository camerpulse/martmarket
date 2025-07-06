import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentStatus } from "@/components/PaymentStatus";
import { ReviewSystem } from "@/components/ReviewSystem";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Order {
  id: string;
  status: string;
  total_btc: number;
  platform_fee_btc: number;
  quantity: number;
  created_at: string;
  shipping_address: string | null;
  vendor_id: string;
  products: {
    title: string;
    description: string;
    price_btc: number;
  };
  vendor_profiles: {
    store_name: string;
  };
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !user) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('buyer_id', user.id)
          .single();

        if (error) throw error;
        
        // Get product and vendor info separately
        const [productResult, vendorResult] = await Promise.all([
          supabase.from('products').select('title, description, price_btc').eq('id', data.product_id).single(),
          supabase.from('vendor_profiles').select('store_name').eq('vendor_id', data.vendor_id).single()
        ]);

        const orderWithDetails = {
          ...data,
          products: productResult.data,
          vendor_profiles: vendorResult.data
        };

        setOrder(orderWithDetails);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The order you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order Confirmation</h1>
            <p className="text-muted-foreground">Order ID: {order.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Order Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{order.products?.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    by {order.vendor_profiles?.store_name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {order.products?.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <div className="font-medium">{order.quantity}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Unit Price:</span>
                    <div className="font-medium">{order.products?.price_btc} BTC</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Platform Fee:</span>
                    <div className="font-medium">{order.platform_fee_btc} BTC</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <div className="font-medium text-primary">{order.total_btc} BTC</div>
                  </div>
                </div>

                {order.shipping_address && (
                  <div>
                    <span className="text-muted-foreground text-sm">Shipping Address:</span>
                    <div className="mt-1 p-2 bg-muted rounded text-sm">
                      {order.shipping_address}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Escrow Protection Info */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-primary">Escrow Protection Active</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your payment is safely held in escrow. The vendor will only receive 
                      payment after you confirm delivery or after 7 days if no disputes are raised.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Status */}
          <div>
            <PaymentStatus 
              orderId={order.id}
              buyerId={user.id}
              vendorId={order.vendor_id}
            />
          </div>
        </div>

        {/* Dispute Section - Show for completed orders if something went wrong */}
        {(order.status === 'completed' || order.status === 'shipped' || order.status === 'paid') && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Having an Issue?</CardTitle>
                <CardDescription>
                  If you're experiencing problems with your order, you can file a dispute.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    // This will be handled by a modal or navigation to dispute form
                    console.log('File dispute for order:', order.id);
                  }}
                >
                  File a Dispute
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Review Section - Show after order is completed */}
        {(order.status === 'completed' || order.status === 'paid') && (
          <div className="mt-8">
            <ReviewSystem 
              vendorId={order.vendor_id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;