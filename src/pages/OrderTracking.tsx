import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock, ArrowLeft, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  timestamp: string;
  location?: string;
}

interface Order {
  id: string;
  status: string;
  created_at: string;
  tracking_number?: string;
  total_btc: number;
  shipping_address?: string;
  product: {
    title: string;
    vendor: {
      store_name: string;
    };
  };
  tracking_events: TrackingEvent[];
}

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (orderId) {
      trackOrder();
    }
  }, [orderId]);

  const trackOrder = async () => {
    if (!orderId.trim()) return;
    
    setLoading(true);
    setNotFound(false);
    
    try {
      // First try to find by order ID
        let query = supabase
          .from('orders')
          .select(`
            *,
            products!inner(
              title
            )
          `)
          .eq('id', orderId);

      // If user is logged in, only show their orders
      if (user) {
        query = query.eq('buyer_id', user.id);
      }

      let { data: orderData, error } = await query.single();

      // If not found by ID and user provided what looks like a tracking number
      if (!orderData && orderId.length > 10) {
        query = supabase
          .from('orders')
          .select(`
            *,
            products!inner(
              title
            )
          `)
          .eq('tracking_number', orderId);

        if (user) {
          query = query.eq('buyer_id', user.id);
        }

        const result = await query.single();
        orderData = result.data;
        error = result.error;
      }

      if (error || !orderData) {
        setNotFound(true);
        return;
      }

      // Generate mock tracking events based on order status
      const trackingEvents = generateTrackingEvents(orderData);

      // Get vendor info separately
      const { data: vendorData } = await supabase
        .from('vendor_profiles')
        .select('store_name')
        .eq('vendor_id', orderData.vendor_id)
        .single();

      setOrder({
        ...orderData,
        product: {
          title: orderData.products.title,
          vendor: {
            store_name: vendorData?.store_name || 'Unknown Vendor',
          },
        },
        tracking_events: trackingEvents,
      });
    } catch (error) {
      console.error('Error tracking order:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingEvents = (orderData: any): TrackingEvent[] => {
    const events: TrackingEvent[] = [
      {
        id: '1',
        status: 'created',
        description: 'Order placed and payment received',
        timestamp: orderData.created_at,
        location: 'OpesMarket Platform',
      },
    ];

    const orderDate = new Date(orderData.created_at);
    
    if (['processing', 'shipped', 'delivered', 'completed'].includes(orderData.status)) {
      events.push({
        id: '2',
        status: 'processing',
        description: 'Order confirmed by vendor and being prepared',
        timestamp: new Date(orderDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        location: 'Vendor Facility',
      });
    }

    if (['shipped', 'delivered', 'completed'].includes(orderData.status)) {
      events.push({
        id: '3',
        status: 'shipped',
        description: 'Package shipped and in transit',
        timestamp: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        location: 'Distribution Center',
      });
    }

    if (['delivered', 'completed'].includes(orderData.status)) {
      events.push({
        id: '4',
        status: 'delivered',
        description: 'Package delivered successfully',
        timestamp: new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Destination',
      });
    }

    return events.reverse(); // Show latest first
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-yellow-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending_payment: { variant: "secondary", text: "Pending Payment" },
      processing: { variant: "default", text: "Processing" },
      shipped: { variant: "default", text: "Shipped" },
      delivered: { variant: "default", text: "Delivered" },
      completed: { variant: "default", text: "Completed" },
      cancelled: { variant: "destructive", text: "Cancelled" },
    };
    
    const config = variants[status] || { variant: "secondary", text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-6">
          <Link to="/orders" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Track Your Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter order ID or tracking number..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={trackOrder} disabled={loading || !orderId.trim()}>
                {loading ? 'Tracking...' : 'Track Order'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {notFound && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
              <p className="text-muted-foreground">
                We couldn't find an order with that ID or tracking number. Please check and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Order ID</div>
                    <div className="font-mono text-sm">{order.id.slice(0, 8)}...</div>
                  </div>
                  
                  {order.tracking_number && (
                    <div>
                      <div className="text-sm text-muted-foreground">Tracking Number</div>
                      <div className="font-mono text-sm">{order.tracking_number}</div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="mt-1">{getStatusBadge(order.status)}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Product</div>
                    <div className="font-medium">{order.product.title}</div>
                    <div className="text-sm text-muted-foreground">by {order.product.vendor.store_name}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="font-semibold">{order.total_btc.toFixed(8)} BTC</div>
                  </div>

                  {order.shipping_address && (
                    <div>
                      <div className="text-sm text-muted-foreground">Shipping Address</div>
                      <div className="text-sm">{order.shipping_address}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tracking Timeline */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tracking Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {order.tracking_events.map((event, index) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {getStatusIcon(event.status)}
                          {index < order.tracking_events.length - 1 && (
                            <div className="w-px h-12 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{event.description}</h4>
                            <div className="text-sm text-muted-foreground">
                              {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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

export default OrderTracking;