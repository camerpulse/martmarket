import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Bitcoin address generation using xPub (simplified version)
// In production, you'd use a proper Bitcoin library like bitcoinjs-lib
function deriveAddressFromXPub(xpub: string, path: string, index: number): string {
  // PLACEHOLDER: In production, implement proper xPub derivation
  // This would use HDKey.fromExtendedKey(xpub).derive(path).derive(index).getAddress()
  
  // For demo purposes, generate a mock Bitcoin address format
  const mockHash = `${xpub.slice(-8)}${path.replace(/\D/g, '')}${index}`.slice(0, 16);
  return `bc1q${mockHash.toLowerCase()}${Math.random().toString(36).substring(2, 10)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase with service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const { data: userData } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (!userData.user) throw new Error("User not authenticated");

    const { purpose, amount_usd } = await req.json();
    
    if (!purpose || !["vendor_bond", "user_deposit", "order_payment"].includes(purpose)) {
      throw new Error("Invalid purpose specified");
    }

    console.log(`Generating address for purpose: ${purpose}, user: ${userData.user.id}`);

    // Get system configuration
    const { data: configs } = await supabaseAdmin
      .from("system_config")
      .select("config_key, config_value")
      .in("config_key", [
        "xpub_master",
        `address_index_${purpose}`,
        "btc_usd_rate",
        "vendor_bond_amount_satoshis"
      ]);

    const configMap = configs?.reduce((acc: any, item: any) => {
      acc[item.config_key] = item.config_value;
      return acc;
    }, {}) || {};

    const xpub = configMap.xpub_master;
    if (!xpub || xpub === "PLACEHOLDER_XPUB_KEY") {
      throw new Error("xPub not configured. Please set up your Electrum wallet xPub key.");
    }

    // Determine address path and calculate amount
    let addressPath: string;
    let amountSatoshis: number;
    
    switch (purpose) {
      case "vendor_bond":
        addressPath = "m/1";
        amountSatoshis = parseInt(configMap.vendor_bond_amount_satoshis) || 25000000; // ~$250
        break;
      case "user_deposit":
        addressPath = "m/0";
        amountSatoshis = amount_usd ? Math.floor(amount_usd * 100 / (parseInt(configMap.btc_usd_rate) || 100000)) : 0;
        break;
      case "order_payment":
        addressPath = "m/2";
        amountSatoshis = amount_usd ? Math.floor(amount_usd * 100 / (parseInt(configMap.btc_usd_rate) || 100000)) : 0;
        break;
      default:
        throw new Error("Invalid purpose");
    }

    // Get current index and increment
    const currentIndex = parseInt(configMap[`address_index_${purpose}`]) || 0;
    const newIndex = currentIndex + 1;

    // Generate Bitcoin address
    const bitcoinAddress = deriveAddressFromXPub(xpub, addressPath, currentIndex);
    const fullPath = `${addressPath}/${currentIndex}`;

    console.log(`Generated address: ${bitcoinAddress} at path: ${fullPath}`);

    // Store address in database
    const { data: addressData, error: addressError } = await supabaseAdmin
      .from("bitcoin_addresses")
      .insert({
        address: bitcoinAddress,
        address_index: currentIndex,
        address_path: fullPath,
        purpose: purpose,
        user_id: userData.user.id,
        balance_satoshis: 0
      })
      .select()
      .single();

    if (addressError) throw addressError;

    // Update index counter
    await supabaseAdmin
      .from("system_config")
      .update({ config_value: newIndex.toString() })
      .eq("config_key", `address_index_${purpose}`);

    // Create payment request if this is for a specific payment
    let paymentRequest = null;
    if (purpose === "vendor_bond" || amountSatoshis > 0) {
      const { data: paymentData, error: paymentError } = await supabaseAdmin
        .from("payment_requests")
        .insert({
          user_id: userData.user.id,
          payment_type: purpose,
          amount_satoshis: amountSatoshis,
          amount_usd: amount_usd || (amountSatoshis * (parseInt(configMap.btc_usd_rate) || 100000) / 100),
          bitcoin_address_id: addressData.id,
          status: "pending",
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })
        .select()
        .single();

      if (paymentError) throw paymentError;
      paymentRequest = paymentData;

      console.log(`Created payment request: ${paymentRequest.id} for ${amountSatoshis} satoshis`);
    }

    // Return the generated address and payment details
    return new Response(
      JSON.stringify({
        success: true,
        address: bitcoinAddress,
        amount_satoshis: amountSatoshis,
        amount_btc: (amountSatoshis / 100000000).toFixed(8),
        amount_usd: amount_usd || (amountSatoshis * (parseInt(configMap.btc_usd_rate) || 100000) / 100),
        expires_at: paymentRequest?.expires_at,
        payment_request_id: paymentRequest?.id,
        purpose: purpose
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error generating Bitcoin address:", error);
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