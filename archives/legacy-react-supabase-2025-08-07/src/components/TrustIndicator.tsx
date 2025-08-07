import { CheckCircle } from "lucide-react";

interface TrustIndicatorProps {
  score: number;
  isVerified?: boolean;
  size?: "sm" | "md" | "lg";
}

const TrustIndicator = ({ score, isVerified = false, size = "md" }: TrustIndicatorProps) => {
  const getTrustLevel = (score: number) => {
    if (score >= 85) return { level: "high", color: "trust-high" };
    if (score >= 70) return { level: "medium", color: "trust-medium" };
    return { level: "low", color: "trust-low" };
  };

  const trust = getTrustLevel(score);
  
  const sizeClasses = {
    sm: "h-2 w-16",
    md: "h-3 w-24",
    lg: "h-4 w-32"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Trust Score Bar */}
      <div className={`relative bg-muted rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`h-full bg-${trust.color} transition-all duration-500 animate-trust-pulse`}
          style={{ width: `${score}%` }}
        />
      </div>
      
      {/* Score Text */}
      <span className={`font-medium ${textSizeClasses[size]}`}>
        {score}%
      </span>
      
      {/* Verified Badge */}
      {isVerified && (
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 verified-badge" />
          {size !== "sm" && (
            <span className="text-verified text-xs ml-1 font-medium">
              Verified
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TrustIndicator;