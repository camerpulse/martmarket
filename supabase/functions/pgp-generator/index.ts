import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as openpgp from "https://esm.sh/openpgp@5.11.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🔧 PGP Generator function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('📥 Request body:', body);
    
    const { action, name, email, passphrase } = body;

    if (action === 'generate_keypair') {
      console.log('🔑 Generating PGP keypair for:', name, email);
      
      if (!name || !email) {
        throw new Error('Name and email are required');
      }

      const keyPair = await openpgp.generateKey({
        type: 'rsa',
        rsaBits: 2048,
        userIDs: [{ name, email }],
        passphrase: passphrase || undefined,
        format: 'armored'
      });

      console.log('✅ PGP keypair generated successfully');

      return new Response(JSON.stringify({
        success: true,
        public_key: keyPair.publicKey,
        private_key: keyPair.privateKey,
        key_type: 'RSA 2048-bit'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error('❌ PGP Generator Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});