import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as openpgp from "https://esm.sh/openpgp@5.11.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('PGP Tools function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { action, name, email, passphrase } = requestBody;
    
    console.log(`Action: ${action}, Name: ${name}, Email: ${email}`);

    if (action === 'generate_keypair') {
      if (!name || !email) {
        throw new Error('Name and email are required');
      }

      console.log('Starting key generation...');

      const keyPair = await openpgp.generateKey({
        type: 'rsa',
        rsaBits: 2048,
        userIDs: [{ name, email }],
        passphrase: passphrase || undefined,
        format: 'armored'
      });

      console.log('Key generation successful');

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

    if (action === 'validate_public_key') {
      const { public_key_armored } = requestBody;
      
      if (!public_key_armored) {
        throw new Error('Public key is required');
      }

      try {
        const publicKey = await openpgp.readKey({ armoredKey: public_key_armored });
        const fingerprint = publicKey.getFingerprint().toUpperCase();
        const userIDs = publicKey.getUserIDs();
        const algorithmInfo = publicKey.getAlgorithmInfo();

        return new Response(JSON.stringify({
          success: true,
          valid: true,
          fingerprint,
          user_ids: userIDs,
          algorithm: algorithmInfo.algorithm,
          key_size: algorithmInfo.bits,
          created: publicKey.getCreationTime()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: true,
          valid: false,
          error: error.message
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error('PGP Tools Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});