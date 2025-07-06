import VendorCard from "./VendorCard";

const FeaturedVendors = () => {
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
    }
  ];

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.name} {...vendor} />
          ))}
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