import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface DisputeFormProps {
  orderId: string;
  vendorId: string;
  productTitle: string;
  onDisputeCreated?: () => void;
  onCancel?: () => void;
}

const DISPUTE_CATEGORIES = [
  { value: 'item_not_received', label: 'Item Not Received' },
  { value: 'item_not_as_described', label: 'Item Not As Described' },
  { value: 'damaged_item', label: 'Damaged Item' },
  { value: 'wrong_item', label: 'Wrong Item Received' },
  { value: 'counterfeit_item', label: 'Counterfeit Item' },
  { value: 'shipping_issues', label: 'Shipping Issues' },
  { value: 'communication_issues', label: 'Communication Issues' },
  { value: 'refund_request', label: 'Refund Request' },
  { value: 'other', label: 'Other' }
];

export function DisputeForm({ 
  orderId, 
  vendorId, 
  productTitle,
  onDisputeCreated,
  onCancel 
}: DisputeFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    evidence_urls: [] as string[],
    amount_disputed_btc: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to file a dispute",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category || !formData.title || !formData.description) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('disputes')
        .insert({
          order_id: orderId,
          buyer_id: user.id,
          vendor_id: vendorId,
          category: formData.category as any,
          title: formData.title,
          description: formData.description,
          evidence_urls: formData.evidence_urls.length > 0 ? formData.evidence_urls : null,
          amount_disputed_btc: formData.amount_disputed_btc ? parseFloat(formData.amount_disputed_btc) : null,
          resolution_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          auto_close_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        });

      if (error) throw error;

      toast({
        title: "Dispute Filed",
        description: "Your dispute has been filed successfully. You will receive updates via messages.",
      });

      onDisputeCreated?.();

    } catch (error: any) {
      console.error('Error filing dispute:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to file dispute. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEvidenceUrl = () => {
    setFormData(prev => ({
      ...prev,
      evidence_urls: [...prev.evidence_urls, '']
    }));
  };

  const updateEvidenceUrl = (index: number, url: string) => {
    setFormData(prev => ({
      ...prev,
      evidence_urls: prev.evidence_urls.map((u, i) => i === index ? url : u)
    }));
  };

  const removeEvidenceUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidence_urls: prev.evidence_urls.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          File a Dispute
        </CardTitle>
        <CardDescription>
          Filing a dispute for "{productTitle}". Please provide detailed information to help resolve the issue.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Dispute Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the type of issue" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Dispute Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Brief summary of the issue"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Detailed Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide a detailed description of the issue, including what happened, when it occurred, and what you expected..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={6}
              required
            />
          </div>

          {/* Amount Disputed */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount Disputed (BTC) <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              min="0"
              placeholder="0.00000000"
              value={formData.amount_disputed_btc}
              onChange={(e) => setFormData(prev => ({ ...prev, amount_disputed_btc: e.target.value }))}
            />
          </div>

          {/* Evidence URLs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Evidence <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEvidenceUrl}
                className="h-8"
              >
                <Upload className="h-4 w-4 mr-1" />
                Add Evidence URL
              </Button>
            </div>
            
            {formData.evidence_urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="https://example.com/evidence-image.jpg"
                  value={url}
                  onChange={(e) => updateEvidenceUrl(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEvidenceUrl(index)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <p className="text-xs text-muted-foreground">
              Add URLs to images, documents, or other evidence that supports your dispute.
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Important Notice:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Filing false disputes may result in account suspension</li>
              <li>• You have 7 days to respond to vendor communications</li>
              <li>• Disputes are automatically escalated if no resolution is reached</li>
              <li>• All communication will be recorded for review</li>
            </ul>
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
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Filing Dispute...' : 'File Dispute'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}