import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { action, ...params } = await req.json();
    console.log(`Payment Processor: ${action}`);

    if (action === 'check_confirmations') {
      const { payment_request_id } = params;
      
      // Get payment request details
      const { data: paymentRequest, error: prError } = await supabaseAdmin
        .from('payment_requests')
        .select(`
          *,
          bitcoin_addresses!inner(address, id),
          orders(id, buyer_id, vendor_id, total_btc)
        `)
        .eq('id', payment_request_id)
        .single();

      if (prError || !paymentRequest) {
        throw new Error('Payment request not found');
      }

      // Mock Bitcoin API call - In production, integrate with real Bitcoin API
      const bitcoinAddress = paymentRequest.bitcoin_addresses.address;
      const mockTransactionData = await checkBitcoinAddress(bitcoinAddress);

      if (mockTransactionData.transactions.length > 0) {
        const tx = mockTransactionData.transactions[0];
        
        // Check if we already have this confirmation
        const { data: existingConfirmation } = await supabaseAdmin
          .from('payment_confirmations')
          .select('*')
          .eq('payment_request_id', payment_request_id)
          .eq('txid', tx.txid)
          .single();

        if (!existingConfirmation) {
          // Create new payment confirmation
          const { data: confirmation, error: confError } = await supabaseAdmin
            .from('payment_confirmations')
            .insert({
              payment_request_id: payment_request_id,
              txid: tx.txid,
              block_height: tx.block_height,
              confirmations: tx.confirmations,
              confirmed_at: tx.confirmations >= 1 ? new Date().toISOString() : null,
              amount_received_satoshis: tx.amount,
              is_valid: tx.amount >= paymentRequest.amount_satoshis
            })
            .select()
            .single();

          if (confError) throw confError;

          // Get required confirmations for this amount
          const { data: requiredConfs } = await supabaseAdmin
            .rpc('get_required_confirmations', { amount_satoshis: paymentRequest.amount_satoshis });

          // If payment is confirmed, update payment request and create escrow
          if (tx.confirmations >= (requiredConfs || 1) && tx.amount >= paymentRequest.amount_satoshis) {
            // Update payment request status
            await supabaseAdmin
              .from('payment_requests')
              .update({ 
                status: 'completed',
                paid_at: new Date().toISOString()
              })
              .eq('id', payment_request_id);

            // Create escrow transaction if this is for an order
            if (paymentRequest.orders) {
              const order = paymentRequest.orders;
              const escrowAddress = await generateEscrowAddress();
              
              // Calculate fees (2.5% platform fee)
              const totalSatoshis = Math.floor(order.total_btc * 100000000);
              const platformFeeSatoshis = Math.floor(totalSatoshis * 0.025);
              const vendorFeeSatoshis = totalSatoshis - platformFeeSatoshis;

              await supabaseAdmin
                .from('escrow_transactions')
                .insert({
                  order_id: order.id,
                  buyer_id: order.buyer_id,
                  vendor_id: order.vendor_id,
                  escrow_address: escrowAddress,
                  amount_satoshis: totalSatoshis,
                  platform_fee_satoshis: platformFeeSatoshis,
                  vendor_fee_satoshis: vendorFeeSatoshis,
                  status: 'funded',
                  funded_at: new Date().toISOString(),
                  auto_release_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString() // 7 days
                });

              // Update order status
              await supabaseAdmin
                .from('orders')
                .update({ status: 'paid' })
                .eq('id', order.id);
            }

            // Log security event
            await logSecurityEvent(supabaseAdmin, paymentRequest.user_id, 'payment_confirmed', {
              payment_request_id: payment_request_id,
              txid: tx.txid,
              amount_satoshis: tx.amount,
              confirmations: tx.confirmations
            }, req);
          }

          return new Response(
            JSON.stringify({
              success: true,
              confirmation: confirmation,
              required_confirmations: requiredConfs || 1,
              is_confirmed: tx.confirmations >= (requiredConfs || 1)
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'No new confirmations found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'release_escrow') {
      const { escrow_id, release_type = 'manual' } = params;

      // Get authenticated user
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Authorization required');
      }

      const supabaseUser = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
      if (userError || !user) throw new Error('Authentication required');

      // Get escrow details
      const { data: escrow, error: escrowError } = await supabaseAdmin
        .from('escrow_transactions')
        .select('*')
        .eq('id', escrow_id)
        .single();

      if (escrowError || !escrow) {
        throw new Error('Escrow transaction not found');
      }

      // Verify user can release escrow (buyer or auto-release)
      if (release_type === 'manual' && escrow.buyer_id !== user.id) {
        throw new Error('Only buyer can manually release escrow');
      }

      if (escrow.status !== 'funded') {
        throw new Error('Escrow is not in funded status');
      }

      // Mock escrow release transaction
      const releaseTxid = `release_${escrow_id}_${Date.now()}`;

      // Update escrow status
      await supabaseAdmin
        .from('escrow_transactions')
        .update({
          status: 'released',
          released_at: new Date().toISOString(),
          release_txid: releaseTxid
        })
        .eq('id', escrow_id);

      // Update order status
      await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', escrow.order_id);

      // Log security event
      await logSecurityEvent(supabaseAdmin, user.id, 'escrow_released', {
        escrow_id: escrow_id,
        release_type: release_type,
        amount_satoshis: escrow.amount_satoshis
      }, req);

      return new Response(
        JSON.stringify({
          success: true,
          escrow_id: escrow_id,
          release_txid: releaseTxid,
          status: 'released'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'get_network_fees') {
      // Get current network fees
      const { data: fees, error: feesError } = await supabaseAdmin
        .from('bitcoin_network_fees')
        .select('*')
        .order('captured_at', { ascending: false })
        .limit(3);

      if (feesError) throw feesError;

      return new Response(
        JSON.stringify({
          success: true,
          fees: fees || []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'update_network_fees') {
      // Mock network fee update - In production, fetch from real Bitcoin API
      const mockFees = [
        { fee_rate_sat_per_vbyte: Math.floor(Math.random() * 10) + 1, priority_level: 'economy', estimated_confirmation_blocks: 144 },
        { fee_rate_sat_per_vbyte: Math.floor(Math.random() * 15) + 5, priority_level: 'standard', estimated_confirmation_blocks: 6 },
        { fee_rate_sat_per_vbyte: Math.floor(Math.random() * 30) + 20, priority_level: 'priority', estimated_confirmation_blocks: 1 }
      ];

      // Clear old fees
      await supabaseAdmin
        .from('bitcoin_network_fees')
        .delete()
        .lt('captured_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Insert new fees
      await supabaseAdmin
        .from('bitcoin_network_fees')
        .insert(mockFees);

      return new Response(
        JSON.stringify({
          success: true,
          fees: mockFees
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Payment Processor Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper functions
async function checkBitcoinAddress(address: string) {
  // Mock Bitcoin API response - In production, integrate with real Bitcoin API
  return {
    address: address,
    transactions: Math.random() > 0.5 ? [{
      txid: `mock_tx_${Date.now()}`,
      amount: Math.floor(Math.random() * 100000000), // Random satoshi amount
      confirmations: Math.floor(Math.random() * 10),
      block_height: 800000 + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString()
    }] : []
  };
}

async function generateEscrowAddress(): Promise<string> {
  // Mock escrow address generation - In production, use proper Bitcoin multisig
  return `3Mock${Math.random().toString(36).substring(2, 15)}EscrowAddr`;
}

async function logSecurityEvent(supabase: any, userId: string, eventType: string, eventData: any, req: Request) {
  try {
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    
    await supabase
      .from('security_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_level: 'info',
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent'),
        event_data: eventData,
        threat_score: 0.0
      });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}