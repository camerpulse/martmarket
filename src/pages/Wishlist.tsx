import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, Navigate } from 'react-router-dom';
import { Heart, ArrowLeft, ShoppingCart, Trash2, Bitcoin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TrustIndicator from '@/components/TrustIndicator';

interface WishlistItem {
  id: string;
  added_at: string;
  notes?: string;
  products: {
    id: string;
    title: string;
    description: string;
    price_btc: number;
    stock_quantity: number;
    vendor_id: string;
    is_active: boolean;
  };
  vendor_profiles: {
    store_name: string;
    trust_score: number;
    is_verified: boolean;
  };
  categories: {
    name: string;
  };
}

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;

      // Get product and related info separately
      const itemsWithDetails = await Promise.all(
        data?.map(async (item) => {
          const { data: productData } = await supabase
            .from('products')
            .select('id, title, description, price_btc, stock_quantity, vendor_id, is_active, category_id')
            .eq('id', item.product_id)
            .single();

          if (!productData) return null;

          const [vendorResult, categoryResult] = await Promise.all([
            supabase
              .from('vendor_profiles')
              .select('store_name, trust_score, is_verified')
              .eq('vendor_id', productData.vendor_id)
              .single(),
            supabase
              .from('categories')
              .select('name')
              .eq('id', productData.category_id)
              .single()
          ]);
          
          return {
            ...item,
            products: productData,
            vendor_profiles: {
              store_name: vendorResult.data?.store_name || 'Unknown Vendor',
              trust_score: vendorResult.data?.trust_score || 0,
              is_verified: vendorResult.data?.is_verified || false,
            },
            categories: {
              name: categoryResult.data?.name || 'Uncategorized',
            },
          };
        }) || []
      );
      
      // Filter out null results
      const validItems = itemsWithDetails.filter(item => item !== null);
      
      setWishlistItems(validItems);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;
      
      setWishlistItems(items => items.filter(item => item.id !== wishlistId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading your wishlist...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">My Wishlist</h1>
              <p className="text-muted-foreground">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Browse our marketplace and save items you're interested in for later.
              </p>
              <Button asChild>
                <Link to="/">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Start Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Product Image Placeholder */}
                  <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-6xl text-muted-foreground">📦</div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold line-clamp-2 flex-1">
                        {item.products.title}
                      </h3>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.categories.name}
                      </Badge>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.products.description}
                    </p>
                    
                    {/* Price */}
                    <div className="flex items-center space-x-2">
                      <Bitcoin className="h-5 w-5 text-primary" />
                      <span className="text-xl font-bold text-primary">
                        {item.products.price_btc}
                      </span>
                      <span className="text-sm text-muted-foreground">BTC</span>
                    </div>
                    
                    {/* Vendor Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">by</span>
                        <span className="font-medium">
                          {item.vendor_profiles.store_name}
                        </span>
                      </div>
                      <TrustIndicator 
                        score={item.vendor_profiles.trust_score} 
                        isVerified={item.vendor_profiles.is_verified} 
                        size="sm" 
                      />
                    </div>
                    
                    {/* Stock Status */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {item.products.is_active ? (
                          item.products.stock_quantity > 0 ? (
                            <span className="text-green-600">
                              In Stock ({item.products.stock_quantity})
                            </span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )
                        ) : (
                          <span className="text-gray-500">Inactive</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Added {new Date(item.added_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        disabled={!item.products.is_active || item.products.stock_quantity === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Buy Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;