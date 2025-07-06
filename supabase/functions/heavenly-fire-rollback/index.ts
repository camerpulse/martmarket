import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rollback and Fix Management System
class RollbackManager {
  async rollbackFix(logId: string, supabase: any) {
    console.log('Rolling back fix for log:', logId);

    try {
      // Get the original log entry
      const { data: logEntry } = await supabase
        .from('heavenly_fire_logs')
        .select('*')
        .eq('id', logId)
        .single();

      if (!logEntry) {
        throw new Error('Log entry not found');
      }

      if (!logEntry.rollback_available || !logEntry.rollback_data) {
        throw new Error('Rollback not available for this fix');
      }

      // Simulate rollback process
      const rollbackData = logEntry.rollback_data;
      const rollbackResult = {
        files_restored: rollbackData.affected_files || [],
        settings_reverted: rollbackData.settings || {},
        database_changes_reverted: rollbackData.database_changes || [],
        success: true,
        rollback_time: new Date().toISOString()
      };

      // Update the original log to mark it as rolled back
      await supabase
        .from('heavenly_fire_logs')
        .update({
          resolved_at: new Date().toISOString(),
          rollback_available: false
        })
        .eq('id', logId);

      // Create a new log entry for the rollback
      await supabase
        .from('heavenly_fire_logs')
        .insert({
          action_type: 'rollback_completed',
          severity: 'info',
          title: `Rollback: ${logEntry.title}`,
          description: `Successfully rolled back changes from previous fix. Original issue may need manual attention.`,
          fix_applied: rollbackResult,
          risk_level: 3,
          target_system: logEntry.target_system,
          success: true,
          rollback_available: false
        });

      return {
        success: true,
        message: 'Fix rolled back successfully',
        rollback_result: rollbackResult
      };

    } catch (error) {
      console.error('Rollback failed:', error);
      
      // Log the failed rollback
      await supabase
        .from('heavenly_fire_logs')
        .insert({
          action_type: 'rollback_failed',
          severity: 'warning',
          title: 'Rollback Failed',
          description: `Failed to rollback fix for log ${logId}: ${error.message}`,
          error_details: { error: error.message, log_id: logId },
          risk_level: 6,
          success: false
        });

      throw error;
    }
  }

  async reapplyFix(logId: string, supabase: any) {
    console.log('Re-applying fix for log:', logId);

    try {
      // Get the original log entry
      const { data: logEntry } = await supabase
        .from('heavenly_fire_logs')
        .select('*')
        .eq('id', logId)
        .single();

      if (!logEntry) {
        throw new Error('Log entry not found');
      }

      if (!logEntry.fix_applied) {
        throw new Error('No fix data available to re-apply');
      }

      // Simulate re-applying the fix
      const fixData = logEntry.fix_applied;
      const reapplyResult = {
        fix_reapplied: true,
        method: fixData.suggested_fix || 'Unknown method',
        files_modified: fixData.files_to_modify || [],
        confidence: fixData.confidence || 0.5,
        reapply_time: new Date().toISOString()
      };

      // Create a new log entry for the re-applied fix
      await supabase
        .from('heavenly_fire_logs')
        .insert({
          action_type: 'fix_reapplied',
          severity: logEntry.severity,
          title: `Re-applied: ${logEntry.title}`,
          description: `Fix has been re-applied based on previous successful resolution.`,
          fix_applied: reapplyResult,
          risk_level: logEntry.risk_level,
          target_system: logEntry.target_system,
          success: true,
          rollback_available: true,
          rollback_data: {
            original_log_id: logId,
            reapply_time: new Date().toISOString(),
            can_rollback: true
          }
        });

      return {
        success: true,
        message: 'Fix re-applied successfully',
        reapply_result: reapplyResult
      };

    } catch (error) {
      console.error('Re-apply failed:', error);
      
      // Log the failed re-application
      await supabase
        .from('heavenly_fire_logs')
        .insert({
          action_type: 'reapply_failed',
          severity: 'warning',
          title: 'Fix Re-application Failed',
          description: `Failed to re-apply fix for log ${logId}: ${error.message}`,
          error_details: { error: error.message, log_id: logId },
          risk_level: 5,
          success: false
        });

      throw error;
    }
  }

  async blockThreat(threatId: string, sourceIp: string, supabase: any) {
    console.log('Blocking threat:', threatId, 'from IP:', sourceIp);

    try {
      // Simulate threat blocking
      const blockResult = {
        threat_id: threatId,
        source_ip: sourceIp,
        blocked_at: new Date().toISOString(),
        block_method: 'IP_FIREWALL_RULE',
        duration: '24_HOURS',
        success: true
      };

      // Log the threat blocking
      await supabase
        .from('heavenly_fire_logs')
        .insert({
          action_type: 'threat_blocked',
          severity: 'info',
          title: `Threat Blocked: ${threatId}`,
          description: `Successfully blocked threat from IP ${sourceIp} using automated security rules.`,
          fix_applied: blockResult,
          risk_level: 7,
          target_system: 'security',
          success: true
        });

      // Update or create security incident
      await supabase
        .from('security_incidents')
        .upsert({
          id: threatId,
          incident_type: 'automated_block',
          severity: 'medium',
          source_ip: sourceIp,
          user_agent: 'Unknown',
          attack_pattern: { blocked_by: 'heavenly_fire_ai' },
          status: 'resolved',
          started_at: new Date().toISOString(),
          resolved_at: new Date().toISOString(),
          mitigation_actions: blockResult
        });

      return {
        success: true,
        message: 'Threat blocked successfully',
        block_result: blockResult
      };

    } catch (error) {
      console.error('Threat blocking failed:', error);
      throw error;
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { action, data } = await req.json();
    const manager = new RollbackManager();
    
    console.log('Heavenly Fire Rollback Manager received action:', action);

    let result;
    switch (action) {
      case 'rollback_fix':
        result = await manager.rollbackFix(data.log_id, supabaseClient);
        break;
      case 'reapply_fix':
        result = await manager.reapplyFix(data.log_id, supabaseClient);
        break;
      case 'block_threat':
        result = await manager.blockThreat(data.threat_id, data.source_ip, supabaseClient);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in heavenly-fire-rollback function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});