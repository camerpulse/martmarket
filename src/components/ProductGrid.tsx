import { useState, useEffect } from "react";
import { Bitcoin, Eye, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";
import TrustIndicator from "./TrustIndicator";
import PurchaseDialog from "./PurchaseDialog";
import WishlistButton from "./WishlistButton";

interface Product {
  id: string;
  title: string;
  description: string;
  price_btc: number;
  stock_quantity: number;
  is_featured: boolean;
  shipping_info: string;
  vendor_id: string; // Add vendor_id
  vendor: {
    store_name: string;
    trust_score: number;
    is_verified: boolean;
  };
  category: {
    name: string;
  };
}

interface SearchFilters {
  search: string;
  category: string;
  priceRange: string;
  sortBy: string;
}

interface ProductGridProps {
  searchFilters?: SearchFilters;
}

const ProductGrid = ({ searchFilters }: ProductGridProps = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        // Apply search filter
        if (searchFilters?.search) {
          query = query.or(`title.ilike.%${searchFilters.search}%,description.ilike.%${searchFilters.search}%`);
        }

        // Apply category filter
        if (searchFilters?.category && searchFilters.category !== 'all') {
          query = query.eq('category_id', searchFilters.category);
        }

        // Apply price range filter
        if (searchFilters?.priceRange && searchFilters.priceRange !== 'all') {
          const [min, max] = searchFilters.priceRange.includes('+') 
            ? [parseFloat(searchFilters.priceRange.replace('+', '')), null]
            : searchFilters.priceRange.split('-').map(parseFloat);
          
          query = query.gte('price_btc', min);
          if (max !== null) {
            query = query.lte('price_btc', max);
          }
        }

        // Apply sorting
        switch (searchFilters?.sortBy) {
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'price-low':
            query = query.order('price_btc', { ascending: true });
            break;
          case 'price-high':
            query = query.order('price_btc', { ascending: false });
            break;
          case 'popular':
            query = query.order('view_count', { ascending: false });
            break;
          default: // newest
            query = query.order('created_at', { ascending: false });
        }

        const { data: basicData, error: basicError } = await query.limit(12);

        if (basicError) throw basicError;
        
        // Get vendor and category info separately
        const productsWithDetails = await Promise.all(
          basicData?.map(async (product) => {
            const [vendorResult, categoryResult] = await Promise.all([
              supabase.from('vendor_profiles').select('store_name, trust_score, is_verified').eq('vendor_id', product.vendor_id).single(),
              supabase.from('categories').select('name').eq('id', product.category_id).single()
            ]);
            
            return {
              id: product.id,
              title: product.title,
              description: product.description,
              price_btc: product.price_btc,
              stock_quantity: product.stock_quantity,
              is_featured: product.is_featured,
              shipping_info: product.shipping_info,
              vendor_id: product.vendor_id, // Add vendor_id
              vendor: {
                store_name: vendorResult.data?.store_name || 'Unknown Vendor',
                trust_score: vendorResult.data?.trust_score || 0,
                is_verified: vendorResult.data?.is_verified || false,
              },
              category: {
                name: categoryResult.data?.name || 'Uncategorized',
              },
            };
          }) || []
        );
        
        setProducts(productsWithDetails);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchFilters]);

  const handlePurchase = (product: Product) => {
    setSelectedProduct(product);
    setPurchaseDialogOpen(true);
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container px-4">
          <div className="text-center">
            <div className="text-lg text-muted-foreground">Loading products...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <span className="bitcoin-gradient">Trending Products</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the most popular products from verified vendors in our marketplace.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group card-gradient shadow-card hover:shadow-primary/20 transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => window.location.href = `/product/${product.id}`}>
              <CardContent className="p-6">
                {/* Product Image Placeholder */}
                <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-6xl text-muted-foreground">📦</div>
                </div>
                
                {/* Product Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold line-clamp-2 flex-1">{product.title}</h3>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {product.category.name}
                    </Badge>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <Bitcoin className="h-5 w-5 text-primary" />
                    <span className="text-xl font-bold text-primary">{product.price_btc}</span>
                    <span className="text-sm text-muted-foreground">BTC</span>
                  </div>
                  
                  {/* Vendor Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">by</span>
                      <span className="font-medium">{product.vendor.store_name}</span>
                    </div>
                    <TrustIndicator 
                      score={product.vendor.trust_score} 
                      isVerified={product.vendor.is_verified} 
                      size="sm" 
                    />
                  </div>
                  
                  {/* Stock & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <span className="text-sm">Stock: {product.stock_quantity}</span>
                    </div>
                     <div className="flex items-center space-x-2">
                       <div onClick={(e) => e.stopPropagation()}>
                         <WishlistButton productId={product.id} />
                       </div>
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePurchase(product);
                          }}
                          disabled={product.stock_quantity === 0}
                        >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
            <Link to="/shop">Browse All Products</Link>
          </Button>
        </div>
      </div>

      <PurchaseDialog
        product={selectedProduct}
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
      />
    </section>
  );
};

export default ProductGrid;