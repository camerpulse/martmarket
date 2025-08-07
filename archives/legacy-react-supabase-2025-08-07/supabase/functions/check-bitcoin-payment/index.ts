import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mock function to check Bitcoin address balance
// In production, this would query a Bitcoin node or block explorer API
async function checkAddressBalance(address: string): Promise<{
  balance: number;
  transactions: Array<{
    txid: string;
    amount: number;
    confirmations: number;
    block_height?: number;
  }>;
}> {
  // PLACEHOLDER: In production, implement actual Bitcoin network queries
  // You could use:
  // - Electrum server connection
  // - BlockCypher API
  // - Bitcoin Core RPC
  // - Blockstream API
  
  console.log(`Checking balance for address: ${address}`);
  
  // Mock response - in reality this would be real blockchain data
  return {
    balance: 0, // Balance in satoshis
    transactions: []
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { payment_request_id, address } = await req.json();

    if (!payment_request_id && !address) {
      throw new Error("Either payment_request_id or address must be provided");
    }

    let targetAddress = address;
    let paymentRequest = null;

    // Get payment request details if provided
    if (payment_request_id) {
      const { data: prData, error: prError } = await supabaseAdmin
        .from("payment_requests")
        .select(`
          *,
          bitcoin_addresses (
            address,
            address_path,
            purpose
          )
        `)
        .eq("id", payment_request_id)
        .single();

      if (prError) throw prError;
      paymentRequest = prData;
      targetAddress = prData.bitcoin_addresses.address;
    }

    console.log(`Checking payment status for address: ${targetAddress}`);

    // Check blockchain for transactions
    const addressInfo = await checkAddressBalance(targetAddress);
    
    // Get existing address record
    const { data: addressData, error: addressError } = await supabaseAdmin
      .from("bitcoin_addresses")
      .select("*")
      .eq("address", targetAddress)
      .single();

    if (addressError) throw addressError;

    // Process any new transactions
    const existingTxids = new Set();
    const { data: existingTxs } = await supabaseAdmin
      .from("bitcoin_transactions")
      .select("txid")
      .eq("address_id", addressData.id);

    existingTxs?.forEach(tx => existingTxids.add(tx.txid));

    let totalReceived = 0;
    let newTransactions = 0;

    for (const tx of addressInfo.transactions) {
      if (!existingTxids.has(tx.txid)) {
        // New transaction found
        await supabaseAdmin
          .from("bitcoin_transactions")
          .insert({
            txid: tx.txid,
            address_id: addressData.id,
            amount_satoshis: tx.amount,
            confirmations: tx.confirmations,
            block_height: tx.block_height,
            is_incoming: true,
            detected_at: new Date().toISOString(),
            confirmed_at: tx.confirmations > 0 ? new Date().toISOString() : null,
            processed: false
          });

        newTransactions++;
        console.log(`New transaction detected: ${tx.txid} for ${tx.amount} satoshis`);
      }
      
      totalReceived += tx.amount;
    }

    // Update address balance
    if (addressInfo.balance !== addressData.balance_satoshis) {
      await supabaseAdmin
        .from("bitcoin_addresses")
        .update({ 
          balance_satoshis: addressInfo.balance,
          is_used: addressInfo.balance > 0 
        })
        .eq("id", addressData.id);
    }

    // Check if payment request is fulfilled
    let paymentStatus = "pending";
    if (paymentRequest && addressInfo.balance >= paymentRequest.amount_satoshis) {
      paymentStatus = "completed";
      
      // Update payment request
      await supabaseAdmin
        .from("payment_requests")
        .update({
          status: "completed",
          paid_at: new Date().toISOString()
        })
        .eq("id", payment_request_id);

      // Handle specific payment types
      if (paymentRequest.payment_type === "vendor_bond") {
        // Activate vendor bond
        if (paymentRequest.vendor_bond_id) {
          await supabaseAdmin
            .from("vendor_bonds")
            .update({
              is_active: true,
              paid_at: new Date().toISOString()
            })
            .eq("id", paymentRequest.vendor_bond_id);
        }
        
        console.log(`Vendor bond payment completed for user: ${paymentRequest.user_id}`);
      }
    } else if (paymentRequest && addressInfo.balance > 0 && addressInfo.balance < paymentRequest.amount_satoshis) {
      paymentStatus = "partial";
      
      await supabaseAdmin
        .from("payment_requests")
        .update({ status: "partial" })
        .eq("id", payment_request_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        address: targetAddress,
        balance_satoshis: addressInfo.balance,
        balance_btc: (addressInfo.balance / 100000000).toFixed(8),
        payment_status: paymentStatus,
        required_amount: paymentRequest?.amount_satoshis || 0,
        amount_received: totalReceived,
        new_transactions: newTransactions,
        confirmations_needed: 1, // From system config
        expires_at: paymentRequest?.expires_at
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error checking Bitcoin payment:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});