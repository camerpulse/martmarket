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

    const { action, payment_request_id, order_id, escrow_id, release_type } = await req.json();

    if (action === 'check_confirmations') {
      // Check if payment has been received
      const { data: paymentRequest, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          bitcoin_addresses (
            id,
            address,
            balance_satoshis
          )
        `)
        .eq('id', payment_request_id)
        .single();

      if (error) {
        throw new Error(`Payment request not found: ${error.message}`);
      }

      // Mock payment confirmation for development
      // In production, this would check blockchain APIs
      const isConfirmed = Math.random() > 0.7; // 30% chance of confirmation for demo

      if (isConfirmed && paymentRequest.status === 'pending') {
        // Update payment request status
        await supabase
          .from('payment_requests')
          .update({ 
            status: 'completed',
            paid_at: new Date().toISOString()
          })
          .eq('id', payment_request_id);

        // Create payment confirmation
        const { data: confirmation } = await supabase
          .from('payment_confirmations')
          .insert({
            payment_request_id: payment_request_id,
            txid: `mock_tx_${Date.now()}`,
            amount_received_satoshis: paymentRequest.amount_satoshis,
            confirmations: 1,
            is_valid: true,
            confirmed_at: new Date().toISOString()
          })
          .select()
          .single();

        // Update order status if this is an order payment
        if (paymentRequest.order_id) {
          await supabase
            .from('orders')
            .update({ 
              status: 'paid',
              payment_txid: `mock_tx_${Date.now()}`
            })
            .eq('id', paymentRequest.order_id);

          // Create escrow transaction
          const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', paymentRequest.order_id)
            .single();

          if (order) {
            const autoReleaseAt = new Date();
            autoReleaseAt.setDate(autoReleaseAt.getDate() + 7); // 7 days auto-release

            await supabase
              .from('escrow_transactions')
              .insert({
                order_id: order.id,
                buyer_id: order.buyer_id,
                vendor_id: order.vendor_id,
                amount_satoshis: paymentRequest.amount_satoshis,
                platform_fee_satoshis: Math.floor(paymentRequest.amount_satoshis * 0.05),
                vendor_fee_satoshis: Math.floor(paymentRequest.amount_satoshis * 0.95),
                escrow_address: paymentRequest.bitcoin_addresses.address,
                status: 'funded',
                funded_at: new Date().toISOString(),
                auto_release_at: autoReleaseAt.toISOString()
              });
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            is_confirmed: true,
            confirmation: confirmation,
            message: 'Payment confirmed successfully'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          is_confirmed: false,
          message: 'Payment not yet confirmed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'release_escrow') {
      // Release escrow funds to vendor
      const { data: escrow, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('id', escrow_id)
        .single();

      if (error) {
        throw new Error(`Escrow not found: ${error.message}`);
      }

      if (escrow.status !== 'funded') {
        throw new Error('Escrow must be funded to release');
      }

      // Update escrow status
      await supabase
        .from('escrow_transactions')
        .update({
          status: 'released',
          released_at: new Date().toISOString(),
          release_txid: `release_tx_${Date.now()}`
        })
        .eq('id', escrow_id);

      // Update order status
      await supabase
        .from('orders')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', escrow.order_id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Escrow released successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else {
      throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Payment processor error:', error);
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