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

    const { 
      action = 'log_event', 
      user_id, 
      event_type, 
      event_data = {}, 
      ip_address, 
      user_agent 
    } = await req.json();

    console.log(`Security Monitor: ${action} for user ${user_id || 'anonymous'}`);

    if (action === 'log_event') {
      // Extract IP and location data
      const clientIP = ip_address || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
      const locationData = await getLocationData(clientIP);
      
      // Calculate threat score
      let threatScore = 0.0;
      if (user_id) {
        const { data: scoreData } = await supabaseAdmin.rpc('calculate_threat_score', {
          user_id: user_id,
          event_type: event_type,
          event_data: event_data
        });
        threatScore = scoreData || 0.0;
      }

      // Determine event level
      const eventLevel = determineEventLevel(event_type, threatScore, event_data);

      // Check if event should be blocked
      const shouldBlock = await shouldBlockEvent(supabaseAdmin, user_id, event_type, threatScore);

      // Log security event
      const { data: securityEvent, error: logError } = await supabaseAdmin
        .from('security_events')
        .insert({
          user_id: user_id,
          event_type: event_type,
          event_level: eventLevel,
          ip_address: clientIP,
          user_agent: user_agent,
          location_data: locationData,
          event_data: event_data,
          threat_score: threatScore,
          blocked: shouldBlock
        })
        .select()
        .single();

      if (logError) throw logError;

      // Handle high-threat events
      if (threatScore > 7.0 || shouldBlock) {
        await handleHighThreatEvent(supabaseAdmin, user_id, securityEvent);
      }

      // Update user session if needed
      if (user_id && event_type === 'login_success') {
        await updateUserSession(supabaseAdmin, user_id, clientIP, user_agent, locationData);
      }

      return new Response(
        JSON.stringify({
          success: true,
          event_id: securityEvent.id,
          threat_score: threatScore,
          event_level: eventLevel,
          blocked: shouldBlock,
          requires_mfa: threatScore > 5.0,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'get_security_status') {
      // Get user's security status and recent events
      if (!user_id) {
        throw new Error('User ID required for security status');
      }

      const { data: recentEvents, error: eventsError } = await supabaseAdmin
        .from('security_events')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (eventsError) throw eventsError;

      const { data: activeSessions, error: sessionsError } = await supabaseAdmin
        .from('user_sessions')
        .select('*')
        .eq('user_id', user_id)
        .eq('is_active', true);

      if (sessionsError) throw sessionsError;

      const { data: mfaSettings, error: mfaError } = await supabaseAdmin
        .from('mfa_settings')
        .select('*')
        .eq('user_id', user_id)
        .single();

      const { data: securitySettings, error: securityError } = await supabaseAdmin
        .from('security_settings')
        .select('*')
        .eq('user_id', user_id)
        .single();

      // Calculate security score
      const securityScore = calculateSecurityScore(mfaSettings, securitySettings, recentEvents);

      return new Response(
        JSON.stringify({
          success: true,
          security_score: securityScore,
          recent_events: recentEvents,
          active_sessions: activeSessions?.length || 0,
          mfa_enabled: mfaSettings?.is_totp_enabled || false,
          high_risk_activity: recentEvents?.some(e => e.threat_score > 6.0) || false,
          recommendations: generateSecurityRecommendations(mfaSettings, securitySettings, recentEvents)
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'fraud_detection_scan') {
      // Run comprehensive fraud detection
      const fraudResults = await runFraudDetection(supabaseAdmin, user_id);
      
      return new Response(
        JSON.stringify({
          success: true,
          fraud_results: fraudResults,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Security Monitor Error:', error);
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
async function getLocationData(ip: string) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return { country: 'Unknown', city: 'Unknown', risk_level: 'low' };
  }

  try {
    // In production, integrate with a geolocation service
    // For now, return mock data based on IP pattern analysis
    return {
      country: 'Unknown',
      city: 'Unknown',
      risk_level: 'low',
      ip_address: ip
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return { country: 'Unknown', city: 'Unknown', risk_level: 'medium' };
  }
}

function determineEventLevel(eventType: string, threatScore: number, eventData: any): string {
  if (threatScore > 8.0) return 'critical';
  if (threatScore > 5.0) return 'warning';
  
  const criticalEvents = ['unauthorized_access', 'fraud_detected', 'account_takeover'];
  const warningEvents = ['suspicious_login', 'multiple_failed_attempts', 'new_device'];
  
  if (criticalEvents.includes(eventType)) return 'critical';
  if (warningEvents.includes(eventType)) return 'warning';
  
  return 'info';
}

async function shouldBlockEvent(supabase: any, userId: string, eventType: string, threatScore: number): Promise<boolean> {
  // Block if threat score is extremely high
  if (threatScore > 9.0) return true;

  // Check fraud detection rules
  const { data: rules, error } = await supabase
    .from('fraud_detection_rules')
    .select('*')
    .eq('is_active', true)
    .eq('action', 'block');

  if (error || !rules) return false;

  // Apply rules logic (simplified)
  for (const rule of rules) {
    if (rule.rule_type === eventType && threatScore >= rule.threat_score) {
      return true;
    }
  }

  return false;
}

async function handleHighThreatEvent(supabase: any, userId: string, securityEvent: any) {
  console.log(`High threat event detected for user ${userId}:`, securityEvent);

  // Could implement additional actions:
  // - Send security alert email
  // - Trigger additional MFA requirements
  // - Temporarily lock account
  // - Alert security team

  try {
    // Update user's security settings to require MFA
    await supabase
      .from('security_settings')
      .upsert({
        user_id: userId,
        require_mfa_for_login: true,
        require_mfa_for_transactions: true
      });

    console.log(`Enhanced security requirements applied for user ${userId}`);
  } catch (error) {
    console.error('Error handling high threat event:', error);
  }
}

async function updateUserSession(supabase: any, userId: string, ipAddress: string, userAgent: string, locationData: any) {
  try {
    // Create or update user session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        location_data: locationData,
        expires_at: expiresAt.toISOString()
      });

    console.log(`Session created for user ${userId}`);
  } catch (error) {
    console.error('Error updating user session:', error);
  }
}

function calculateSecurityScore(mfaSettings: any, securitySettings: any, recentEvents: any[]): number {
  let score = 50; // Base score

  // MFA bonus
  if (mfaSettings?.is_totp_enabled) score += 20;
  if (mfaSettings?.is_sms_enabled) score += 10;

  // Security settings bonus
  if (securitySettings?.require_mfa_for_login) score += 10;
  if (securitySettings?.require_mfa_for_transactions) score += 5;

  // Recent events penalty
  const recentHighRisk = recentEvents?.filter(e => 
    e.threat_score > 5.0 && 
    new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length || 0;
  
  score -= recentHighRisk * 5;

  return Math.max(0, Math.min(100, score));
}

function generateSecurityRecommendations(mfaSettings: any, securitySettings: any, recentEvents: any[]): string[] {
  const recommendations = [];

  if (!mfaSettings?.is_totp_enabled) {
    recommendations.push('Enable two-factor authentication for enhanced security');
  }

  if (!securitySettings?.require_mfa_for_transactions) {
    recommendations.push('Require MFA for all Bitcoin transactions');
  }

  const recentHighRisk = recentEvents?.some(e => 
    e.threat_score > 6.0 && 
    new Date(e.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  if (recentHighRisk) {
    recommendations.push('Review recent suspicious activity and consider changing your password');
  }

  if (recommendations.length === 0) {
    recommendations.push('Your security setup looks good! Consider regular security reviews.');
  }

  return recommendations;
}

async function runFraudDetection(supabase: any, userId: string): Promise<any> {
  try {
    // Get user's recent activity
    const { data: recentEvents, error: eventsError } = await supabase
      .from('security_events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (eventsError) throw eventsError;

    // Get fraud detection rules
    const { data: rules, error: rulesError } = await supabase
      .from('fraud_detection_rules')
      .select('*')
      .eq('is_active', true);

    if (rulesError) throw rulesError;

    const fraudIndicators = [];
    let riskScore = 0;

    // Apply fraud detection rules
    for (const rule of rules || []) {
      const ruleMatch = evaluateFraudRule(rule, recentEvents || []);
      if (ruleMatch.triggered) {
        fraudIndicators.push({
          rule_name: rule.rule_name,
          severity: rule.threat_score,
          details: ruleMatch.details
        });
        riskScore += rule.threat_score;
      }
    }

    return {
      risk_score: Math.min(riskScore, 10.0),
      fraud_indicators: fraudIndicators,
      recommendation: riskScore > 7.0 ? 'HIGH_RISK' : riskScore > 4.0 ? 'MEDIUM_RISK' : 'LOW_RISK'
    };
  } catch (error) {
    console.error('Fraud detection error:', error);
    return { risk_score: 0, fraud_indicators: [], recommendation: 'ERROR' };
  }
}

function evaluateFraudRule(rule: any, events: any[]): { triggered: boolean, details: string } {
  const conditions = rule.conditions;
  
  switch (rule.rule_type) {
    case 'velocity':
      const rapidEvents = events.filter(e => 
        e.event_type === 'login_attempt' &&
        new Date(e.created_at) > new Date(Date.now() - (conditions.time_window_minutes || 15) * 60 * 1000)
      );
      if (rapidEvents.length >= (conditions.max_attempts || 5)) {
        return { triggered: true, details: `${rapidEvents.length} login attempts in ${conditions.time_window_minutes} minutes` };
      }
      break;
      
    case 'pattern':
      const uniqueIPs = new Set(events.map(e => e.ip_address)).size;
      if (uniqueIPs >= (conditions.different_ips_count || 3)) {
        return { triggered: true, details: `Login from ${uniqueIPs} different IP addresses` };
      }
      break;
      
    default:
      return { triggered: false, details: '' };
  }
  
  return { triggered: false, details: '' };
}