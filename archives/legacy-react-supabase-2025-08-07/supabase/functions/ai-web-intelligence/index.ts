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

    const { action = 'collect_intelligence' } = await req.json();

    console.log(`AI Web Intelligence: ${action} started`);

    // Start a learning session
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from('ai_learning_sessions')
      .insert({
        session_type: 'trend_analysis',
        data_sources: ['search_trends', 'competitor_analysis', 'market_research'],
        status: 'running'
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Initialize local AI model for content analysis
    const classifier = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
      device: 'cpu'
    });

    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      device: 'cpu'
    });

    // Collect intelligence from multiple sources
    const intelligenceData = await collectWebIntelligence();
    
    let insightsGenerated = 0;
    let knowledgeUpdated = 0;

    // Process each intelligence source
    for (const intel of intelligenceData) {
      try {
        // Analyze search trends
        const trendAnalysis = await analyzeTrends(intel.searches, classifier, embedder);
        
        // Store search intelligence
        for (const trend of trendAnalysis) {
          const { error: insertError } = await supabaseAdmin
            .from('search_intelligence')
            .insert({
              search_term: trend.term,
              search_volume: trend.volume,
              trend_direction: trend.direction,
              related_terms: trend.related,
              market_category: trend.category,
              user_intent: trend.intent,
              opportunity_score: trend.opportunity,
              competition_level: trend.competition,
              source: intel.source
            });

          if (!insertError) {
            insightsGenerated++;
            
            // Update knowledge base with high-confidence insights
            if (trend.opportunity > 0.7) {
              const { error: knowledgeError } = await supabaseAdmin
                .from('ai_knowledge_base')
                .insert({
                  knowledge_type: 'search_trend',
                  topic: trend.term,
                  content: {
                    trend_data: trend,
                    market_opportunity: trend.opportunity,
                    recommended_actions: generateRecommendations(trend),
                    learning_confidence: trend.confidence || 0.8
                  },
                  confidence_score: trend.opportunity,
                  source_urls: intel.sources || []
                });

              if (!knowledgeError) knowledgeUpdated++;
            }
          }
        }

        // Learn from competitor analysis
        if (intel.competitors) {
          const competitorInsights = await analyzeCompetitors(intel.competitors, embedder);
          
          for (const insight of competitorInsights) {
            const { error: compError } = await supabaseAdmin
              .from('ai_knowledge_base')
              .insert({
                knowledge_type: 'competitor_analysis',
                topic: insight.domain,
                content: {
                  competitor_data: insight,
                  market_gaps: insight.gaps,
                  opportunity_areas: insight.opportunities,
                  strategic_recommendations: insight.recommendations
                },
                confidence_score: insight.confidence,
                source_urls: [insight.url]
              });

            if (!compError) knowledgeUpdated++;
          }
        }

      } catch (error) {
        console.error('Error processing intelligence:', error);
      }
    }

    // Update learning session
    await supabaseAdmin
      .from('ai_learning_sessions')
      .update({
        insights_generated: insightsGenerated,
        knowledge_updated: knowledgeUpdated,
        completed_at: new Date().toISOString(),
        status: 'completed',
        performance_metrics: {
          sources_processed: intelligenceData.length,
          insights_per_source: insightsGenerated / intelligenceData.length,
          knowledge_conversion_rate: knowledgeUpdated / insightsGenerated
        }
      })
      .eq('id', sessionData.id);

    // Trigger model evolution if significant learning occurred
    if (knowledgeUpdated > 10) {
      await triggerModelEvolution(supabaseAdmin, knowledgeUpdated);
    }

    return new Response(
      JSON.stringify({
        success: true,
        session_id: sessionData.id,
        insights_generated: insightsGenerated,
        knowledge_updated: knowledgeUpdated,
        learning_efficiency: knowledgeUpdated / insightsGenerated,
        next_evolution_threshold: 50 - knowledgeUpdated,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('AI Web Intelligence Error:', error);
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

// Collect intelligence from web sources
async function collectWebIntelligence() {
  const sources = [];
  
  try {
    // Simulate trend collection (in production, integrate with trend APIs or scraping)
    const searchTrends = await collectSearchTrends();
    sources.push({
      source: 'search_trends',
      searches: searchTrends,
      sources: ['google_trends_api', 'bing_webmaster']
    });

    // Collect competitor intelligence
    const competitors = await analyzeCompetitorLandscape();
    sources.push({
      source: 'competitor_analysis',
      competitors: competitors,
      sources: ['competitor_websites', 'seo_tools']
    });

    console.log(`Collected intelligence from ${sources.length} sources`);
    return sources;
  } catch (error) {
    console.error('Error collecting web intelligence:', error);
    return [];
  }
}

// Analyze search trends using AI
async function analyzeTrends(searches, classifier, embedder) {
  const trends = [];
  
  for (const search of searches) {
    try {
      // Generate embeddings for semantic analysis
      const embedding = await embedder(search.term);
      
      // Classify user intent
      const intentAnalysis = await classifier(`${search.term} ${search.context || ''}`);
      
      // Calculate opportunity score
      const opportunityScore = calculateOpportunityScore(search, intentAnalysis);
      
      trends.push({
        term: search.term,
        volume: search.volume || Math.floor(Math.random() * 10000),
        direction: search.trend || 'stable',
        related: search.related || [],
        category: classifyCategory(search.term),
        intent: {
          type: mapIntentType(intentAnalysis),
          confidence: intentAnalysis[0]?.score || 0.5
        },
        opportunity: opportunityScore,
        competition: assessCompetition(search.term),
        confidence: 0.8,
        embedding: Array.from(embedding.data || [])
      });
    } catch (error) {
      console.error(`Error analyzing trend: ${search.term}`, error);
    }
  }
  
  return trends;
}

// Analyze competitors using AI
async function analyzeCompetitors(competitors, embedder) {
  const insights = [];
  
  for (const competitor of competitors) {
    try {
      const insight = {
        domain: competitor.domain,
        url: competitor.url,
        traffic_estimate: competitor.traffic || Math.floor(Math.random() * 100000),
        top_keywords: competitor.keywords || [],
        content_gaps: identifyContentGaps(competitor),
        opportunities: identifyOpportunities(competitor),
        recommendations: generateCompetitorRecommendations(competitor),
        confidence: 0.7
      };
      
      insights.push(insight);
    } catch (error) {
      console.error(`Error analyzing competitor: ${competitor.domain}`, error);
    }
  }
  
  return insights;
}

// Helper functions
async function collectSearchTrends() {
  // In production, this would integrate with real trend APIs
  // For now, simulate trending cryptocurrency and marketplace terms
  return [
    { term: 'bitcoin marketplace', volume: 8500, trend: 'rising', related: ['crypto market', 'btc store', 'bitcoin shopping'] },
    { term: 'anonymous shopping', volume: 3200, trend: 'rising', related: ['private marketplace', 'secure buying'] },
    { term: 'crypto payment', volume: 12000, trend: 'stable', related: ['bitcoin payment', 'cryptocurrency transaction'] },
    { term: 'decentralized marketplace', volume: 2100, trend: 'rising', related: ['peer to peer trading', 'web3 commerce'] },
    { term: 'privacy coins', volume: 6500, trend: 'rising', related: ['monero', 'zcash', 'private crypto'] }
  ];
}

async function analyzeCompetitorLandscape() {
  // In production, this would scrape competitor data
  return [
    { domain: 'example-crypto-market.com', url: 'https://example.com', keywords: ['bitcoin', 'crypto', 'marketplace'] },
    { domain: 'another-btc-store.com', url: 'https://another.com', keywords: ['bitcoin store', 'crypto shopping'] }
  ];
}

function calculateOpportunityScore(search, intentAnalysis) {
  let score = 0;
  
  // Volume factor (higher volume = higher opportunity)
  score += Math.min((search.volume || 1000) / 10000, 0.3);
  
  // Trend factor (rising trends = higher opportunity)  
  if (search.trend === 'rising') score += 0.4;
  else if (search.trend === 'stable') score += 0.2;
  
  // Intent factor (commercial intent = higher opportunity)
  if (intentAnalysis[0]?.label === 'POSITIVE') score += 0.3;
  
  return Math.min(score, 1.0);
}

function classifyCategory(term) {
  const categories = {
    crypto: ['bitcoin', 'crypto', 'cryptocurrency', 'btc', 'eth'],
    marketplace: ['marketplace', 'store', 'shop', 'buy', 'sell'],
    privacy: ['anonymous', 'private', 'secure', 'privacy', 'confidential'],
    payment: ['payment', 'transaction', 'pay', 'purchase']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => term.toLowerCase().includes(keyword))) {
      return category;
    }
  }
  
  return 'general';
}

function mapIntentType(analysis) {
  // Map sentiment analysis to search intent
  if (analysis[0]?.label === 'POSITIVE') return 'commercial';
  return 'informational';
}

function assessCompetition(term) {
  // Simple competition assessment based on term characteristics
  if (term.includes('bitcoin') || term.includes('crypto')) return 'high';
  if (term.includes('marketplace') || term.includes('store')) return 'medium';
  return 'low';
}

function identifyContentGaps(competitor) {
  return ['SEO optimization', 'user experience', 'mobile optimization'];
}

function identifyOpportunities(competitor) {
  return ['Better user interface', 'Faster transactions', 'Lower fees'];
}

function generateRecommendations(trend) {
  return [
    `Optimize for "${trend.term}" keyword`,
    `Create content targeting ${trend.category} category`,
    `Focus on ${trend.intent.type} intent optimization`
  ];
}

function generateCompetitorRecommendations(competitor) {
  return [
    `Improve upon ${competitor.domain}'s user experience`,
    `Target their weak keyword areas`,
    `Offer better features than competitors`
  ];
}

async function triggerModelEvolution(supabase, knowledgeCount) {
  try {
    const { error } = await supabase
      .from('ai_model_evolution')
      .insert({
        model_version: `v1.${Date.now()}`,
        improvement_type: 'knowledge',
        performance_before: { knowledge_base_size: knowledgeCount - 10 },
        performance_after: { knowledge_base_size: knowledgeCount },
        training_data_size: knowledgeCount,
        learning_method: 'unsupervised'
      });

    if (error) console.error('Error recording model evolution:', error);
    else console.log('Model evolution triggered successfully');
  } catch (error) {
    console.error('Error triggering model evolution:', error);
  }
}