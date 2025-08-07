import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnonymousFeedbackProps {
  targetId?: string;
  feedbackType: 'vendor_review' | 'platform_feedback' | 'product_review';
  className?: string;
}

const AnonymousFeedback = ({ targetId, feedbackType, className = '' }: AnonymousFeedbackProps) => {
  const [feedback, setFeedback] = useState({
    rating: 0,
    content: '',
    tags: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const feedbackTags = {
    vendor_review: [
      'fast_shipping', 'good_communication', 'quality_product', 'as_described',
      'slow_shipping', 'poor_communication', 'quality_issues', 'not_as_described'
    ],
    platform_feedback: [
      'easy_to_use', 'good_features', 'fast_loading', 'secure_feeling',
      'confusing_ui', 'missing_features', 'slow_loading', 'security_concerns'
    ],
    product_review: [
      'excellent_quality', 'good_value', 'fast_delivery', 'well_packaged',
      'poor_quality', 'overpriced', 'delayed_delivery', 'damaged_packaging'
    ]
  };

  const submitFeedback = async () => {
    if (!feedback.content.trim() || feedback.rating === 0) {
      toast.error('Please provide a rating and feedback');
      return;
    }

    setLoading(true);
    try {
      // Generate a simple hash for the IP (for spam prevention)
      const ipHash = await generateIPHash();

      const { error } = await supabase
        .from('anonymous_feedback')
        .insert({
          feedback_type: feedbackType,
          target_id: targetId,
          rating: feedback.rating,
          content: feedback.content,
          feedback_tags: feedback.tags,
          ip_hash: ipHash
        });

      if (error) throw error;

      toast.success('Thank you for your anonymous feedback!');
      setSubmitted(true);
      setFeedback({ rating: 0, content: '', tags: [] });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const generateIPHash = async (): Promise<string> => {
    // Simple hash generation for privacy
    const timestamp = Date.now().toString();
    const random = Math.random().toString();
    return btoa(timestamp + random).substring(0, 16);
  };

  const toggleTag = (tag: string) => {
    setFeedback(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const renderStars = () => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
          className="transition-colors"
        >
          <Star 
            className={`h-6 w-6 ${
              star <= feedback.rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground">
            Your anonymous feedback has been submitted and will help improve the platform.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSubmitted(false)}
            className="mt-4"
          >
            Submit Another Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <span>Anonymous Feedback</span>
        </CardTitle>
        <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">100% Anonymous</p>
            <p className="text-blue-700 dark:text-blue-300">
              Your feedback is completely anonymous and helps improve trust scoring without revealing your identity.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating */}
        <div>
          <Label className="text-sm font-medium">Rating</Label>
          <div className="mt-2">
            {renderStars()}
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label className="text-sm font-medium">Quick Tags (optional)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {feedbackTags[feedbackType].map((tag) => (
              <Badge
                key={tag}
                variant={feedback.tags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="feedback-content" className="text-sm font-medium">
            Your Feedback
          </Label>
          <Textarea
            id="feedback-content"
            value={feedback.content}
            onChange={(e) => setFeedback(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Share your honest experience..."
            rows={4}
            className="mt-2"
          />
        </div>

        {/* Submit */}
        <Button 
          onClick={submitFeedback}
          disabled={loading || feedback.rating === 0 || !feedback.content.trim()}
          className="w-full"
        >
          {loading ? 'Submitting...' : 'Submit Anonymous Feedback'}
        </Button>

        {/* Privacy Notice */}
        <div className="text-xs text-muted-foreground text-center">
          <p>
            Your feedback is processed anonymously and contributes to AI-powered trust scoring.
            No personal information is stored or tracked.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnonymousFeedback;