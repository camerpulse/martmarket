import { useState, useEffect } from "react";
import VendorCard from "./VendorCard";

const FeaturedVendors = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const vendorsPerSlide = 4;
  
  const vendors = [
    {
      name: "CryptoKing",
      trustScore: 97,
      isVerified: true,
      totalTrades: 1247,
      responseTime: "< 1h",
      specialties: ["Electronics", "Hardware", "Components"],
      image: "",
      isOnline: true
    },
    {
      name: "SatoshiSupply",
      trustScore: 94,
      isVerified: true,
      totalTrades: 892,
      responseTime: "2h",
      specialties: ["Digital Goods", "Software", "Licenses"],
      image: "",
      isOnline: true
    },
    {
      name: "BitcoinBazaar",
      trustScore: 91,
      isVerified: true,
      totalTrades: 653,
      responseTime: "1h",
      specialties: ["Books", "Media", "Collectibles"],
      image: "",
      isOnline: false
    },
    {
      name: "AnonymousArts",
      trustScore: 88,
      isVerified: true,
      totalTrades: 421,
      responseTime: "3h",
      specialties: ["Art", "NFTs", "Custom Work"],
      image: "",
      isOnline: true
    },
    {
      name: "TechTrader",
      trustScore: 85,
      isVerified: false,
      totalTrades: 234,
      responseTime: "4h",
      specialties: ["Tech", "Gadgets", "Accessories"],
      image: "",
      isOnline: true
    },
    {
      name: "PrivacyPro",
      trustScore: 92,
      isVerified: true,
      totalTrades: 567,
      responseTime: "1h",
      specialties: ["Security", "Privacy", "VPN"],
      image: "",
      isOnline: true
    },
    {
      name: "SecureStore",
      trustScore: 89,
      isVerified: true,
      totalTrades: 345,
      responseTime: "2h",
      specialties: ["Security", "Encryption", "Tools"],
      image: "",
      isOnline: true
    },
    {
      name: "BitMerchant",
      trustScore: 87,
      isVerified: true,
      totalTrades: 567,
      responseTime: "1h",
      specialties: ["General", "Various", "Popular"],
      image: "",
      isOnline: false
    }
  ];

  const totalSlides = Math.ceil(vendors.length / vendorsPerSlide);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [totalSlides]);

  const currentVendors = vendors.slice(
    currentIndex * vendorsPerSlide,
    (currentIndex + 1) * vendorsPerSlide
  );

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