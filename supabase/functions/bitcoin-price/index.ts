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
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
      {
        headers: {
          'User-Agent': 'OpesMarket/1.0'
        }
      }
    );

    if (!response.ok) {
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
    
    // Return a fallback response
    return new Response(JSON.stringify({
      bitcoin: {
        usd: 0,
        usd_24h_change: 0
      },
      error: 'Failed to fetch current price'
    }), {
      status: 200, // Return 200 so component can handle gracefully
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  }
});