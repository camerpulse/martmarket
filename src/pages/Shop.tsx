import { useState, useEffect } from "react";
import { Search, Filter, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import ProductGrid from "@/components/ProductGrid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface SearchFilters {
  search: string;
  category: string;
  priceRange: string;
  sortBy: string;
}

const Shop = () => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: '',
    category: 'all',
    priceRange: 'all',
    sortBy: 'newest'
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [topVendors, setTopVendors] = useState<any[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1]);

  useEffect(() => {
    fetchCategories();
    fetchTopVendors();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .limit(10);
    if (data) setCategories(data);
  };

  const fetchTopVendors = async () => {
    const { data } = await supabase
      .from('vendor_profiles')
      .select('store_name, trust_score, is_verified')
      .eq('is_verified', true)
      .order('trust_score', { ascending: false })
      .limit(5);
    if (data) setTopVendors(data);
  };

  const handleSearchChange = (value: string) => {
    setSearchFilters(prev => ({ ...prev, search: value }));
  };

  const handleCategoryChange = (value: string) => {
    setSearchFilters(prev => ({ ...prev, category: value }));
  };

  const handleSortChange = (value: string) => {
    setSearchFilters(prev => ({ ...prev, sortBy: value }));
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
    const rangeString = value[1] >= 1 ? `${value[0]}-${value[1]}` : `${value[0]}+`;
    setSearchFilters(prev => ({ ...prev, priceRange: rangeString }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bitcoin-gradient">All Products</span>
          </h1>
          <p className="text-muted-foreground">
            Discover thousands of products from verified vendors in our secure marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Search */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Search Products</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchFilters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Select value={searchFilters.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Price Range */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Price Range (BTC)</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={handlePriceRangeChange}
                      max={1}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{priceRange[0]} BTC</span>
                      <span>{priceRange[1] >= 1 ? '1+ BTC' : `${priceRange[1]} BTC`}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sort Options */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Sort By</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Select value={searchFilters.sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Top Vendors */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Top Vendors
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {topVendors.map((vendor, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <span className="text-sm font-medium">{vendor.store_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">{vendor.trust_score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Products Grid - 5 columns */}
          <div className="lg:col-span-5">
            <ProductGrid searchFilters={searchFilters} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;