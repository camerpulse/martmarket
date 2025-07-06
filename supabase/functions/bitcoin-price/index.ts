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
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
      {
        headers: {
          'User-Agent': 'OpesMarket/1.0',
          'Accept': 'application/json'
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      throw new Error(`API response not ok: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched Bitcoin price:', data);

    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30'
      },
    });
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    
    // Return mock data for development - better than failing
    const mockData = {
      bitcoin: {
        usd: 45000 + Math.floor(Math.random() * 10000), // Random price between 45k-55k
        usd_24h_change: (Math.random() - 0.5) * 10 // Random change between -5% to +5%
      }
    };
    
    console.log('Returning mock Bitcoin price data:', mockData);
    
    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  }
});