import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as openpgp from "https://esm.sh/openpgp@5.11.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      action, 
      name, 
      email, 
      passphrase,
      message,
      recipient_id,
      encrypted_message,
      private_key,
      message_to_sign,
      private_key_armored,
      signed_message,
      public_key_armored
    } = await req.json();

    console.log(`PGP Function: ${action}`);

    if (action === 'generate_keypair') {
      if (!name || !email) {
        throw new Error('Name and email are required');
      }

      console.log('Generating PGP key pair...');

      const keyOptions = {
        type: 'rsa' as const,
        rsaBits: 2048,
        userIDs: [{ name: name, email: email }],
        format: 'armored' as const
      };

      if (passphrase) {
        keyOptions.passphrase = passphrase;
      }

      const { privateKey, publicKey } = await openpgp.generateKey(keyOptions);

      console.log('PGP key pair generated successfully');

      return new Response(
        JSON.stringify({
          success: true,
          public_key: publicKey,
          private_key: privateKey,
          key_type: 'RSA 2048-bit',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'validate_public_key') {
      if (!public_key_armored) {
        throw new Error('Public key is required');
      }

      try {
        const publicKey = await openpgp.readKey({ armoredKey: public_key_armored });
        const fingerprint = publicKey.getFingerprint().toUpperCase();
        const keyInfo = publicKey.getUserIDs();
        const keyAlgorithm = publicKey.getAlgorithmInfo();

        return new Response(
          JSON.stringify({
            success: true,
            valid: true,
            fingerprint: fingerprint,
            user_ids: keyInfo,
            algorithm: keyAlgorithm.algorithm,
            key_size: keyAlgorithm.bits,
            created: publicKey.getCreationTime(),
            timestamp: new Date().toISOString()
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: true,
            valid: false,
            error: error.message,
            timestamp: new Date().toISOString()
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

    } else if (action === 'decrypt_message') {
      if (!encrypted_message || !private_key) {
        throw new Error('Encrypted message and private key are required');
      }

      const privateKeyObj = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: private_key }),
        passphrase: passphrase || ''
      });

      const message = await openpgp.decrypt({
        message: await openpgp.readMessage({ armoredMessage: encrypted_message }),
        decryptionKeys: privateKeyObj,
        format: 'utf8'
      });

      return new Response(
        JSON.stringify({
          success: true,
          decrypted_message: message.data,
          verified: message.signatures?.length > 0,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'sign_message') {
      if (!message_to_sign || !private_key_armored) {
        throw new Error('Message and private key are required');
      }

      const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: private_key_armored }),
        passphrase: passphrase || ''
      });

      const cleartextMessage = await openpgp.createCleartextMessage({ text: message_to_sign });
      
      const signed = await openpgp.sign({
        message: cleartextMessage,
        signingKeys: privateKey,
        format: 'armored'
      });

      return new Response(
        JSON.stringify({
          success: true,
          signed_message: signed,
          original_message: message_to_sign,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'verify_signature') {
      if (!signed_message || !public_key_armored) {
        throw new Error('Signed message and public key are required');
      }

      const publicKey = await openpgp.readKey({ armoredKey: public_key_armored });
      const message = await openpgp.readCleartextMessage({ cleartextMessage: signed_message });
      
      const verificationResult = await openpgp.verify({
        message: message,
        verificationKeys: publicKey
      });

      const isValid = verificationResult.signatures.length > 0 && 
                     await verificationResult.signatures[0].verified;

      return new Response(
        JSON.stringify({
          success: true,
          verified: isValid,
          signatures: verificationResult.signatures.length,
          message_data: verificationResult.data,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Invalid action specified');

  } catch (error: any) {
    console.error('PGP Function Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'Unknown error occurred',
        details: error?.stack || error?.toString(),
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});