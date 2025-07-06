import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Bitcoin, ArrowLeft, ShoppingCart, Star, Shield, Truck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustIndicator from "@/components/TrustIndicator";
import PurchaseDialog from "@/components/PurchaseDialog";
import WishlistButton from "@/components/WishlistButton";

interface ProductVariation {
  id: string;
  variation_name: string;
  variation_value: string;
  price_adjustment_btc: number;
  stock_quantity: number;
  is_available: boolean;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price_btc: number;
  stock_quantity: number;
  is_featured: boolean;
  shipping_info: string;
  tags: string[];
  vendor_id: string;
  vendor: {
    store_name: string;
    trust_score: number;
    is_verified: boolean;
  };
  category: {
    name: string;
  };
  variations: ProductVariation[];
}

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      calculateCurrentPrice();
      calculateCurrentStock();
    }
  }, [product, selectedVariations]);

  const fetchProduct = async () => {
    try {
      // Fetch basic product info
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (productError) throw productError;

      // Fetch vendor info
      const { data: vendorData } = await supabase
        .from('vendor_profiles')
        .select('store_name, trust_score, is_verified')
        .eq('vendor_id', productData.vendor_id)
        .single();

      // Fetch category info
      const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('id', productData.category_id)
        .single();

      // Fetch product variations
      const { data: variationsData } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', productId)
        .eq('is_available', true);

      const productWithDetails: Product = {
        id: productData.id,
        title: productData.title,
        description: productData.description,
        price_btc: productData.price_btc,
        stock_quantity: productData.stock_quantity,
        is_featured: productData.is_featured,
        shipping_info: productData.shipping_info,
        tags: productData.tags || [],
        vendor_id: productData.vendor_id,
        vendor: {
          store_name: vendorData?.store_name || 'Unknown Vendor',
          trust_score: vendorData?.trust_score || 0,
          is_verified: vendorData?.is_verified || false,
        },
        category: {
          name: categoryData?.name || 'Uncategorized',
        },
        variations: variationsData || [],
      };

      setProduct(productWithDetails);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentPrice = () => {
    if (!product) return;
    
    let totalAdjustment = 0;
    Object.entries(selectedVariations).forEach(([variationName, variationValue]) => {
      const variation = product.variations.find(
        v => v.variation_name === variationName && v.variation_value === variationValue
      );
      if (variation) {
        totalAdjustment += variation.price_adjustment_btc;
      }
    });
    
    setCurrentPrice(product.price_btc + totalAdjustment);
  };

  const calculateCurrentStock = () => {
    if (!product) return;
    
    // If no variations selected, use base stock
    if (Object.keys(selectedVariations).length === 0) {
      setCurrentStock(product.stock_quantity);
      return;
    }
    
    // Find minimum stock among selected variations
    let minStock = product.stock_quantity;
    Object.entries(selectedVariations).forEach(([variationName, variationValue]) => {
      const variation = product.variations.find(
        v => v.variation_name === variationName && v.variation_value === variationValue
      );
      if (variation) {
        minStock = Math.min(minStock, variation.stock_quantity);
      }
    });
    
    setCurrentStock(minStock);
  };

  const handleVariationChange = (variationName: string, value: string) => {
    setSelectedVariations(prev => ({
      ...prev,
      [variationName]: value
    }));
  };

  const getVariationGroups = () => {
    if (!product) return {};
    
    const groups: Record<string, string[]> = {};
    product.variations.forEach(variation => {
      if (!groups[variation.variation_name]) {
        groups[variation.variation_name] = [];
      }
      if (!groups[variation.variation_name].includes(variation.variation_value)) {
        groups[variation.variation_name].push(variation.variation_value);
      }
    });
    
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-8">
          <div className="text-center">Loading product...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <Link to="/shop">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const variationGroups = getVariationGroups();

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <div className="text-8xl">📦</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded flex items-center justify-center text-2xl">
                  📦
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">{product.category.name}</Badge>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">by</span>
                  <span className="font-medium">{product.vendor.store_name}</span>
                  <TrustIndicator 
                    score={product.vendor.trust_score} 
                    isVerified={product.vendor.is_verified} 
                    size="sm" 
                  />
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <Bitcoin className="h-6 w-6 text-primary" />
              <span className="text-3xl font-bold text-primary">{currentPrice.toFixed(8)}</span>
              <span className="text-lg text-muted-foreground">BTC</span>
            </div>

            {/* Variations */}
            {Object.keys(variationGroups).length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Options</h3>
                {Object.entries(variationGroups).map(([variationName, values]) => (
                  <div key={variationName}>
                    <label className="text-sm font-medium mb-2 block">{variationName}</label>
                    <Select
                      value={selectedVariations[variationName] || ''}
                      onValueChange={(value) => handleVariationChange(variationName, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${variationName}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {values.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {/* Stock & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Stock: {currentStock} available</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => setPurchaseDialogOpen(true)}
                  disabled={currentStock === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {currentStock === 0 ? 'Out of Stock' : 'Buy Now'}
                </Button>
                <WishlistButton productId={product.id} />
                <Button variant="outline" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="vendor">Vendor Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium mb-2">Shipping Information</h4>
                    <p className="text-muted-foreground">{product.shipping_info}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vendor" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-verified mt-1" />
                  <div>
                    <h4 className="font-medium mb-2">{product.vendor.store_name}</h4>
                    <div className="flex items-center gap-4 mb-2">
                      <TrustIndicator 
                        score={product.vendor.trust_score} 
                        isVerified={product.vendor.is_verified} 
                      />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Verified vendor with high trust score and reliable service.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      <PurchaseDialog
        product={product}
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        selectedVariations={selectedVariations}
        finalPrice={currentPrice}
      />
    </div>
  );
};

export default ProductDetail;