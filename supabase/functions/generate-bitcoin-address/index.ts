import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { purpose, amount_usd, user_id, order_id } = await req.json();

    // Get current Bitcoin price (mock for now)
    const btcPrice = 45000; // TODO: Replace with real price API
    const amountBtc = amount_usd ? (amount_usd / btcPrice).toFixed(8) : '0.001';
    const amountSatoshis = Math.floor(parseFloat(amountBtc) * 100000000);

    // Generate a deterministic address based on purpose and timestamp
    const addressIndex = Math.floor(Date.now() / 1000) % 10000;
    const mockAddress = `bc1q${Math.random().toString(36).substring(2, 15)}${addressIndex}`;

    // Create Bitcoin address record
    const { data: addressData, error: addressError } = await supabase
      .from('bitcoin_addresses')
      .insert({
        address: mockAddress,
        address_index: addressIndex,
        address_path: `m/84'/0'/0'/0/${addressIndex}`,
        purpose: purpose,
        user_id: user_id,
        order_id: order_id,
        balance_satoshis: 0,
        is_used: false
      })
      .select()
      .single();

    if (addressError) {
      throw new Error(`Failed to create address: ${addressError.message}`);
    }

    // Create payment request
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    const { data: paymentRequest, error: paymentError } = await supabase
      .from('payment_requests')
      .insert({
        user_id: user_id,
        payment_type: purpose,
        amount_satoshis: amountSatoshis,
        amount_usd: amount_usd,
        bitcoin_address_id: addressData.id,
        order_id: order_id,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error(`Failed to create payment request: ${paymentError.message}`);
    }

    console.log('Generated Bitcoin address:', {
      address: mockAddress,
      amount_btc: amountBtc,
      amount_satoshis: amountSatoshis,
      purpose: purpose
    });

    return new Response(
      JSON.stringify({
        success: true,
        address: mockAddress,
        amount_btc: amountBtc,
        amount_satoshis: amountSatoshis,
        amount_usd: amount_usd,
        expires_at: expiresAt.toISOString(),
        payment_request_id: paymentRequest.id,
        btc_price: btcPrice
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Bitcoin address generation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});