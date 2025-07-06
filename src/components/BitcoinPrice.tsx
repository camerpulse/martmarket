import { useState, useEffect } from "react";
import { Bitcoin, TrendingUp, TrendingDown } from "lucide-react";

const BitcoinPrice = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          'https://392ca772-36d2-40da-a12e-4c74517dd52f.supabase.co/functions/v1/bitcoin-price',
          {
            headers: {
              'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZGhzcW5kY3Z3YmdsYnRyZ2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjIwMDEsImV4cCI6MjA2NzMzODAwMX0.jqO2_cen3Mbs-eOs_AHq6Yr-hCRSQwFcI9qAmp5hcG8'}`
            }
          }
        );
        const data = await response.json();
        
        if (data.bitcoin) {
          setPrice(data.bitcoin.usd);
          setChange24h(data.bitcoin.usd_24h_change);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch Bitcoin price:', error);
        setLoading(false);
      }
    };

    fetchPrice();
    
    // Update price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <Bitcoin className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!price) {
    return null;
  }

  const isPositive = change24h && change24h > 0;
  const changeColor = isPositive ? 'text-trust-high' : 'text-trust-low';

  return (
    <div className="flex items-center space-x-2 text-sm">
      <Bitcoin className="h-4 w-4 text-primary" />
      <div className="flex items-center space-x-2">
        <span className="font-medium">
          ${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </span>
        {change24h !== null && (
          <div className={`flex items-center space-x-1 ${changeColor}`}>
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className="text-xs">
              {Math.abs(change24h).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BitcoinPrice;