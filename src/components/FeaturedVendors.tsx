import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import VendorCard from "./VendorCard";

const FeaturedVendors = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const vendorsPerSlide = 4;

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data: vendorData, error } = await supabase
        .from('vendor_profiles')
        .select('vendor_id, store_name, trust_score, is_verified, total_sales, response_time_hours, description')
        .eq('is_verified', true)
        .order('trust_score', { ascending: false })
        .limit(12);

      if (error) throw error;

      // Transform data to match the expected format
      const transformedVendors = vendorData?.map(vendor => ({
        name: vendor.store_name,
        trustScore: vendor.trust_score,
        isVerified: vendor.is_verified,
        totalTrades: vendor.total_sales,
        responseTime: `${vendor.response_time_hours}h`,
        specialties: vendor.description ? [vendor.description] : ["General"],
        image: "",
        isOnline: Math.random() > 0.3, // Random online status for demo
        vendorId: vendor.vendor_id
      })) || [];

      // Add some mock vendors if we don't have enough real ones
      const mockVendors = [
        {
          name: "CryptoKing",
          trustScore: 97,
          isVerified: true,
          totalTrades: 1247,
          responseTime: "< 1h",
          specialties: ["Electronics", "Hardware", "Components"],
          image: "",
          isOnline: true,
          vendorId: "cryptoking"
        },
        {
          name: "SatoshiSupply",
          trustScore: 94,
          isVerified: true,
          totalTrades: 892,
          responseTime: "2h",
          specialties: ["Digital Goods", "Software", "Licenses"],
          image: "",
          isOnline: true,
          vendorId: "satoshisupply"
        },
        {
          name: "BitcoinBazaar",
          trustScore: 91,
          isVerified: true,
          totalTrades: 653,
          responseTime: "1h",
          specialties: ["Books", "Media", "Collectibles"],
          image: "",
          isOnline: false,
          vendorId: "bitcoinbazaar"
        },
        {
          name: "AnonymousArts",
          trustScore: 88,
          isVerified: true,
          totalTrades: 421,
          responseTime: "3h",
          specialties: ["Art", "NFTs", "Custom Work"],
          image: "",
          isOnline: true,
          vendorId: "anonymousarts"
        },
        {
          name: "TechTrader",
          trustScore: 85,
          isVerified: false,
          totalTrades: 234,
          responseTime: "4h",
          specialties: ["Tech", "Gadgets", "Accessories"],
          image: "",
          isOnline: true,
          vendorId: "techtrader"
        },
        {
          name: "PrivacyPro",
          trustScore: 92,
          isVerified: true,
          totalTrades: 567,
          responseTime: "1h",
          specialties: ["Security", "Privacy", "VPN"],
          image: "",
          isOnline: true,
          vendorId: "privacypro"
        },
        {
          name: "SecureStore",
          trustScore: 89,
          isVerified: true,
          totalTrades: 345,
          responseTime: "2h",
          specialties: ["Security", "Encryption", "Tools"],
          image: "",
          isOnline: true,
          vendorId: "securestore"
        },
        {
          name: "BitMerchant",
          trustScore: 87,
          isVerified: true,
          totalTrades: 567,
          responseTime: "1h",
          specialties: ["General", "Various", "Popular"],
          image: "",
          isOnline: false,
          vendorId: "bitmerchant"
        }
      ];

      // Combine real vendors with mock vendors
      const allVendors = [...transformedVendors, ...mockVendors];
      setVendors(allVendors.slice(0, 12)); // Limit to 12 vendors max
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Fall back to mock data if database fetch fails
      setVendors([
        {
          name: "CryptoKing",
          trustScore: 97,
          isVerified: true,
          totalTrades: 1247,
          responseTime: "< 1h",
          specialties: ["Electronics", "Hardware", "Components"],
          image: "",
          isOnline: true,
          vendorId: "cryptoking"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const totalSlides = Math.ceil(vendors.length / vendorsPerSlide);

  // Auto-slide functionality
  useEffect(() => {
    if (vendors.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [totalSlides, vendors.length]);

  const currentVendors = vendors.slice(
    currentIndex * vendorsPerSlide,
    (currentIndex + 1) * vendorsPerSlide
  );

  if (loading) {
    return (
      <section className="py-16 bg-muted/20">
        <div className="container px-4">
          <div className="text-center">
            <div className="text-lg">Loading featured vendors...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <span className="bitcoin-gradient">Featured Vendors</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our top-rated, verified vendors with proven track records and high trust scores.
            All vendors have posted their $250 annual bond for your protection.
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="grid grid-cols-4 gap-4 md:gap-6">
            {currentVendors.map((vendor, index) => (
              <div 
                key={`${vendor.name}-${currentIndex}`} 
                className="animate-fade-in"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: '0.5s'
                }}
              >
                <VendorCard {...vendor} />
              </div>
            ))}
          </div>
          
          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary scale-110' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <button className="text-primary hover:text-primary/80 font-medium">
            View All Verified Vendors →
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVendors;