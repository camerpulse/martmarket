import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    const { title, description, category, price_btc, action = 'enhance' } = await req.json();

    if (!title || !description) {
      throw new Error("Title and description are required");
    }

    console.log(`SEO AI processing: ${action} for product: ${title}`);

    let prompt = '';
    
    if (action === 'enhance') {
      prompt = `You are an SEO expert for OpesMarket, a Bitcoin-only anonymous marketplace. 

TASK: Enhance this product listing for maximum search visibility and conversion.

ORIGINAL LISTING:
Title: ${title}
Description: ${description}
Category: ${category || 'General'}
Price: ${price_btc} BTC

REQUIREMENTS:
1. Create SEO-optimized title (max 80 chars) with high-value keywords
2. Write compelling description (200-400 words) that includes:
   - Key benefits and features
   - Relevant search keywords naturally integrated
   - Trust signals and quality indicators
   - Call-to-action elements
3. Generate 10 relevant SEO keywords/tags
4. Create meta description (max 160 chars)
5. Suggest 3 alternative titles for A/B testing

CONTEXT: 
- This is a privacy-focused, Bitcoin-only marketplace
- Buyers value anonymity, security, and quality
- Vendors need to build trust through detailed descriptions
- SEO should target crypto/privacy-conscious users

RESPONSE FORMAT (JSON):
{
  "optimized_title": "SEO-enhanced title",
  "optimized_description": "Enhanced description with keywords",
  "keywords": ["keyword1", "keyword2", ...],
  "meta_description": "Brief compelling summary",
  "alternative_titles": ["Alt title 1", "Alt title 2", "Alt title 3"],
  "seo_score": 85,
  "improvements": ["improvement 1", "improvement 2"]
}`;
    } else if (action === 'generate_keywords') {
      prompt = `Generate SEO keywords for this product on OpesMarket (Bitcoin marketplace):

Title: ${title}
Description: ${description}
Category: ${category}

Return 20 relevant keywords as JSON array: ["keyword1", "keyword2", ...]

Focus on: Bitcoin, crypto, privacy, anonymity, quality terms related to the product.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an SEO expert specializing in e-commerce optimization for privacy-focused marketplaces. Respond only with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0].message.content;

    let seoData;
    try {
      seoData = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Log the SEO optimization for analytics
    await supabaseAdmin
      .from('ai_optimization_logs')
      .insert({
        action: action,
        input_data: { title, description, category, price_btc },
        output_data: seoData,
        model_used: 'gpt-4o-mini',
        tokens_used: aiResponse.usage?.total_tokens || 0,
        processing_time: Date.now()
      })
      .select()
      .single()
      .catch(err => console.log('Logging failed (table might not exist):', err));

    return new Response(
      JSON.stringify({
        success: true,
        data: seoData,
        metadata: {
          tokens_used: aiResponse.usage?.total_tokens || 0,
          model: 'gpt-4o-mini',
          action: action,
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('SEO AI Error:', error);
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