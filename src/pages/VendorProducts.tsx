import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVendorStatus } from '@/hooks/useVendorStatus';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductForm from '@/components/ProductForm';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

const VendorProducts = () => {
  const { user } = useAuth();
  const { isVendor, hasActiveBond, loading: vendorLoading } = useVendorStatus();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (user && isVendor) {
      loadProducts();
    }
  }, [user, isVendor]);

  const loadProducts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      ));

      toast({
        title: "Success",
        description: `Product ${product.is_active ? 'deactivated' : 'activated'}`,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  if (vendorLoading || loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!isVendor || !hasActiveBond) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="text-muted-foreground">
              You need to be a verified vendor with an active bond to manage products.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="container mx-auto p-6">
        <ProductForm
          product={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first product to your store.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">
                    {product.title}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {product.is_featured && (
                      <Badge variant="outline">Featured</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {product.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Price (BTC):</span>
                    <span className="font-mono">{product.price_btc}</span>
                  </div>
                  {product.price_usd && (
                    <div className="flex justify-between text-sm">
                      <span>Price (USD):</span>
                      <span>${product.price_usd}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Stock:</span>
                    <span>{product.stock_quantity || 'Unlimited'}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingProduct(product);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleProductStatus(product)}
                  >
                    {product.is_active ? (
                      <EyeOff className="h-4 w-4 mr-1" />
                    ) : (
                      <Eye className="h-4 w-4 mr-1" />
                    )}
                    {product.is_active ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorProducts;