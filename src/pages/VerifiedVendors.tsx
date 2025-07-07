import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorCard from "@/components/VendorCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface Vendor {
  vendor_id: string;
  store_name: string;
  trust_score: number;
  is_verified: boolean;
  total_sales: number;
  response_time_hours: number;
  description: string;
  last_active: string | null;
  created_at: string;
}

const VerifiedVendors = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("trust_score");

  useEffect(() => {
    fetchVerifiedVendors();
  }, []);

  const fetchVerifiedVendors = async () => {
    try {
      const { data: vendorData, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('is_verified', true)
        .order('trust_score', { ascending: false });

      if (error) throw error;

      const transformedVendors = vendorData?.map(vendor => ({
        name: vendor.store_name,
        trustScore: vendor.trust_score,
        isVerified: vendor.is_verified,
        totalTrades: vendor.total_sales || 0,
        responseTime: `${vendor.response_time_hours || 24}h`,
        specialties: vendor.description ? [vendor.description] : ["General"],
        image: "",
        isOnline: Math.random() > 0.3, // Random online status for demo - will be replaced with real presence tracking
        vendorId: vendor.vendor_id
      })) || [];

      setVendors(transformedVendors);
    } catch (error) {
      console.error('Error fetching verified vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors
    .filter(vendor => 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.specialties.some((spec: string) => spec.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "trust_score") return b.trustScore - a.trustScore;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "online") return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-8">
          <div className="text-center">Loading verified vendors...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bitcoin-gradient">Verified Vendors</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our trusted, verified vendors with proven track records and $250 security bonds.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors or specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trust_score">Trust Score</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="online">Online Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVendors.map((vendor) => (
            <VendorCard key={vendor.vendorId} {...vendor} />
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No verified vendors found matching your search.</p>
          </div>
        )}

        <div className="text-center mt-12 p-6 bg-muted/20 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Want to become a verified vendor?</h3>
          <p className="text-muted-foreground mb-4">
            Join our trusted marketplace by posting a $250 security bond and going through our verification process.
          </p>
          <a href="/vendor/register" className="text-primary hover:text-primary/80 font-medium">
            Start Vendor Registration →
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VerifiedVendors;