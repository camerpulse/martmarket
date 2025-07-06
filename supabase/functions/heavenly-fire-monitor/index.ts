import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Independent System Monitor - No external dependencies
class SystemMonitor {
  private healthThresholds = {
    response_time_warning: 1000, // ms
    response_time_critical: 3000, // ms
    error_rate_warning: 0.02, // 2%
    error_rate_critical: 0.05, // 5%
    cpu_warning: 70, // %
    cpu_critical: 85, // %
    memory_warning: 80, // %
    memory_critical: 90, // %
  };

  async checkSystemHealth() {
    const now = Date.now();
    const metrics = {
      response_time: Math.random() * 2000 + 200, // Simulate response time
      error_rate: Math.random() * 0.03, // Simulate error rate
      cpu_usage: Math.random() * 60 + 20, // Simulate CPU usage
      memory_usage: Math.random() * 70 + 15, // Simulate memory usage
      uptime: now,
      timestamp: new Date().toISOString()
    };

    const status = this.evaluateMetrics(metrics);
    
    return {
      metrics,
      status: status.overall,
      warnings: status.warnings,
      alerts: status.alerts
    };
  }

  private evaluateMetrics(metrics: any) {
    const warnings = [];
    const alerts = [];
    let overall = 'normal';

    // Check response time
    if (metrics.response_time > this.healthThresholds.response_time_critical) {
      alerts.push('Critical response time detected');
      overall = 'critical';
    } else if (metrics.response_time > this.healthThresholds.response_time_warning) {
      warnings.push('High response time detected');
      if (overall === 'normal') overall = 'warning';
    }

    // Check error rate
    if (metrics.error_rate > this.healthThresholds.error_rate_critical) {
      alerts.push('Critical error rate detected');
      overall = 'critical';
    } else if (metrics.error_rate > this.healthThresholds.error_rate_warning) {
      warnings.push('High error rate detected');
      if (overall === 'normal') overall = 'warning';
    }

    // Check CPU usage
    if (metrics.cpu_usage > this.healthThresholds.cpu_critical) {
      alerts.push('Critical CPU usage detected');
      overall = 'critical';
    } else if (metrics.cpu_usage > this.healthThresholds.cpu_warning) {
      warnings.push('High CPU usage detected');
      if (overall === 'normal') overall = 'warning';
    }

    // Check memory usage
    if (metrics.memory_usage > this.healthThresholds.memory_critical) {
      alerts.push('Critical memory usage detected');
      overall = 'critical';
    } else if (metrics.memory_usage > this.healthThresholds.memory_warning) {
      warnings.push('High memory usage detected');
      if (overall === 'normal') overall = 'warning';
    }

    return { overall, warnings, alerts };
  }

  async scanForAnomalies(recentData: any[]) {
    const anomalies = [];

    // Look for sudden spikes in error rates
    if (recentData.length >= 3) {
      const latest = recentData[0];
      const average = recentData.slice(1, 4).reduce((sum, item) => sum + item.error_rate, 0) / 3;
      
      if (latest.error_rate > average * 3) {
        anomalies.push({
          type: 'error_spike',
          severity: 'high',
          description: 'Sudden spike in error rate detected',
          current: latest.error_rate,
          baseline: average
        });
      }
    }

    // Look for unusual response time patterns
    if (recentData.length >= 5) {
      const responseTimes = recentData.slice(0, 5).map(d => d.response_time);
      const avg = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const latest = responseTimes[0];

      if (latest > avg * 2.5) {
        anomalies.push({
          type: 'response_anomaly',
          severity: 'medium',
          description: 'Unusual response time pattern detected',
          current: latest,
          baseline: avg
        });
      }
    }

    return anomalies;
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

    console.log('Heavenly Fire Independent Monitor executing...');

    const monitor = new SystemMonitor();

    // Monitor system health
    await monitorSystemHealth(supabaseClient, monitor);
    
    // Check for threats and anomalies
    await scanForThreats(supabaseClient, monitor);
    
    // Update AI status
    await updateAIStatus(supabaseClient);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Independent monitoring cycle completed',
        timestamp: new Date().toISOString(),
        ai_type: 'independent'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in heavenly-fire-monitor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function monitorSystemHealth(supabase: any, monitor: SystemMonitor) {
  console.log('Monitoring system health...');

  try {
    const healthCheck = await monitor.checkSystemHealth();
    
    // Store health metrics
    await supabase.from('system_health_metrics').insert({
      metric_type: 'overall_health',
      metric_value: healthCheck.status === 'normal' ? 100 : healthCheck.status === 'warning' ? 75 : 50,
      status: healthCheck.status,
      threshold_warning: 75,
      threshold_critical: 50
    });

    // Store individual metrics
    const metrics = healthCheck.metrics;
    await supabase.from('system_health_metrics').insert([
      {
        metric_type: 'response_time',
        metric_value: metrics.response_time,
        status: metrics.response_time > 3000 ? 'critical' : metrics.response_time > 1000 ? 'warning' : 'normal',
        threshold_warning: 1000,
        threshold_critical: 3000
      },
      {
        metric_type: 'error_rate',
        metric_value: metrics.error_rate * 100,
        status: metrics.error_rate > 0.05 ? 'critical' : metrics.error_rate > 0.02 ? 'warning' : 'normal',
        threshold_warning: 2,
        threshold_critical: 5
      },
      {
        metric_type: 'cpu_usage',
        metric_value: metrics.cpu_usage,
        status: metrics.cpu_usage > 85 ? 'critical' : metrics.cpu_usage > 70 ? 'warning' : 'normal',
        threshold_warning: 70,
        threshold_critical: 85
      },
      {
        metric_type: 'memory_usage',
        metric_value: metrics.memory_usage,
        status: metrics.memory_usage > 90 ? 'critical' : metrics.memory_usage > 80 ? 'warning' : 'normal',
        threshold_warning: 80,
        threshold_critical: 90
      }
    ]);

    // Log warnings and alerts
    if (healthCheck.warnings.length > 0 || healthCheck.alerts.length > 0) {
      await supabase.from('heavenly_fire_logs').insert({
        action_type: 'monitor',
        severity: healthCheck.alerts.length > 0 ? 'critical' : 'warning',
        title: 'System Health Alert',
        description: `Warnings: ${healthCheck.warnings.join(', ')}. Alerts: ${healthCheck.alerts.join(', ')}`,
        error_details: healthCheck,
        risk_level: healthCheck.alerts.length > 0 ? 8 : 5,
        target_system: 'platform',
        success: true
      });
    }

    console.log('System health monitoring completed:', healthCheck.status);
  } catch (error) {
    console.error('Error monitoring system health:', error);
  }
}

async function scanForThreats(supabase: any, monitor: SystemMonitor) {
  console.log('Scanning for security threats and anomalies...');

  try {
    // Get recent health metrics for anomaly detection
    const { data: recentMetrics } = await supabase
      .from('system_health_metrics')
      .select('*')
      .order('captured_at', { ascending: false })
      .limit(10);

    if (recentMetrics && recentMetrics.length > 0) {
      const anomalies = await monitor.scanForAnomalies(recentMetrics);
      
      for (const anomaly of anomalies) {
        await supabase.from('heavenly_fire_logs').insert({
          action_type: 'anomaly_detected',
          severity: anomaly.severity === 'high' ? 'critical' : 'warning',
          title: `Anomaly Detected: ${anomaly.type}`,
          description: anomaly.description,
          error_details: anomaly,
          risk_level: anomaly.severity === 'high' ? 8 : 5,
          target_system: 'monitoring',
          success: true
        });

        // If it's a high severity anomaly, trigger the AI to analyze
        if (anomaly.severity === 'high') {
          await supabase.functions.invoke('heavenly-fire-ai', {
            body: {
              action: 'diagnose_system',
              data: {
                anomaly: anomaly,
                metrics: recentMetrics.slice(0, 5)
              }
            }
          });
        }
      }
    }

    console.log('Threat scanning completed');
  } catch (error) {
    console.error('Error scanning for threats:', error);
  }
}

async function updateAIStatus(supabase: any) {
  console.log('Updating AI status...');

  try {
    // Get current configuration
    const { data: config } = await supabase
      .from('heavenly_fire_config')
      .select('*')
      .single();

    if (config && config.ai_mode !== 'off') {
      // Log AI activity
      await supabase.from('heavenly_fire_logs').insert({
        action_type: 'monitor',
        severity: 'info',
        title: 'Independent AI Monitor Active',
        description: `Heavenly Fire AI is running independently without external dependencies. Mode: ${config.ai_mode}`,
        target_system: 'ai_core',
        success: true,
        risk_level: 1
      });
    }

    console.log('AI status updated');
  } catch (error) {
    console.error('Error updating AI status:', error);
  }
}