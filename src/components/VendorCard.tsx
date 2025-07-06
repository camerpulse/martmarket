import { Star, MessageCircle, Package, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import TrustIndicator from "./TrustIndicator";

interface VendorCardProps {
  name: string;
  trustScore: number;
  isVerified: boolean;
  totalTrades: number;
  responseTime: string;
  specialties: string[];
  image: string;
  isOnline: boolean;
}

const VendorCard = ({
  name,
  trustScore,
  isVerified,
  totalTrades,
  responseTime,
  specialties,
  image,
  isOnline
}: VendorCardProps) => {
  return (
    <Card className="card-gradient shadow-card hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4">
          {/* Vendor Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-primary">
              {name.charAt(0)}
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-trust-high rounded-full border-2 border-background animate-trust-pulse" />
            )}
          </div>
          
          {/* Vendor Info */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{name}</h3>
            <TrustIndicator score={trustScore} isVerified={isVerified} size="sm" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalTrades}</div>
            <div className="text-xs text-muted-foreground">Total Trades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{responseTime}</div>
            <div className="text-xs text-muted-foreground">Avg Response</div>
          </div>
        </div>
        
        {/* Specialties */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{specialties.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2">
          <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
            <Package className="h-4 w-4 mr-2" />
            View Store
          </Button>
          <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorCard;