import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Star, 
  Package, 
  MessageSquare, 
  Truck,
  Send
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ReviewFormProps {
  orderId: string;
  vendorId: string;
  productTitle: string;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

interface ReviewData {
  overall_rating: number;
  product_rating: number;
  communication_rating: number;
  shipping_rating: number;
  review_title: string;
  comment: string;
  would_recommend: boolean;
}

const StarRatingInput = ({ 
  rating, 
  onRatingChange, 
  label 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void;
  label: string;
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-muted-foreground hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating > 0 && (
            <>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export function ReviewForm({ 
  orderId, 
  vendorId, 
  productTitle, 
  onReviewSubmitted,
  onCancel 
}: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData>({
    overall_rating: 0,
    product_rating: 0,
    communication_rating: 0,
    shipping_rating: 0,
    review_title: '',
    comment: '',
    would_recommend: true,
  });

  const updateRating = (field: keyof ReviewData, value: number) => {
    setReviewData(prev => ({ ...prev, [field]: value }));
  };

  const updateField = (field: keyof ReviewData, value: string | boolean) => {
    setReviewData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return reviewData.overall_rating > 0 && 
           reviewData.product_rating > 0 && 
           reviewData.communication_rating > 0 && 
           reviewData.shipping_rating > 0 &&
           reviewData.comment.trim().length > 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (!isFormValid()) {
      toast({
        title: "Incomplete Review",
        description: "Please provide all ratings and a detailed comment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          order_id: orderId,
          reviewer_id: user.id,
          vendor_id: vendorId,
          rating: reviewData.overall_rating, // Legacy field for compatibility
          overall_rating: reviewData.overall_rating,
          product_rating: reviewData.product_rating,
          communication_rating: reviewData.communication_rating,
          shipping_rating: reviewData.shipping_rating,
          review_title: reviewData.review_title.trim() || null,
          comment: reviewData.comment.trim(),
          would_recommend: reviewData.would_recommend,
          verified_purchase: true,
          review_status: 'published'
        });

      if (error) throw error;

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback. Your review has been published.",
      });

      onReviewSubmitted?.();
      
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Write a Review
        </CardTitle>
        <CardDescription>
          Share your experience with "{productTitle}"
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <StarRatingInput
            rating={reviewData.overall_rating}
            onRatingChange={(rating) => updateRating('overall_rating', rating)}
            label="Overall Experience"
          />

          {/* Detailed Ratings */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4" />
                Product Quality
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateRating('product_rating', star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= reviewData.product_rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-muted-foreground hover:text-yellow-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                Communication
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateRating('communication_rating', star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= reviewData.communication_rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-muted-foreground hover:text-yellow-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Truck className="h-4 w-4" />
                Shipping Speed
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateRating('shipping_rating', star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= reviewData.shipping_rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-muted-foreground hover:text-yellow-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Review Title (Optional)</Label>
            <Input
              id="review-title"
              placeholder="Summarize your experience..."
              value={reviewData.review_title}
              onChange={(e) => updateField('review_title', e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <Label htmlFor="review-comment">
              Your Review <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="review-comment"
              placeholder="Tell other buyers about your experience with this product and vendor. What did you like? What could be improved?"
              value={reviewData.comment}
              onChange={(e) => updateField('comment', e.target.value)}
              minLength={10}
              maxLength={1000}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {reviewData.comment.length}/1000 characters (minimum 10)
            </div>
          </div>

          {/* Recommendation */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <Label className="text-sm font-medium">
                Would you recommend this vendor to others?
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                This helps other buyers make informed decisions
              </p>
            </div>
            <Switch
              checked={reviewData.would_recommend}
              onCheckedChange={(checked) => updateField('would_recommend', checked)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="flex-1 gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}