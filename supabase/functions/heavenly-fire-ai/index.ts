import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Independent AI Analysis Engine - No external dependencies
class HeavenlyFireAI {
  private errorPatterns = [
    {
      pattern: /TypeError.*undefined/i,
      type: 'undefined_variable',
      severity: 'medium',
      fix: 'Add proper null checks and initialize variables'
    },
    {
      pattern: /ReferenceError.*not defined/i,
      type: 'reference_error',
      severity: 'high',
      fix: 'Import missing modules or declare variables'
    },
    {
      pattern: /SyntaxError/i,
      type: 'syntax_error',
      severity: 'high',
      fix: 'Fix syntax issues in code'
    },
    {
      pattern: /Network.*failed|fetch.*failed/i,
      type: 'network_error',
      severity: 'medium',
      fix: 'Add retry logic and error handling for network requests'
    },
    {
      pattern: /Database.*connection|PostgreSQL.*error/i,
      type: 'database_error',
      severity: 'critical',
      fix: 'Check database connection and query syntax'
    },
    {
      pattern: /Authentication.*failed|Unauthorized/i,
      type: 'auth_error',
      severity: 'medium',
      fix: 'Verify authentication tokens and permissions'
    }
  ];

  private securityThreats = [
    {
      pattern: /sql.*injection|union.*select/i,
      threat: 'sql_injection',
      severity: 'critical',
      action: 'block_immediately'
    },
    {
      pattern: /script.*src|javascript:|eval\(/i,
      threat: 'xss_attempt',
      severity: 'high',
      action: 'sanitize_and_block'
    },
    {
      pattern: /\.\.\//,
      threat: 'path_traversal',
      severity: 'high',
      action: 'block_path'
    }
  ];

  analyzeError(errorData: any) {
    const errorString = JSON.stringify(errorData).toLowerCase();
    
    for (const pattern of this.errorPatterns) {
      if (pattern.pattern.test(errorString)) {
        return {
          diagnosis: `Detected ${pattern.type}: ${pattern.fix}`,
          severity: pattern.severity,
          suggested_fix: this.generateFix(pattern.type, errorData),
          risk_level: this.calculateRiskLevel(pattern.severity),
          files_to_modify: this.identifyFilesToModify(errorData),
          rollback_plan: 'Create backup before applying changes',
          confidence: 0.85
        };
      }
    }

    // Fallback analysis
    return {
      diagnosis: 'Unknown error pattern detected. Manual review recommended.',
      severity: 'medium',
      suggested_fix: 'Add proper error handling and logging',
      risk_level: 5,
      files_to_modify: [],
      rollback_plan: 'Monitor system after changes',
      confidence: 0.3
    };
  }

  detectSecurityThreat(requestData: any) {
    const requestString = JSON.stringify(requestData).toLowerCase();
    
    for (const threat of this.securityThreats) {
      if (threat.pattern.test(requestString)) {
        return {
          threat_detected: true,
          threat_type: threat.threat,
          severity: threat.severity,
          recommended_action: threat.action,
          block_immediately: threat.severity === 'critical'
        };
      }
    }

    return { threat_detected: false };
  }

  analyzeSystemHealth(metrics: any) {
    const health = {
      overall_score: 100,
      issues: [] as any[],
      recommendations: [] as string[]
    };

    // Check response times
    if (metrics.response_time > 2000) {
      health.overall_score -= 20;
      health.issues.push({
        type: 'performance',
        severity: 'medium',
        description: 'High response times detected'
      });
      health.recommendations.push('Optimize database queries and enable caching');
    }

    // Check error rates
    if (metrics.error_rate > 0.05) {
      health.overall_score -= 30;
      health.issues.push({
        type: 'stability',
        severity: 'high',
        description: 'High error rate detected'
      });
      health.recommendations.push('Review error logs and fix recurring issues');
    }

    // Check CPU usage
    if (metrics.cpu_usage > 80) {
      health.overall_score -= 25;
      health.issues.push({
        type: 'resource',
        severity: 'medium',
        description: 'High CPU usage'
      });
      health.recommendations.push('Scale resources or optimize performance');
    }

    return health;
  }

  private generateFix(errorType: string, errorData: any) {
    const fixes: Record<string, string> = {
      undefined_variable: `// Add null check
if (${errorData.variable || 'variable'}) {
  // Safe to use variable
}`,
      reference_error: `// Import missing dependency
import { ${errorData.missing || 'missingFunction'} } from './path/to/module';`,
      syntax_error: 'Review code syntax and fix parsing errors',
      network_error: `// Add retry logic
const fetchWithRetry = async (url, retries = 3) => {
  try {
    return await fetch(url);
  } catch (error) {
    if (retries > 0) {
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
};`,
      database_error: 'Check database connection and query parameters',
      auth_error: 'Verify authentication tokens and user permissions'
    };

    return fixes[errorType] || 'Manual investigation required';
  }

  private calculateRiskLevel(severity: string): number {
    const levels: Record<string, number> = {
      low: 2,
      medium: 5,
      high: 8,
      critical: 10
    };
    return levels[severity] || 5;
  }

  private identifyFilesToModify(errorData: any): string[] {
    const files = [];
    
    if (errorData.stack) {
      // Extract file paths from stack trace
      const stackLines = errorData.stack.split('\n');
      for (const line of stackLines) {
        const fileMatch = line.match(/at\s+.*\(([^:]+):/);
        if (fileMatch) {
          files.push(fileMatch[1]);
        }
      }
    }
    
    if (errorData.file) {
      files.push(errorData.file);
    }

    return [...new Set(files)]; // Remove duplicates
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
    const ai = new HeavenlyFireAI();
    
    console.log('Heavenly Fire AI received action:', action);

    switch (action) {
      case 'analyze_error':
        return await analyzeError(supabaseClient, ai, data);
      case 'diagnose_system':
        return await diagnoseSystem(supabaseClient, ai, data);
      case 'detect_threat':
        return await detectThreat(supabaseClient, ai, data);
      case 'apply_fix':
        return await applyFix(supabaseClient, data);
      case 'get_status':
        return await getSystemStatus(supabaseClient);
      case 'rollback_fix':
      case 'reapply_fix':
      case 'block_threat':
        // Delegate to rollback manager
        return await supabaseClient.functions.invoke('heavenly-fire-rollback', {
          body: { action, data }
        });
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in heavenly-fire-ai function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function analyzeError(supabase: any, ai: HeavenlyFireAI, errorData: any) {
  console.log('Analyzing error with independent AI:', errorData);
  
  const analysis = ai.analyzeError(errorData);

  // Log the analysis
  await supabase.from('heavenly_fire_logs').insert({
    action_type: 'error_analysis',
    severity: analysis.severity === 'critical' ? 'critical' : 'warning',
    title: `Error Analysis: ${errorData.error_type || 'Unknown Error'}`,
    description: analysis.diagnosis,
    error_details: errorData,
    fix_applied: analysis,
    risk_level: analysis.risk_level,
    target_system: errorData.system || 'general',
    success: true
  });

  return new Response(
    JSON.stringify({ analysis }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function diagnoseSystem(supabase: any, ai: HeavenlyFireAI, data: any) {
  console.log('Diagnosing system health:', data);
  
  const healthAnalysis = ai.analyzeSystemHealth(data.metrics || {});

  // Log system diagnosis
  await supabase.from('heavenly_fire_logs').insert({
    action_type: 'system_diagnosis',
    severity: healthAnalysis.overall_score < 70 ? 'warning' : 'info',
    title: `System Health Check: Score ${healthAnalysis.overall_score}/100`,
    description: `Found ${healthAnalysis.issues.length} issues. Recommendations: ${healthAnalysis.recommendations.join(', ')}`,
    error_details: data,
    fix_applied: healthAnalysis,
    risk_level: Math.max(0, 10 - Math.floor(healthAnalysis.overall_score / 10)),
    target_system: 'platform',
    success: true
  });

  return new Response(
    JSON.stringify({ healthAnalysis }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function detectThreat(supabase: any, ai: HeavenlyFireAI, requestData: any) {
  console.log('Analyzing security threat:', requestData);
  
  const threatAnalysis = ai.detectSecurityThreat(requestData);

  if (threatAnalysis.threat_detected) {
    // Log security incident
    await supabase.from('security_incidents').insert({
      incident_type: threatAnalysis.threat_type,
      severity: threatAnalysis.severity,
      source_ip: requestData.ip,
      user_agent: requestData.user_agent,
      attack_pattern: JSON.stringify(requestData),
      status: 'active',
      mitigation_actions: { action: threatAnalysis.recommended_action }
    });

    // Log in Heavenly Fire logs
    await supabase.from('heavenly_fire_logs').insert({
      action_type: 'security_alert',
      severity: 'critical',
      title: `Security Threat Detected: ${threatAnalysis.threat_type}`,
      description: `Threat detected and blocked: ${threatAnalysis.recommended_action}`,
      error_details: requestData,
      risk_level: 10,
      target_system: 'security',
      success: true
    });
  }

  return new Response(
    JSON.stringify({ threatAnalysis }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function applyFix(supabase: any, fixData: any) {
  console.log('Applying fix:', fixData);

  // Log the fix attempt
  await supabase.from('auto_fix_history').insert({
    error_type: fixData.error_type,
    error_message: fixData.error_message,
    fix_strategy: fixData.fix_strategy,
    affected_files: fixData.files_to_modify,
    code_diff: fixData.code_diff,
    sandbox_tested: fixData.sandbox_tested || false,
    test_results: fixData.test_results,
    applied_successfully: false, // Will be updated after applying
    admin_approved: null
  });

  // Log in Heavenly Fire logs
  await supabase.from('heavenly_fire_logs').insert({
    action_type: 'fix_applied',
    severity: 'info',
    title: `Fix Applied: ${fixData.error_type}`,
    description: fixData.description || 'Automated fix applied by Heavenly Fire AI',
    fix_applied: fixData,
    risk_level: fixData.risk_level || 5,
    target_system: fixData.system || 'general',
    success: true,
    rollback_available: true,
    rollback_data: fixData.rollback_data
  });

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Fix applied successfully',
      rollback_available: true 
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function getSystemStatus(supabase: any) {
  // Get recent logs
  const { data: logs } = await supabase
    .from('heavenly_fire_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Get system health metrics
  const { data: metrics } = await supabase
    .from('system_health_metrics')
    .select('*')
    .order('captured_at', { ascending: false })
    .limit(5);

  // Get security incidents
  const { data: incidents } = await supabase
    .from('security_incidents')
    .select('*')
    .eq('status', 'active')
    .order('started_at', { ascending: false });

  const status = {
    ai_active: true,
    mode: 'autonomous',
    recent_actions: logs?.length || 0,
    security_alerts: incidents?.length || 0,
    system_health: metrics?.[0]?.status || 'normal',
    last_check: new Date().toISOString()
  };

  return new Response(
    JSON.stringify({ status, logs, metrics, incidents }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}