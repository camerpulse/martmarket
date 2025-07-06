import { Star, Bitcoin, Eye } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import TrustIndicator from "./TrustIndicator";

interface Product {
  id: string;
  title: string;
  price: number;
  vendor: string;
  vendorTrust: number;
  category: string;
  image: string;
  isVerified: boolean;
  views: number;
}

const ProductGrid = () => {
  const products: Product[] = [
    {
      id: "1",
      title: "Premium VPN Access - 1 Year",
      price: 0.003,
      vendor: "PrivacyPro",
      vendorTrust: 92,
      category: "Digital Services",
      image: "",
      isVerified: true,
      views: 156
    },
    {
      id: "2", 
      title: "Encrypted USB Drive 128GB",
      price: 0.012,
      vendor: "CryptoKing",
      vendorTrust: 97,
      category: "Hardware",
      image: "",
      isVerified: true,
      views: 89
    },
    {
      id: "3",
      title: "Digital Art Collection",
      price: 0.025,
      vendor: "AnonymousArts",
      vendorTrust: 88,
      category: "Digital Goods",
      image: "",
      isVerified: true,
      views: 234
    },
    {
      id: "4",
      title: "Privacy Guide & Tools",
      price: 0.008,
      vendor: "TechTrader",
      vendorTrust: 85,
      category: "Educational",
      image: "",
      isVerified: false,
      views: 67
    },
    {
      id: "5",
      title: "Secure Messaging App License",
      price: 0.015,
      vendor: "SatoshiSupply",
      vendorTrust: 94,
      category: "Software",
      image: "",
      isVerified: true,
      views: 123
    },
    {
      id: "6",
      title: "Cryptocurrency Trading Course",
      price: 0.05,
      vendor: "BitcoinBazaar",
      vendorTrust: 91,
      category: "Educational",
      image: "",
      isVerified: true,
      views: 312
    }
  ];

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group card-gradient shadow-card hover:shadow-primary/20 transition-all duration-300 hover:scale-105 cursor-pointer">
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
                      {product.category}
                    </Badge>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <Bitcoin className="h-5 w-5 text-primary" />
                    <span className="text-xl font-bold text-primary">{product.price}</span>
                    <span className="text-sm text-muted-foreground">BTC</span>
                  </div>
                  
                  {/* Vendor Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">by</span>
                      <span className="font-medium">{product.vendor}</span>
                    </div>
                    <TrustIndicator score={product.vendorTrust} isVerified={product.isVerified} size="sm" />
                  </div>
                  
                  {/* Views */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">{product.views} views</span>
                    </div>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Browse All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;