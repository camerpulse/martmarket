import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Shield, Calendar, Package, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustIndicator from "@/components/TrustIndicator";
import ProductGrid from "@/components/ProductGrid";

interface VendorProfile {
  vendor_id: string;
  store_name: string;
  trust_score: number;
  is_verified: boolean;
  created_at: string;
  total_sales: number;
  total_reviews: number;
}

const VendorProfile = () => {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendorId) {
      fetchVendor();
    }
  }, [vendorId]);

  const fetchVendor = async () => {
    try {
      const { data: vendorData, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('vendor_id', vendorId)
        .single();

      if (error) throw error;

      // Get additional stats
      const { data: statsData } = await supabase
        .from('orders')
        .select('id, status')
        .eq('vendor_id', vendorId)
        .eq('status', 'completed');

      const totalSales = statsData?.length || 0;

      setVendor({
        ...vendorData,
        total_sales: totalSales,
        total_reviews: 0 // We'll add this when we have reviews
      });
    } catch (error) {
      console.error('Error fetching vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-8">
          <div className="text-center">Loading vendor profile...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Vendor Not Found</h2>
            <Link to="/shop">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link to="/shop" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>
        </div>

        {/* Vendor Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Vendor Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-12 w-12 text-primary" />
                </div>
              </div>

              {/* Vendor Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{vendor.store_name}</h1>
                    <div className="flex items-center gap-4 mb-4">
                      <TrustIndicator 
                        score={vendor.trust_score} 
                        isVerified={vendor.is_verified} 
                      />
                      <Badge variant="outline">Verified Vendor</Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Member since {new Date(vendor.created_at).getFullYear()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{vendor.total_sales} completed sales</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Vendor
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{vendor.trust_score}</div>
              <div className="text-sm text-muted-foreground">Trust Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{vendor.total_sales}</div>
              <div className="text-sm text-muted-foreground">Total Sales</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">99%</div>
              <div className="text-sm text-muted-foreground">Positive Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">24h</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Products */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Products by {vendor.store_name}</h2>
          <ProductGrid searchFilters={{ 
            search: '', 
            category: 'all', 
            priceRange: 'all', 
            sortBy: 'newest',
            vendorId: vendorId 
          }} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VendorProfile;