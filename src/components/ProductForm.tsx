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
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

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