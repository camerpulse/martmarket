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
    // Initialize Supabase with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get request body first
    const { 
      action, 
      message, 
      recipient_id, 
      encrypted_message, 
      order_id,
      private_key,
      passphrase,
      name,
      email,
      message_to_sign,
      private_key_armored,
      signed_message,
      public_key_armored
    } = await req.json();

    console.log(`PGP Encryption: ${action}`);

    // For key generation, signing, and validation - no auth required (public tools)
    if (action === 'generate_keypair' || action === 'sign_message' || action === 'verify_signature' || action === 'validate_public_key' || action === 'decrypt_message') {
      // These operations don't require authentication
    } else {
      // For other operations, require authentication
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Authorization header required');
      }

      const supabaseUser = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
      if (userError || !user) {
        throw new Error('User authentication required');
      }
    }

    // Get authenticated user only when needed
    let user = null;
    if (action !== 'generate_keypair' && action !== 'sign_message' && action !== 'verify_signature' && action !== 'validate_public_key' && action !== 'decrypt_message') {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const supabaseUser = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user: authUser }, error: userError } = await supabaseUser.auth.getUser();
        if (!userError && authUser) {
          user = authUser;
        }
      }
    }

    if (action === 'encrypt_message') {
      if (!message || !recipient_id) {
        throw new Error('Message and recipient ID required');
      }

      // Get recipient's PGP public key
      const { data: recipientMFA, error: recipientError } = await supabaseAdmin
        .from('mfa_settings')
        .select('pgp_public_key, is_pgp_enabled')
        .eq('user_id', recipient_id)
        .single();

      if (recipientError || !recipientMFA) {
        throw new Error('Recipient not found');
      }

      if (!recipientMFA.is_pgp_enabled || !recipientMFA.pgp_public_key) {
        throw new Error('Recipient does not have PGP encryption enabled');
      }

      // Encrypt message with recipient's public key
      const publicKey = await openpgp.readKey({ armoredKey: recipientMFA.pgp_public_key });
      
      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: message }),
        encryptionKeys: publicKey,
        format: 'armored'
      });

      // Generate message hash for integrity
      const messageHash = await generateMessageHash(message);

      // Store encrypted message
      const { data: pgpMessage, error: storeError } = await supabaseAdmin
        .from('pgp_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipient_id,
          encrypted_content: encrypted,
          message_hash: messageHash,
          order_id: order_id || null
        })
        .select()
        .single();

      if (storeError) throw storeError;

      // Skip security event logging for now (security_events table may not exist)
      console.log('PGP message sent successfully:', pgpMessage.id);

      return new Response(
        JSON.stringify({
          success: true,
          message_id: pgpMessage.id,
          encrypted: true,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'decrypt_message') {
      if (!encrypted_message || !private_key) {
        throw new Error('Encrypted message and private key required');
      }

      // Decrypt message with user's private key
      const privateKeyObj = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: private_key }),
        passphrase: passphrase || ''
      });

      const message = await openpgp.decrypt({
        message: await openpgp.readMessage({ armoredMessage: encrypted_message }),
        decryptionKeys: privateKeyObj,
        format: 'utf8'
      });

      // Skip security event logging for now
      console.log('PGP message decrypted successfully');

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

    } else if (action === 'get_messages') {
      // Get user's encrypted messages
      const { data: messages, error: messagesError } = await supabaseAdmin
        .from('pgp_messages')
        .select(`
          *,
          sender:profiles!pgp_messages_sender_id_fkey(display_name),
          recipient:profiles!pgp_messages_recipient_id_fkey(display_name)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (messagesError) throw messagesError;

      return new Response(
        JSON.stringify({
          success: true,
          messages: messages || [],
          count: messages?.length || 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'generate_keypair') {
      if (!name || !email) {
        throw new Error('Name and email required for key generation');
      }

      // Generate new PGP key pair
      const keyOptions = {
        type: 'rsa' as const,
        rsaBits: 2048,
        userIDs: [{ name: name, email: email }],
        format: 'armored' as const
      };

      // Add passphrase if provided
      if (passphrase) {
        keyOptions.passphrase = passphrase;
      }

      const { privateKey, publicKey } = await openpgp.generateKey(keyOptions);

      // Skip security event logging for now
      console.log('PGP keypair generated successfully');

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

    } else if (action === 'verify_signature') {
      
      if (!signed_message || !public_key_armored) {
        throw new Error('Signed message and public key required');
      }

      // Verify signature
      const publicKey = await openpgp.readKey({ armoredKey: public_key_armored });
      const message = await openpgp.readCleartextMessage({ cleartextMessage: signed_message });
      
      const verificationResult = await openpgp.verify({
        message: message,
        verificationKeys: publicKey
      });

      const isValid = verificationResult.signatures.length > 0 && 
                     await verificationResult.signatures[0].verified;

      // Skip security event logging for now
      console.log('PGP signature verified:', isValid);

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

    } else if (action === 'sign_message') {
      
      if (!message_to_sign || !private_key_armored) {
        throw new Error('Message and private key required for signing');
      }

      // Sign message
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

      // Skip security event logging for now
      console.log('PGP message signed successfully');

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

    } else if (action === 'validate_public_key') {
      
      if (!public_key_armored) {
        throw new Error('Public key required for validation');
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
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('PGP Encryption Error:', error);
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

async function generateMessageHash(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}