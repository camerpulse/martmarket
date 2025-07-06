import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Shield, 
  TrendingUp,
  MessageSquare,
  Package,
  Truck,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Review {
  id: string;
  reviewer_id: string;
  vendor_id: string;
  order_id: string;
  overall_rating: number;
  product_rating?: number;
  communication_rating?: number;
  shipping_rating?: number;
  would_recommend: boolean;
  review_title?: string;
  comment?: string;
  helpful_votes: number;
  verified_purchase: boolean;
  review_images?: string[];
  created_at: string;
  reviewer_profile?: { display_name: string };
  order?: { products: { title: string } };
}

interface VendorRating {
  vendor_id: string;
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

interface ReviewSystemProps {
  vendorId?: string;
  productId?: string;
  showSummary?: boolean;
  maxReviews?: number;
}

const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );
};

const RatingBreakdown = ({ vendorRating }: { vendorRating: VendorRating }) => {
  const total = vendorRating.total_reviews;
  
  const ratingBreakdown = [
    { stars: 5, count: vendorRating.five_star_count },
    { stars: 4, count: vendorRating.four_star_count },
    { stars: 3, count: vendorRating.three_star_count },
    { stars: 2, count: vendorRating.two_star_count },
    { stars: 1, count: vendorRating.one_star_count },
  ];

  return (
    <div className="space-y-2">
      {ratingBreakdown.map((item) => (
        <div key={item.stars} className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm min-w-[60px]">
            <span>{item.stars}</span>
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          </div>
          <Progress 
            value={(item.count / total) * 100} 
            className="flex-1 h-2"
          />
          <span className="text-sm text-muted-foreground min-w-[40px] text-right">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, onHelpfulVote }: { 
  review: Review; 
  onHelpfulVote: (reviewId: string, isHelpful: boolean) => void;
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {review.reviewer_profile?.display_name?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">
                  {review.reviewer_profile?.display_name || 'Anonymous'}
                </span>
                {review.verified_purchase && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Purchase
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <StarRating rating={review.overall_rating} />
                <span>{formatDate(review.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            {review.would_recommend && (
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Recommends
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {review.review_title && (
          <h4 className="font-semibold">{review.review_title}</h4>
        )}
        
        {/* Detailed Ratings */}
        {(review.product_rating || review.communication_rating || review.shipping_rating) && (
          <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
            {review.product_rating && (
              <div className="text-center">
                <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-xs text-muted-foreground mb-1">Product</div>
                <StarRating rating={review.product_rating} size="sm" />
              </div>
            )}
            {review.communication_rating && (
              <div className="text-center">
                <MessageSquare className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-xs text-muted-foreground mb-1">Communication</div>
                <StarRating rating={review.communication_rating} size="sm" />
              </div>
            )}
            {review.shipping_rating && (
              <div className="text-center">
                <Truck className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-xs text-muted-foreground mb-1">Shipping</div>
                <StarRating rating={review.shipping_rating} size="sm" />
              </div>
            )}
          </div>
        )}
        
        {review.comment && (
          <p className="text-sm leading-relaxed">{review.comment}</p>
        )}
        
        {review.order?.products && (
          <div className="text-xs text-muted-foreground">
            Product: {review.order.products.title}
          </div>
        )}
        
        <Separator />
        
        {/* Helpfulness Voting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Was this helpful?
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onHelpfulVote(review.id, true)}
                className="h-8 px-2"
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Yes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onHelpfulVote(review.id, false)}
                className="h-8 px-2"
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                No
              </Button>
            </div>
          </div>
          {review.helpful_votes > 0 && (
            <span className="text-sm text-muted-foreground">
              {review.helpful_votes} people found this helpful
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export function ReviewSystem({ vendorId, productId, showSummary = true, maxReviews = 10 }: ReviewSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [vendorRating, setVendorRating] = useState<VendorRating | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendorId || productId) {
      loadReviewsAndRatings();
    }
  }, [vendorId, productId]);

  const loadReviewsAndRatings = async () => {
    try {
      setLoading(true);
      
      // Load reviews
      let reviewQuery = supabase
        .from('reviews')
        .select(`
          *,
          reviewer_profile:profiles!reviews_reviewer_id_fkey(display_name),
          order:orders(products(title))
        `)
        .eq('review_status', 'published')
        .order('created_at', { ascending: false })
        .limit(maxReviews);

      if (vendorId) {
        reviewQuery = reviewQuery.eq('vendor_id', vendorId);
      }

      if (productId) {
        reviewQuery = reviewQuery.eq('order.product_id', productId);
      }

      const { data: reviewsData, error: reviewsError } = await reviewQuery;
      
      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);

      // Load vendor ratings if vendor ID is provided
      if (vendorId) {
        const { data: ratingData, error: ratingError } = await supabase
          .from('vendor_ratings')
          .select('*')
          .eq('vendor_id', vendorId)
          .single();
        
        if (ratingError && ratingError.code !== 'PGRST116') {
          throw ratingError;
        }
        
        setVendorRating(ratingData);
      }
      
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string, isHelpful: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote on review helpfulness",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('review_helpfulness')
        .upsert({
          review_id: reviewId,
          user_id: user.id,
          is_helpful: isHelpful
        });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your feedback has been recorded",
      });

      // Reload reviews to update helpful vote counts
      loadReviewsAndRatings();
      
    } catch (error) {
      console.error('Error voting on review:', error);
      toast({
        title: "Error",
        description: "Failed to record your vote",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {showSummary && vendorRating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Vendor Rating Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {vendorRating.average_overall_rating.toFixed(1)}
                  </div>
                  <StarRating rating={Math.round(vendorRating.average_overall_rating)} size="lg" />
                  <div className="text-sm text-muted-foreground mt-2">
                    Based on {vendorRating.total_reviews} reviews
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">
                      {vendorRating.average_product_rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Product Quality</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      {vendorRating.average_communication_rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Communication</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      {vendorRating.average_shipping_rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Shipping Speed</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">
                    {vendorRating.recommendation_percentage.toFixed(0)}% of buyers recommend this vendor
                  </div>
                  <Progress value={vendorRating.recommendation_percentage} className="h-2" />
                </div>
              </div>
              
              {/* Rating Breakdown */}
              <div>
                <h4 className="font-medium mb-3">Rating Breakdown</h4>
                <RatingBreakdown vendorRating={vendorRating} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Customer Reviews ({reviews.length})
        </h3>
        
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to leave a review!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onHelpfulVote={handleHelpfulVote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}