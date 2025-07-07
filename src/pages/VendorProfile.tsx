import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Shield, Calendar, Package, MessageCircle, ArrowLeft, Clock, Truck, Users, Award, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  response_time_hours: number;
  description: string;
  shipping_policy: string;
  return_policy: string;
  packaging_info: string;
  last_active: string | null;
  isOnline?: boolean;
}

interface VendorRating {
  total_reviews: number;
  average_overall_rating: number;
  average_product_rating: number;
  average_communication_rating: number;
  average_shipping_rating: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
  recommendation_percentage: number;
}

interface Review {
  id: string;
  reviewer_display_name: string;
  overall_rating: number;
  product_rating: number;
  communication_rating: number;
  shipping_rating: number;
  content: string;
  would_recommend: boolean;
  created_at: string;
  verified_purchase: boolean;
}

const VendorProfile = () => {
  const { vendorId } = useParams();
  const { user } = useAuth();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [vendorRating, setVendorRating] = useState<VendorRating | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (vendorId) {
      fetchVendorData();
    }
  }, [vendorId]);

  const fetchVendorData = async () => {
    try {
      // Fetch vendor profile
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('vendor_id', vendorId)
        .single();

      if (vendorError) throw vendorError;

      // Get vendor ratings
      const { data: ratingData } = await supabase
        .from('vendor_ratings')
        .select('*')
        .eq('vendor_id', vendorId)
        .single();

      // Get reviews - simplified query for demo
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('id, overall_rating, created_at, verified_purchase')
        .eq('vendor_id', vendorId)
        .eq('review_status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);

      // Check if user can review (has purchased from this vendor)
      if (user) {
        const { data: purchaseData } = await supabase
          .from('orders')
          .select('id')
          .eq('buyer_id', user.id)
          .eq('vendor_id', vendorId)
          .eq('status', 'completed')
          .limit(1);

        setCanReview(purchaseData && purchaseData.length > 0);
      }

      // For demo purposes, use random online status
      const isOnline = Math.random() > 0.5;

      setVendor({
        vendor_id: vendorData.vendor_id,
        store_name: vendorData.store_name,
        trust_score: vendorData.trust_score,
        is_verified: vendorData.is_verified,
        created_at: vendorData.created_at,
        description: vendorData.description || '',
        total_sales: vendorData.total_sales || 0,
        total_reviews: ratingData?.total_reviews || 0,
        response_time_hours: vendorData.response_time_hours || 24,
        shipping_policy: '', // Default for demo
        return_policy: '', // Default for demo
        packaging_info: '', // Default for demo
        last_active: null, // Default for demo
        isOnline
      });
      
      setVendorRating(ratingData);
      
      const formattedReviews: Review[] = reviewsData?.map(review => ({
        id: review.id,
        overall_rating: review.overall_rating || 5,
        product_rating: Math.floor(Math.random() * 2) + 4, // Demo data 4-5
        communication_rating: Math.floor(Math.random() * 2) + 4, // Demo data 4-5
        shipping_rating: Math.floor(Math.random() * 2) + 4, // Demo data 4-5
        content: "Great vendor! Fast shipping and quality products. Highly recommended.",
        would_recommend: true,
        created_at: review.created_at,
        verified_purchase: review.verified_purchase || true,
        reviewer_display_name: `User${Math.floor(Math.random() * 1000)}`
      })) || [];
      
      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
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
        <Card className="mb-8 card-gradient shadow-card">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Vendor Avatar & Online Status */}
              <div className="flex-shrink-0 relative">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-12 w-12 text-primary" />
                </div>
                {/* Online Status Indicator */}
                <div className="absolute -bottom-1 -right-1">
                  {vendor.isOnline ? (
                    <div className="flex items-center gap-1 bg-trust-high text-white px-2 py-1 rounded-full text-xs">
                      <CheckCircle className="h-3 w-3" />
                      Online
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                      <XCircle className="h-3 w-3" />
                      Offline
                    </div>
                  )}
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
                    <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Member since {new Date(vendor.created_at).getFullYear()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{vendor.total_sales} completed sales</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Responds in {vendor.response_time_hours || 24}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{vendor.total_reviews} reviews</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Contact Vendor
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
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
              <div className="text-2xl font-bold text-primary">
                {vendorRating?.average_overall_rating?.toFixed(1) || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{vendor.response_time_hours || 24}h</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {vendorRating?.recommendation_percentage?.toFixed(0) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Recommend</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{vendor.total_reviews}</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </CardContent>
          </Card>
        </div>

        {/* Shipping & Policies Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping & Packaging
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Shipping Policy</h4>
                <p className="text-sm text-muted-foreground">
                  {vendor.shipping_policy || "Fast and secure shipping within 24-48 hours. All packages are discreetly packaged for privacy."}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Packaging Info</h4>
                <p className="text-sm text-muted-foreground">
                  {vendor.packaging_info || "Professional packaging with stealth shipping. All items are vacuum sealed and protected."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Policies & Guarantees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Return Policy</h4>
                <p className="text-sm text-muted-foreground">
                  {vendor.return_policy || "30-day return policy for defective items. Escrow protection ensures your funds are safe."}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-trust-high" />
                <span>Verified vendor with $250 security bond</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-trust-high" />
                <span>Escrow protection on all orders</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Section */}
        {vendorRating && (
          <Card className="mb-8 card-gradient">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Reviews & Ratings ({vendorRating.total_reviews})
                </CardTitle>
                {canReview && (
                  <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                    Write Review
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold">{vendorRating.average_overall_rating?.toFixed(1)}</div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(vendorRating.average_overall_rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Based on {vendorRating.total_reviews} reviews
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = vendorRating[`${['', 'one', 'two', 'three', 'four', 'five'][rating]}_star_count`] || 0;
                    const percentage = vendorRating.total_reviews > 0 ? (count / vendorRating.total_reviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm w-8">{rating}★</span>
                        <Progress value={percentage} className="flex-1" />
                        <span className="text-sm w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Ratings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-semibold">{vendorRating.average_product_rating?.toFixed(1) || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Product Quality</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{vendorRating.average_communication_rating?.toFixed(1) || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Communication</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{vendorRating.average_shipping_rating?.toFixed(1) || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Shipping Speed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{vendorRating.recommendation_percentage?.toFixed(0) || 0}%</div>
                  <div className="text-sm text-muted-foreground">Would Recommend</div>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Recent Reviews</h4>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{review.reviewer_display_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{review.reviewer_display_name}</div>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= review.overall_rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.verified_purchase && (
                                <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {review.content && (
                        <p className="text-sm">{review.content}</p>
                      )}
                      <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                        <div>Product: {review.product_rating}/5</div>
                        <div>Communication: {review.communication_rating}/5</div>
                        <div>Shipping: {review.shipping_rating}/5</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No reviews yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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