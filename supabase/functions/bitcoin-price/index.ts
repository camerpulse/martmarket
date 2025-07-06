import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching Bitcoin price from CoinGecko API...');
    
    // Try multiple API endpoints for better reliability
    const apiEndpoints = [
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
      'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
      'https://api.coindesk.com/v1/bpi/currentprice/USD.json'
    ];
    
    // Try CoinGecko first (most reliable)
    try {
      const response = await fetch(apiEndpoints[0], {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OpesMarket/1.0)',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('CoinGecko API success:', data);
        
        if (data.bitcoin && data.bitcoin.usd) {
          return new Response(JSON.stringify(data), {
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=15' // Cache for 15 seconds for more frequent updates
            },
          });
        }
      }
    } catch (coinGeckoError) {
      console.log('CoinGecko failed, trying Coinbase...', coinGeckoError.message);
    }

    // Try Coinbase as fallback
    try {
      const response = await fetch(apiEndpoints[1], {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OpesMarket/1.0)',
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Coinbase API success:', data);
        
        if (data.data && data.data.rates && data.data.rates.USD) {
          const usdPrice = parseFloat(data.data.rates.USD);
          const formattedData = {
            bitcoin: {
              usd: usdPrice,
              usd_24h_change: 0 // Coinbase doesn't provide 24h change in this endpoint
            }
          };
          
          return new Response(JSON.stringify(formattedData), {
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=15'
            },
          });
        }
      }
    } catch (coinbaseError) {
      console.log('Coinbase failed, trying CoinDesk...', coinbaseError.message);
    }

    // Try CoinDesk as final fallback
    try {
      const response = await fetch(apiEndpoints[2], {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OpesMarket/1.0)',
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('CoinDesk API success:', data);
        
        if (data.bpi && data.bpi.USD && data.bpi.USD.rate_float) {
          const formattedData = {
            bitcoin: {
              usd: data.bpi.USD.rate_float,
              usd_24h_change: 0 // CoinDesk doesn't provide 24h change
            }
          };
          
          return new Response(JSON.stringify(formattedData), {
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=15'
            },
          });
        }
      }
    } catch (coindeskError) {
      console.log('CoinDesk failed:', coindeskError.message);
    }

    throw new Error('All Bitcoin price APIs failed');

  } catch (error) {
    console.error('All Bitcoin APIs failed, using last resort mock data:', error);
    
    // Only use mock data as absolute last resort
    const mockData = {
      bitcoin: {
        usd: 97234, // Realistic current BTC price
        usd_24h_change: 1.23,
        error: 'Using fallback data - APIs unavailable'
      }
    };
    
    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60' // Cache longer when using fallback
      },
    });
  }
});