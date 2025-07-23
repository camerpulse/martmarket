import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Brain, TrendingUp, Lightbulb, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import ImageUpload from '@/components/products/ImageUpload';

type Product = Tables<'products'>;
type Category = Tables<'categories'>;

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTag, setNewTag] = useState('');
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>([]);
  const [marketOpportunities, setMarketOpportunities] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_btc: '',
    price_usd: '',
    category_id: '',
    stock_quantity: '',
    shipping_info: '',
    tags: [] as string[],
    images: [] as string[],
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    loadCategories();
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price_btc: product.price_btc?.toString() || '',
        price_usd: product.price_usd?.toString() || '',
        category_id: product.category_id || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        shipping_info: product.shipping_info || '',
        tags: product.tags || [],
        images: product.images || [],
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
      });
    }
  }, [product]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        price_btc: parseFloat(formData.price_btc),
        price_usd: formData.price_usd ? parseFloat(formData.price_usd) : null,
        category_id: formData.category_id || null,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
        shipping_info: formData.shipping_info || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        images: formData.images.length > 0 ? formData.images : null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        vendor_id: user.id,
      };

      let error;
      if (product) {
        ({ error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id));
      } else {
        ({ error } = await supabase
          .from('products')
          .insert([productData]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Product ${product ? 'updated' : 'created'} successfully`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Load AI insights and market intelligence
  const loadAIInsights = async () => {
    setLoadingAI(true);
    try {
      // Get trending keywords and market opportunities
      const { data: trends, error: trendsError } = await supabase
        .from('search_intelligence')
        .select('*')
        .gte('opportunity_score', 0.6)
        .eq('trend_direction', 'rising')
        .order('opportunity_score', { ascending: false })
        .limit(10);

      if (trendsError) throw trendsError;

      // Get market opportunities from AI knowledge base
      const { data: opportunities, error: opportunitiesError } = await supabase
        .from('ai_knowledge_base')
        .select('*')
        .eq('knowledge_type', 'market_insight')
        .gte('confidence_score', 0.7)
        .order('learned_at', { ascending: false })
        .limit(5);

      if (opportunitiesError) throw opportunitiesError;

      setTrendingKeywords(trends?.map(t => t.search_term) || []);
      setMarketOpportunities(opportunities || []);
      setShowAIPanel(true);

      toast({
        title: "AI Insights Loaded",
        description: `Found ${trends?.length || 0} trending keywords and ${opportunities?.length || 0} market opportunities`,
      });
    } catch (error) {
      console.error('Error loading AI insights:', error);
      toast({
        title: "Error",
        description: "Failed to load AI insights",
        variant: "destructive",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  // Apply autonomous AI optimization
  const applyAIOptimization = async () => {
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-autonomous-optimizer', {
        body: {
          action: 'optimize_product',
          product_data: {
            title: formData.title,
            description: formData.description,
            category_id: formData.category_id,
            tags: formData.tags
          }
        }
      });

      if (error) throw error;

      if (data.success && data.optimizations_applied > 0) {
        // Apply AI suggestions to form data
        if (data.seo_optimization) {
          setFormData(prev => ({
            ...prev,
            title: data.seo_optimization.optimized_title || prev.title,
            description: data.seo_optimization.optimized_description || prev.description,
            tags: [...prev.tags, ...(data.seo_optimization.keywords?.slice(0, 3) || [])]
          }));
        }

        setAiInsights(data);
        toast({
          title: "AI Optimization Applied",
          description: `Applied ${data.optimizations_applied} optimizations to your product`,
        });
      }
    } catch (error) {
      console.error('Error applying AI optimization:', error);
      toast({
        title: "Error",
        description: "Failed to apply AI optimization",
        variant: "destructive",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  // Add trending keyword as tag
  const addTrendingTag = (keyword: string) => {
    if (!formData.tags.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, keyword]
      }));
      
      toast({
        title: "Trending Keyword Added",
        description: `Added "${keyword}" to your product tags`,
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {product ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_btc">Price (BTC)</Label>
              <Input
                id="price_btc"
                type="number"
                step="0.00000001"
                value={formData.price_btc}
                onChange={(e) => setFormData(prev => ({ ...prev, price_btc: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_usd">Price (USD) - Optional</Label>
              <Input
                id="price_usd"
                type="number"
                step="0.01"
                value={formData.price_usd}
                onChange={(e) => setFormData(prev => ({ ...prev, price_usd: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock_quantity">Stock Quantity (leave empty for unlimited)</Label>
            <Input
              id="stock_quantity"
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping_info">Shipping Information</Label>
            <Textarea
              id="shipping_info"
              value={formData.shipping_info}
              onChange={(e) => setFormData(prev => ({ ...prev, shipping_info: e.target.value }))}
              rows={3}
              placeholder="Shipping details, delivery times, etc."
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <ImageUpload 
            images={formData.images}
            onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
            maxImages={10}
            maxSizeMB={10}
          />

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
              />
              <Label htmlFor="is_featured">Featured</Label>
            </div>
          </div>

          {/* AI Intelligence Panel */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">AI Intelligence Assistant</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Self-Learning
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadAIInsights}
                    disabled={loadingAI}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {loadingAI ? 'Loading...' : 'Get Market Insights'}
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={applyAIOptimization}
                    disabled={loadingAI || !formData.title || !formData.description}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {loadingAI ? 'Optimizing...' : 'Auto-Optimize'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {showAIPanel && (
              <CardContent className="space-y-4">
                {/* Trending Keywords Section */}
                {trendingKeywords.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <Label className="font-semibold text-sm">Trending Keywords (Click to Add)</Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trendingKeywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => addTrendingTag(keyword)}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Market Opportunities Section */}
                {marketOpportunities.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <Label className="font-semibold text-sm">AI-Discovered Market Opportunities</Label>
                    </div>
                    <div className="space-y-3">
                      {marketOpportunities.slice(0, 3).map((opportunity, index) => (
                        <div key={index} className="p-3 bg-background/50 rounded-md border border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{opportunity.topic}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(opportunity.confidence_score * 100)}% Confidence
                            </Badge>
                          </div>
                          {opportunity.content?.product_suggestion && (
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p><strong>Suggestion:</strong> {opportunity.content.product_suggestion.title}</p>
                              <p className="line-clamp-2">{opportunity.content.product_suggestion.description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Insights Display */}
                {aiInsights && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-blue-500" />
                      <Label className="font-semibold text-sm">Applied AI Optimizations</Label>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          {aiInsights.optimizations_applied} optimizations applied
                        </span>
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          Intelligence Level: {Math.round(aiInsights.autonomous_intelligence_level || 0)}%
                        </Badge>
                      </div>
                      {aiInsights.performance_improvements?.length > 0 && (
                        <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                          <strong>Improvements:</strong> {aiInsights.performance_improvements.map(imp => imp.type).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Learning Status */}
                <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-3 w-3" />
                    <span>OpesMarket AI is continuously learning from market trends and user behavior to provide better recommendations.</span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;