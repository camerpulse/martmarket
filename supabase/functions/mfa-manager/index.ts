import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { generateSecret, authenticator } from "https://esm.sh/@otplib/preset-default@12.0.1";
import { qrcode } from "https://deno.land/x/qrcode@v2.0.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user from request
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

    const { 
      action, 
      totp_code, 
      backup_code, 
      sms_phone 
    } = await req.json();

    console.log(`MFA Manager: ${action} for user ${user.id}`);

    if (action === 'setup_totp') {
      // Generate TOTP secret
      const secret = generateSecret();
      const serviceName = 'OpesMarket';
      const accountName = user.email || user.id;
      
      // Generate QR code for authenticator apps
      const otpUrl = `otpauth://totp/${serviceName}:${accountName}?secret=${secret}&issuer=${serviceName}`;
      const qrCodeDataUrl = await qrcode(otpUrl);

      // Generate backup codes
      const backupCodes = generateBackupCodes();

      // Store MFA settings (not yet enabled)
      const { data: mfaSettings, error: mfaError } = await supabaseAdmin
        .from('mfa_settings')
        .upsert({
          user_id: user.id,
          totp_secret: secret,
          backup_codes: backupCodes,
          is_totp_enabled: false // Will be enabled after verification
        })
        .select()
        .single();

      if (mfaError) throw mfaError;

      return new Response(
        JSON.stringify({
          success: true,
          qr_code: qrCodeDataUrl,
          secret: secret,
          backup_codes: backupCodes,
          setup_complete: false
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'verify_totp_setup') {
      if (!totp_code) {
        throw new Error('TOTP code required for verification');
      }

      // Get user's MFA settings
      const { data: mfaSettings, error: mfaError } = await supabaseAdmin
        .from('mfa_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (mfaError || !mfaSettings) {
        throw new Error('MFA setup not found. Please start setup first.');
      }

      // Verify TOTP code
      const isValid = authenticator.verify({
        token: totp_code,
        secret: mfaSettings.totp_secret
      });

      if (!isValid) {
        throw new Error('Invalid TOTP code. Please try again.');
      }

      // Enable TOTP
      const { error: updateError } = await supabaseAdmin
        .from('mfa_settings')
        .update({
          is_totp_enabled: true,
          last_totp_verify: new Date().toISOString(),
          failed_attempts: 0
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log security event
      await logSecurityEvent(supabaseAdmin, user.id, 'mfa_enabled', {
        method: 'totp',
        setup_completed: true
      }, req);

      return new Response(
        JSON.stringify({
          success: true,
          totp_enabled: true,
          message: 'Two-factor authentication has been successfully enabled'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'verify_totp') {
      if (!totp_code) {
        throw new Error('TOTP code required');
      }

      // Get user's MFA settings
      const { data: mfaSettings, error: mfaError } = await supabaseAdmin
        .from('mfa_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (mfaError || !mfaSettings || !mfaSettings.is_totp_enabled) {
        throw new Error('TOTP not enabled for this user');
      }

      // Check if user is locked out
      if (mfaSettings.locked_until && new Date(mfaSettings.locked_until) > new Date()) {
        throw new Error('Account temporarily locked due to too many failed attempts');
      }

      // Verify TOTP code
      const isValid = authenticator.verify({
        token: totp_code,
        secret: mfaSettings.totp_secret
      });

      if (isValid) {
        // Reset failed attempts and update last verify time
        await supabaseAdmin
          .from('mfa_settings')
          .update({
            failed_attempts: 0,
            last_totp_verify: new Date().toISOString(),
            locked_until: null
          })
          .eq('user_id', user.id);

        await logSecurityEvent(supabaseAdmin, user.id, 'mfa_success', {
          method: 'totp'
        }, req);

        return new Response(
          JSON.stringify({
            success: true,
            verified: true,
            message: 'TOTP verification successful'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } else {
        // Handle failed attempt
        const newFailedAttempts = (mfaSettings.failed_attempts || 0) + 1;
        let lockedUntil = null;

        // Lock account after 5 failed attempts
        if (newFailedAttempts >= 5) {
          lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }

        await supabaseAdmin
          .from('mfa_settings')
          .update({
            failed_attempts: newFailedAttempts,
            locked_until: lockedUntil?.toISOString()
          })
          .eq('user_id', user.id);

        await logSecurityEvent(supabaseAdmin, user.id, 'mfa_failed', {
          method: 'totp',
          failed_attempts: newFailedAttempts,
          locked: !!lockedUntil
        }, req);

        throw new Error('Invalid TOTP code');
      }

    } else if (action === 'verify_backup_code') {
      if (!backup_code) {
        throw new Error('Backup code required');
      }

      const { data: mfaSettings, error: mfaError } = await supabaseAdmin
        .from('mfa_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (mfaError || !mfaSettings) {
        throw new Error('MFA settings not found');
      }

      const backupCodes = mfaSettings.backup_codes || [];
      if (!backupCodes.includes(backup_code)) {
        throw new Error('Invalid backup code');
      }

      // Remove used backup code
      const updatedCodes = backupCodes.filter(code => code !== backup_code);
      await supabaseAdmin
        .from('mfa_settings')
        .update({
          backup_codes: updatedCodes,
          failed_attempts: 0
        })
        .eq('user_id', user.id);

      await logSecurityEvent(supabaseAdmin, user.id, 'mfa_backup_used', {
        codes_remaining: updatedCodes.length
      }, req);

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          codes_remaining: updatedCodes.length,
          message: 'Backup code verification successful'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'get_mfa_status') {
      // Get user's current MFA status
      const { data: mfaSettings, error: mfaError } = await supabaseAdmin
        .from('mfa_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: securitySettings, error: securityError } = await supabaseAdmin
        .from('security_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          totp_enabled: mfaSettings?.is_totp_enabled || false,
          sms_enabled: mfaSettings?.is_sms_enabled || false,
          backup_codes_count: mfaSettings?.backup_codes?.length || 0,
          locked_until: mfaSettings?.locked_until,
          require_mfa_login: securitySettings?.require_mfa_for_login || false,
          require_mfa_transactions: securitySettings?.require_mfa_for_transactions || true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'disable_mfa') {
      // Disable MFA (requires current verification)
      const { error: disableError } = await supabaseAdmin
        .from('mfa_settings')
        .update({
          is_totp_enabled: false,
          is_sms_enabled: false,
          totp_secret: null,
          backup_codes: null,
          failed_attempts: 0,
          locked_until: null
        })
        .eq('user_id', user.id);

      if (disableError) throw disableError;

      await logSecurityEvent(supabaseAdmin, user.id, 'mfa_disabled', {}, req);

      return new Response(
        JSON.stringify({
          success: true,
          mfa_disabled: true,
          message: 'Multi-factor authentication has been disabled'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('MFA Manager Error:', error);
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
function generateBackupCodes(): string[] {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    // Generate 8-digit backup codes
    const code = Math.random().toString().substr(2, 8);
    codes.push(code);
  }
  return codes;
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