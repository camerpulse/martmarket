import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Advanced AI Evolution Engine - Self-Learning and Adaptive System
class AIEvolutionEngine {
  private learningRate = 0.1;
  private adaptationThreshold = 0.8;
  private knowledgeBase: Map<string, any> = new Map();

  async evolveAlgorithms(supabase: any) {
    console.log('🧠 Starting AI algorithm evolution...');
    
    try {
      // Get recent performance data
      const { data: logs } = await supabase
        .from('heavenly_fire_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Analyze success patterns
      const successRate = this.calculateSuccessRate(logs || []);
      const patternInsights = await this.analyzePatterns(logs || []);
      
      // Generate new knowledge
      const newKnowledge = await this.generateKnowledge(patternInsights);
      
      // Update knowledge base
      await this.updateKnowledgeBase(supabase, newKnowledge);
      
      // Evolve decision trees
      const evolvedRules = await this.evolveDecisionRules(supabase, successRate);
      
      // Log evolution results
      await this.logEvolution(supabase, {
        success_rate: successRate,
        patterns_discovered: patternInsights.length,
        knowledge_items_added: newKnowledge.length,
        rules_evolved: evolvedRules.length,
        learning_rate: this.learningRate
      });

      return {
        success: true,
        evolution_data: {
          generation: await this.getNextGeneration(supabase),
          improvements: newKnowledge.length,
          success_rate: successRate,
          patterns_learned: patternInsights.length
        }
      };

    } catch (error) {
      console.error('Evolution failed:', error);
      throw error;
    }
  }

  private calculateSuccessRate(logs: any[]): number {
    if (logs.length === 0) return 0.5;
    
    const successful = logs.filter(log => log.success === true).length;
    return successful / logs.length;
  }

  private async analyzePatterns(logs: any[]): Promise<any[]> {
    const patterns = [];
    
    // Group logs by error type and analyze success patterns
    const errorGroups = logs.reduce((groups, log) => {
      const errorType = log.action_type || 'unknown';
      if (!groups[errorType]) groups[errorType] = [];
      groups[errorType].push(log);
      return groups;
    }, {});

    for (const [errorType, errorLogs] of Object.entries(errorGroups)) {
      const successfulFixes = (errorLogs as any[]).filter(log => log.success);
      const failedFixes = (errorLogs as any[]).filter(log => !log.success);
      
      if (successfulFixes.length > 0) {
        patterns.push({
          error_type: errorType,
          success_rate: successfulFixes.length / (errorLogs as any[]).length,
          common_solutions: this.extractCommonSolutions(successfulFixes),
          failure_reasons: this.extractFailureReasons(failedFixes),
          confidence: Math.min(0.95, successfulFixes.length / 10)
        });
      }
    }

    return patterns;
  }

  private extractCommonSolutions(successfulFixes: any[]): string[] {
    // Extract common patterns from successful fixes
    const solutions = successfulFixes
      .map(fix => fix.fix_applied?.suggested_fix)
      .filter(Boolean)
      .reduce((acc, solution) => {
        const key = this.hashSolution(solution);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(solutions)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([solution]) => solution);
  }

  private extractFailureReasons(failedFixes: any[]): string[] {
    return failedFixes
      .map(fix => fix.error_details?.error || 'Unknown error')
      .slice(0, 3);
  }

  private hashSolution(solution: string): string {
    // Simple hash function for grouping similar solutions
    return solution.toLowerCase().replace(/\s+/g, '_').slice(0, 50);
  }

  private async generateKnowledge(patterns: any[]): Promise<any[]> {
    const knowledge = [];

    for (const pattern of patterns) {
      if (pattern.success_rate > this.adaptationThreshold) {
        knowledge.push({
          topic: `error_handling_${pattern.error_type}`,
          knowledge_type: 'pattern_recognition',
          content: {
            error_type: pattern.error_type,
            recommended_solutions: pattern.common_solutions,
            success_probability: pattern.success_rate,
            common_failures: pattern.failure_reasons,
            auto_apply: pattern.confidence > 0.8
          },
          confidence_score: pattern.confidence,
          learned_at: new Date().toISOString()
        });
      }
    }

    // Generate meta-learning insights
    if (patterns.length > 5) {
      knowledge.push({
        topic: 'meta_learning_insights',
        knowledge_type: 'meta_analysis',
        content: {
          total_patterns: patterns.length,
          average_success_rate: patterns.reduce((sum, p) => sum + p.success_rate, 0) / patterns.length,
          learning_velocity: this.calculateLearningVelocity(patterns),
          adaptation_recommendations: this.generateAdaptationRecommendations(patterns)
        },
        confidence_score: 0.9,
        learned_at: new Date().toISOString()
      });
    }

    return knowledge;
  }

  private calculateLearningVelocity(patterns: any[]): number {
    // Calculate how quickly the AI is learning new patterns
    const recentPatterns = patterns.filter(p => p.confidence > 0.7);
    return Math.min(1.0, recentPatterns.length / patterns.length);
  }

  private generateAdaptationRecommendations(patterns: any[]): string[] {
    const recommendations = [];
    
    const lowSuccessPatterns = patterns.filter(p => p.success_rate < 0.6);
    if (lowSuccessPatterns.length > 0) {
      recommendations.push('Increase analysis depth for low-success error types');
    }

    const highConfidencePatterns = patterns.filter(p => p.confidence > 0.9);
    if (highConfidencePatterns.length > 3) {
      recommendations.push('Enable autonomous fixing for high-confidence patterns');
    }

    if (patterns.length > 20) {
      recommendations.push('Consider pattern consolidation to improve efficiency');
    }

    return recommendations;
  }

  private async updateKnowledgeBase(supabase: any, newKnowledge: any[]): Promise<void> {
    for (const knowledge of newKnowledge) {
      await supabase
        .from('ai_knowledge_base')
        .upsert({
          ...knowledge,
          updated_at: new Date().toISOString()
        });
    }
  }

  private async evolveDecisionRules(supabase: any, successRate: number): Promise<any[]> {
    const evolvedRules = [];
    
    // Adjust learning rate based on success rate
    if (successRate > 0.8) {
      this.learningRate = Math.min(0.2, this.learningRate * 1.1);
    } else if (successRate < 0.6) {
      this.learningRate = Math.max(0.05, this.learningRate * 0.9);
    }

    // Create new fraud detection rules based on learned patterns
    const { data: threats } = await supabase
      .from('security_incidents')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50);

    if (threats && threats.length > 0) {
      const threatPatterns = this.analyzeThreatPatterns(threats);
      
      for (const pattern of threatPatterns) {
        evolvedRules.push({
          rule_name: `AI_Generated_${pattern.type}_Rule`,
          rule_type: 'security',
          conditions: pattern.conditions,
          action: pattern.recommended_action,
          threat_score: pattern.threat_score,
          is_active: pattern.confidence > 0.7
        });
      }
    }

    // Update fraud detection rules
    for (const rule of evolvedRules) {
      await supabase
        .from('fraud_detection_rules')
        .upsert(rule);
    }

    return evolvedRules;
  }

  private analyzeThreatPatterns(threats: any[]): any[] {
    const patterns = [];
    
    // Group threats by type and analyze
    const threatGroups = threats.reduce((groups, threat) => {
      const type = threat.incident_type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(threat);
      return groups;
    }, {});

    for (const [type, threatList] of Object.entries(threatGroups)) {
      const typedThreatList = threatList as any[];
      if (typedThreatList.length >= 3) {
        patterns.push({
          type: type,
          conditions: this.extractThreatConditions(typedThreatList),
          recommended_action: this.recommendThreatAction(type),
          threat_score: this.calculateThreatScore(typedThreatList),
          confidence: Math.min(0.95, typedThreatList.length / 10)
        });
      }
    }

    return patterns;
  }

  private extractThreatConditions(threats: any[]): any {
    // Extract common conditions from threat patterns
    const sourceIPs = threats.map(t => t.source_ip).filter(Boolean);
    const userAgents = threats.map(t => t.user_agent).filter(Boolean);
    
    return {
      source_ip_patterns: this.findCommonPatterns(sourceIPs),
      user_agent_patterns: this.findCommonPatterns(userAgents),
      frequency_threshold: Math.max(3, Math.floor(threats.length / 5))
    };
  }

  private findCommonPatterns(values: string[]): string[] {
    // Find common patterns in strings (simplified)
    const patterns = values.reduce((acc, value) => {
      const pattern = value.split('.').slice(0, 2).join('.'); // IP subnet pattern
      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(patterns)
      .filter(([, count]) => (count as number) > 1)
      .map(([pattern]) => pattern);
  }

  private recommendThreatAction(threatType: string): string {
    const actionMap: Record<string, string> = {
      'ddos_attempt': 'rate_limit_and_block',
      'sql_injection': 'block_immediately',
      'xss_attempt': 'sanitize_and_warn',
      'brute_force': 'temporary_block',
      'automated_bot': 'challenge_with_captcha'
    };

    return actionMap[threatType] || 'flag_for_review';
  }

  private calculateThreatScore(threats: any[]): number {
    const severityScores = { low: 1, medium: 3, high: 7, critical: 10 };
    const avgSeverity = threats.reduce((sum, threat) => {
      return sum + (severityScores[threat.severity] || 3);
    }, 0) / threats.length;

    return Math.min(10, avgSeverity + threats.length * 0.1);
  }

  private async logEvolution(supabase: any, evolutionData: any): Promise<void> {
    await supabase
      .from('ai_model_evolution')
      .insert({
        model_version: `gen_${await this.getNextGeneration(supabase)}`,
        improvement_type: 'autonomous_learning',
        learning_method: 'pattern_analysis_and_reinforcement',
        performance_before: { baseline: 'previous_generation' },
        performance_after: evolutionData,
        training_data_size: evolutionData.patterns_discovered || 0,
        evolved_at: new Date().toISOString()
      });

    await supabase
      .from('ai_learning_sessions')
      .insert({
        session_type: 'evolution_cycle',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        insights_generated: evolutionData.knowledge_items_added || 0,
        knowledge_updated: evolutionData.patterns_discovered || 0,
        performance_metrics: evolutionData,
        status: 'completed'
      });
  }

  private async getNextGeneration(supabase: any): Promise<number> {
    const { data } = await supabase
      .from('ai_model_evolution')
      .select('model_version')
      .order('evolved_at', { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return 1;
    
    const lastVersion = data[0].model_version;
    const match = lastVersion.match(/gen_(\d+)/);
    return match ? parseInt(match[1]) + 1 : 1;
  }

  async enableContinuousLearning(supabase: any): Promise<any> {
    console.log('🔄 Enabling continuous learning mode...');
    
    // Set up continuous learning parameters
    await supabase
      .from('heavenly_fire_config')
      .update({
        ai_mode: 'continuous_learning',
        auto_fix_enabled: true,
        max_auto_fixes_per_hour: 10
      })
      .eq('id', (await supabase.from('heavenly_fire_config').select('id').single()).data?.id);

    // Start background learning session
    await supabase
      .from('ai_learning_sessions')
      .insert({
        session_type: 'continuous_learning',
        started_at: new Date().toISOString(),
        status: 'running'
      });

    return {
      success: true,
      message: 'Continuous learning enabled',
      learning_mode: 'autonomous'
    };
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
    const engine = new AIEvolutionEngine();
    
    console.log('🧠 AI Evolution Engine received action:', action);

    let result;
    switch (action) {
      case 'trigger_evolution':
        result = await engine.evolveAlgorithms(supabaseClient);
        break;
      case 'enable_continuous_learning':
        result = await engine.enableContinuousLearning(supabaseClient);
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
    console.error('Error in AI Evolution Engine:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});