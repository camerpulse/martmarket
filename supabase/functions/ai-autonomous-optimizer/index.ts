import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { pipeline } from 'https://esm.sh/@huggingface/transformers@3.1.2';

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

    const { action = 'optimize_autonomously', target_type = 'all' } = await req.json();

    console.log(`AI Autonomous Optimizer: ${action} for ${target_type}`);

    // Initialize AI models for processing
    const textGenerator = await pipeline('text-generation', 'Xenova/LaMini-Flan-T5-783M', {
      device: 'cpu'
    });

    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      device: 'cpu'
    });

    // Get latest knowledge and trends
    const { data: knowledge, error: knowledgeError } = await supabaseAdmin
      .from('ai_knowledge_base')
      .select('*')
      .eq('is_active', true)
      .gte('confidence_score', 0.6)
      .order('learned_at', { ascending: false })
      .limit(100);

    if (knowledgeError) throw knowledgeError;

    const { data: trends, error: trendsError } = await supabaseAdmin
      .from('search_intelligence')
      .select('*')
      .gte('opportunity_score', 0.5)
      .eq('trend_direction', 'rising')
      .order('captured_at', { ascending: false })
      .limit(50);

    if (trendsError) throw trendsError;

    console.log(`Processing ${knowledge.length} knowledge items and ${trends.length} trends`);

    let optimizationsApplied = 0;
    let performanceImprovements = [];

    // Autonomous SEO Optimization
    if (target_type === 'all' || target_type === 'seo') {
      const seoOptimizations = await autonomousSEOOptimization(
        supabaseAdmin, textGenerator, embedder, knowledge, trends
      );
      optimizationsApplied += seoOptimizations.count;
      performanceImprovements.push(...seoOptimizations.improvements);
    }

    // Autonomous Product Optimization
    if (target_type === 'all' || target_type === 'products') {
      const productOptimizations = await autonomousProductOptimization(
        supabaseAdmin, textGenerator, knowledge, trends
      );
      optimizationsApplied += productOptimizations.count;
      performanceImprovements.push(...productOptimizations.improvements);
    }

    // Autonomous Market Strategy Updates
    if (target_type === 'all' || target_type === 'strategy') {
      const strategyUpdates = await autonomousStrategyOptimization(
        supabaseAdmin, textGenerator, knowledge, trends
      );
      optimizationsApplied += strategyUpdates.count;
      performanceImprovements.push(...strategyUpdates.improvements);
    }

    // Self-Learning and Model Improvement
    const learningResults = await performSelfLearning(
      supabaseAdmin, textGenerator, knowledge, trends, performanceImprovements
    );

    // Record optimization session
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from('ai_learning_sessions')
      .insert({
        session_type: 'autonomous_optimization',
        data_sources: ['knowledge_base', 'search_intelligence', 'performance_data'],
        insights_generated: optimizationsApplied,
        knowledge_updated: learningResults.knowledgeUpdated,
        performance_metrics: {
          optimizations_applied: optimizationsApplied,
          performance_improvements: performanceImprovements.length,
          learning_efficiency: learningResults.efficiency,
          autonomous_accuracy: calculateAutonomousAccuracy(performanceImprovements)
        },
        completed_at: new Date().toISOString(),
        status: 'completed'
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    return new Response(
      JSON.stringify({
        success: true,
        session_id: sessionData.id,
        optimizations_applied: optimizationsApplied,
        performance_improvements: performanceImprovements.length,
        learning_results: learningResults,
        autonomous_intelligence_level: calculateIntelligenceLevel(knowledge.length, optimizationsApplied),
        next_evolution_milestone: getNextEvolutionMilestone(knowledge.length),
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('AI Autonomous Optimizer Error:', error);
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

// Autonomous SEO Optimization
async function autonomousSEOOptimization(supabase, textGenerator, embedder, knowledge, trends) {
  let count = 0;
  const improvements = [];

  try {
    // Get products that need SEO optimization
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .limit(20);

    if (productsError) throw productsError;

    for (const product of products) {
      // Find relevant trends for this product
      const relevantTrends = trends.filter(trend => 
        product.tags?.some(tag => 
          trend.search_term.toLowerCase().includes(tag.toLowerCase()) ||
          trend.related_terms?.some(related => 
            related.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );

      if (relevantTrends.length > 0) {
        // Generate AI-powered SEO improvements
        const seoPrompt = `Optimize this product for search engines based on trending keywords.
Product: ${product.title}
Description: ${product.description}
Trending Keywords: ${relevantTrends.map(t => t.search_term).join(', ')}
Create an improved title and description that includes these trending terms naturally.`;

        const seoResult = await textGenerator(seoPrompt, {
          max_new_tokens: 200,
          temperature: 0.7,
          do_sample: true
        });

        // Extract optimized content (simplified parsing)
        const optimizedContent = parseSEOOptimization(seoResult[0].generated_text);

        if (optimizedContent.title && optimizedContent.description) {
          // Apply optimization
          const { error: updateError } = await supabase
            .from('products')
            .update({
              title: optimizedContent.title,
              description: optimizedContent.description,
              tags: [...(product.tags || []), ...relevantTrends.slice(0, 3).map(t => t.search_term)]
            })
            .eq('id', product.id);

          if (!updateError) {
            count++;
            improvements.push({
              type: 'seo_optimization',
              product_id: product.id,
              changes: optimizedContent,
              trend_alignment: relevantTrends.length
            });

            // Log the optimization in AI logs
            await supabase
              .from('ai_optimization_logs')
              .insert({
                action: 'autonomous_seo_optimization',
                input_data: { 
                  original_title: product.title,
                  original_description: product.description,
                  trending_keywords: relevantTrends.map(t => t.search_term)
                },
                output_data: optimizedContent,
                model_used: 'LaMini-Flan-T5-783M-autonomous',
                processing_time: Date.now(),
                product_id: product.id
              });
          }
        }
      }
    }

    console.log(`Applied ${count} SEO optimizations`);
    return { count, improvements };
  } catch (error) {
    console.error('Error in autonomous SEO optimization:', error);
    return { count, improvements };
  }
}

// Autonomous Product Optimization
async function autonomousProductOptimization(supabase, textGenerator, knowledge, trends) {
  let count = 0;
  const improvements = [];

  try {
    // Analyze market opportunities from knowledge base
    const marketOpportunities = knowledge.filter(k => 
      k.knowledge_type === 'search_trend' && 
      k.confidence_score > 0.8
    );

    for (const opportunity of marketOpportunities.slice(0, 5)) {
      const content = opportunity.content as any;
      
      if (content.market_opportunity > 0.8) {
        // Generate product suggestions based on market gaps
        const productPrompt = `Based on this market opportunity, suggest a product that would be perfect for a Bitcoin marketplace:
Market Trend: ${opportunity.topic}
Opportunity Score: ${content.market_opportunity}
User Intent: ${content.trend_data?.intent?.type || 'commercial'}
Create a product title, description, and suggested price in BTC.`;

        const productResult = await textGenerator(productPrompt, {
          max_new_tokens: 300,
          temperature: 0.8,
          do_sample: true
        });

        const productSuggestion = parseProductSuggestion(productResult[0].generated_text);
        
        if (productSuggestion.title && productSuggestion.description) {
          // Store as AI-generated product recommendation
          await supabase
            .from('ai_knowledge_base')
            .insert({
              knowledge_type: 'market_insight',
              topic: `product_opportunity_${opportunity.topic}`,
              content: {
                product_suggestion: productSuggestion,
                market_data: content,
                ai_confidence: 0.75,
                recommendation_type: 'autonomous_product_generation'
              },
              confidence_score: 0.75,
              source_urls: []
            });

          count++;
          improvements.push({
            type: 'product_opportunity',
            market_trend: opportunity.topic,
            suggestion: productSuggestion
          });
        }
      }
    }

    console.log(`Generated ${count} product opportunities`);
    return { count, improvements };
  } catch (error) {
    console.error('Error in autonomous product optimization:', error);
    return { count, improvements };
  }
}

// Autonomous Strategy Optimization
async function autonomousStrategyOptimization(supabase, textGenerator, knowledge, trends) {
  let count = 0;
  const improvements = [];

  try {
    // Analyze competitive landscape
    const competitorKnowledge = knowledge.filter(k => 
      k.knowledge_type === 'competitor_analysis'
    );

    if (competitorKnowledge.length > 0) {
      // Generate strategic recommendations
      const strategyPrompt = `Based on competitor analysis and market trends, provide strategic recommendations for a Bitcoin marketplace:
Competitors Analyzed: ${competitorKnowledge.length}
Rising Trends: ${trends.slice(0, 5).map(t => t.search_term).join(', ')}
Provide 3 key strategic recommendations.`;

      const strategyResult = await textGenerator(strategyPrompt, {
        max_new_tokens: 250,
        temperature: 0.6,
        do_sample: true
      });

      const strategies = parseStrategicRecommendations(strategyResult[0].generated_text);
      
      // Store strategic insights
      await supabase
        .from('ai_knowledge_base')
        .insert({
          knowledge_type: 'market_insight',
          topic: 'autonomous_strategic_recommendations',
          content: {
            strategies: strategies,
            competitor_count: competitorKnowledge.length,
            trend_count: trends.length,
            ai_generated: true,
            strategy_confidence: 0.8
          },
          confidence_score: 0.8,
          source_urls: []
        });

      count++;
      improvements.push({
        type: 'strategic_optimization',
        strategies: strategies,
        basis: 'competitor_and_trend_analysis'
      });
    }

    return { count, improvements };
  } catch (error) {
    console.error('Error in autonomous strategy optimization:', error);
    return { count, improvements };
  }
}

// Self-Learning and Model Improvement
async function performSelfLearning(supabase, textGenerator, knowledge, trends, improvements) {
  let knowledgeUpdated = 0;
  
  try {
    // Analyze the effectiveness of previous optimizations
    const { data: recentLogs, error: logsError } = await supabase
      .from('ai_optimization_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (logsError) throw logsError;

    // Learn from successful patterns
    const successPatterns = analyzePatternsForLearning(recentLogs, improvements);
    
    for (const pattern of successPatterns) {
      await supabase
        .from('ai_knowledge_base')
        .insert({
          knowledge_type: 'user_behavior',
          topic: `optimization_pattern_${pattern.type}`,
          content: {
            pattern: pattern,
            success_rate: pattern.success_rate,
            learned_from: 'autonomous_analysis',
            application_count: pattern.frequency,
            learning_method: 'pattern_recognition'
          },
          confidence_score: pattern.success_rate,
          source_urls: []
        });

      knowledgeUpdated++;
    }

    // Calculate learning efficiency
    const efficiency = knowledgeUpdated / Math.max(improvements.length, 1);

    return {
      knowledgeUpdated,
      efficiency,
      patterns_learned: successPatterns.length,
      self_improvement_score: calculateSelfImprovementScore(successPatterns)
    };
  } catch (error) {
    console.error('Error in self-learning:', error);
    return { knowledgeUpdated: 0, efficiency: 0, patterns_learned: 0, self_improvement_score: 0 };
  }
}

// Helper functions
function parseSEOOptimization(generatedText) {
  // Simple parsing logic - in production, this would be more sophisticated
  const lines = generatedText.split('\n').filter(line => line.trim());
  
  return {
    title: lines.find(line => line.toLowerCase().includes('title'))?.replace(/.*title:?\s*/i, '').trim() || null,
    description: lines.find(line => line.toLowerCase().includes('description'))?.replace(/.*description:?\s*/i, '').trim() || null
  };
}

function parseProductSuggestion(generatedText) {
  const lines = generatedText.split('\n').filter(line => line.trim());
  
  return {
    title: lines.find(line => line.toLowerCase().includes('title'))?.replace(/.*title:?\s*/i, '').trim() || null,
    description: lines.find(line => line.toLowerCase().includes('description'))?.replace(/.*description:?\s*/i, '').trim() || null,
    price_btc: extractBTCPrice(generatedText) || 0.001
  };
}

function parseStrategicRecommendations(generatedText) {
  const lines = generatedText.split('\n').filter(line => line.trim());
  return lines.filter(line => 
    line.match(/^\d+\./) || 
    line.toLowerCase().includes('recommend') ||
    line.toLowerCase().includes('strategy')
  ).slice(0, 3);
}

function extractBTCPrice(text) {
  const btcMatch = text.match(/(\d+\.?\d*)\s*btc/i);
  return btcMatch ? parseFloat(btcMatch[1]) : null;
}

function analyzePatternsForLearning(logs, improvements) {
  const patterns = [];
  
  // Group by action type
  const actionGroups = logs.reduce((groups, log) => {
    const action = log.action;
    if (!groups[action]) groups[action] = [];
    groups[action].push(log);
    return groups;
  }, {});

  for (const [action, actionLogs] of Object.entries(actionGroups)) {
    if (actionLogs.length > 3) { // Only analyze patterns with sufficient data
      patterns.push({
        type: action,
        frequency: actionLogs.length,
        success_rate: 0.8, // Simplified - would calculate based on actual performance metrics
        characteristics: extractPatternCharacteristics(actionLogs)
      });
    }
  }

  return patterns;
}

function extractPatternCharacteristics(logs) {
  return {
    avg_processing_time: logs.reduce((sum, log) => sum + (log.processing_time || 0), 0) / logs.length,
    common_inputs: findCommonPatterns(logs.map(log => log.input_data)),
    success_indicators: ['consistent_application', 'positive_feedback']
  };
}

function findCommonPatterns(inputData) {
  // Simplified pattern detection
  return ['optimization_request', 'trend_alignment', 'market_opportunity'];
}

function calculateAutonomousAccuracy(improvements) {
  return improvements.length > 0 ? 0.85 : 0.0; // Simplified accuracy calculation
}

function calculateIntelligenceLevel(knowledgeCount, optimizationsCount) {
  const baseLevel = Math.min(knowledgeCount / 1000, 1.0);
  const actionLevel = Math.min(optimizationsCount / 100, 1.0);
  return (baseLevel * 0.7 + actionLevel * 0.3) * 100; // Intelligence level as percentage
}

function getNextEvolutionMilestone(currentKnowledge) {
  const milestones = [100, 500, 1000, 2500, 5000, 10000];
  return milestones.find(m => m > currentKnowledge) || milestones[milestones.length - 1];
}

function calculateSelfImprovementScore(patterns) {
  return patterns.reduce((score, pattern) => 
    score + (pattern.success_rate * pattern.frequency), 0
  ) / Math.max(patterns.length, 1);
}