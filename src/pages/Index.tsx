import { useState, useEffect } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import FeaturedVendors from "../components/FeaturedVendors";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, SortAsc, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    category: 'all',
    priceRange: 'all',
    sortBy: 'newest'
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

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

  const clearFilters = () => {
    setSearchFilters({
      search: '',
      category: 'all',
      priceRange: 'all',
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = searchFilters.search || 
    searchFilters.category !== 'all' || 
    searchFilters.priceRange !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FeaturedVendors />
      
      {/* Enhanced Product Search Section */}
      <section className="py-16">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bitcoin-gradient">Browse Products</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find exactly what you're looking for with our advanced search and filtering options.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchFilters.search}
                    onChange={(e) => setSearchFilters({ ...searchFilters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Select 
                  value={searchFilters.category} 
                  onValueChange={(value) => setSearchFilters({ ...searchFilters, category: value })}
                >
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="Category" />
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

                {/* Price Range Filter */}
                <Select 
                  value={searchFilters.priceRange} 
                  onValueChange={(value) => setSearchFilters({ ...searchFilters, priceRange: value })}
                >
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-0.01">0 - 0.01 BTC</SelectItem>
                    <SelectItem value="0.01-0.1">0.01 - 0.1 BTC</SelectItem>
                    <SelectItem value="0.1-1">0.1 - 1 BTC</SelectItem>
                    <SelectItem value="1+">1+ BTC</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select 
                  value={searchFilters.sortBy} 
                  onValueChange={(value) => setSearchFilters({ ...searchFilters, sortBy: value })}
                >
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Active Filter Tags */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {searchFilters.search && (
                    <Badge variant="secondary">
                      Search: "{searchFilters.search}"
                    </Badge>
                  )}
                  {searchFilters.category !== 'all' && (
                    <Badge variant="secondary">
                      Category: {categories.find(c => c.id === searchFilters.category)?.name}
                    </Badge>
                  )}
                  {searchFilters.priceRange !== 'all' && (
                    <Badge variant="secondary">
                      Price: {searchFilters.priceRange} BTC
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Product Grid with Filters */}
          <ProductGrid searchFilters={searchFilters} />
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
