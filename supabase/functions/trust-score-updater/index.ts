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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { action, vendor_id, event_type, event_data } = await req.json();
    
    console.log(`Trust Score Updater: ${action} for vendor ${vendor_id}`);

    if (action === 'calculate_trust_score') {
      const trustScore = await calculateVendorTrustScore(supabaseAdmin, vendor_id);
      
      return new Response(
        JSON.stringify({
          success: true,
          vendor_id: vendor_id,
          trust_score: trustScore.score,
          factors: trustScore.factors,
          updated_at: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'update_from_event') {
      const currentScore = await getCurrentTrustScore(supabaseAdmin, vendor_id);
      const scoreChange = calculateScoreChange(event_type, event_data);
      const newScore = Math.max(0, Math.min(100, currentScore + scoreChange));
      
      // Update vendor profile
      await supabaseAdmin
        .from('vendor_profiles')
        .update({ trust_score: newScore })
        .eq('vendor_id', vendor_id);

      // Record in trust score history
      const { error: historyError } = await supabaseAdmin
        .from('trust_score_history')
        .insert({
          vendor_id: vendor_id,
          trust_score: newScore,
          score_change: scoreChange,
          change_reason: getChangeReason(event_type),
          contributing_factors: {
            event_type: event_type,
            event_data: event_data,
            previous_score: currentScore
          }
        });

      if (historyError) throw historyError;

      return new Response(
        JSON.stringify({
          success: true,
          vendor_id: vendor_id,
          previous_score: currentScore,
          new_score: newScore,
          score_change: scoreChange,
          event_type: event_type
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'batch_update_all') {
      // Update trust scores for all vendors
      const { data: vendors, error: vendorsError } = await supabaseAdmin
        .from('vendor_profiles')
        .select('vendor_id');

      if (vendorsError) throw vendorsError;

      const updateResults = [];
      for (const vendor of vendors || []) {
        try {
          const trustScore = await calculateVendorTrustScore(supabaseAdmin, vendor.vendor_id);
          
          await supabaseAdmin
            .from('vendor_profiles')
            .update({ trust_score: trustScore.score })
            .eq('vendor_id', vendor.vendor_id);

          // Record in history
          await supabaseAdmin
            .from('trust_score_history')
            .insert({
              vendor_id: vendor.vendor_id,
              trust_score: trustScore.score,
              score_change: 0,
              change_reason: 'Batch recalculation',
              contributing_factors: trustScore.factors
            });

          updateResults.push({
            vendor_id: vendor.vendor_id,
            trust_score: trustScore.score,
            success: true
          });
        } catch (error) {
          updateResults.push({
            vendor_id: vendor.vendor_id,
            success: false,
            error: error.message
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          total_vendors: vendors?.length || 0,
          successful_updates: updateResults.filter(r => r.success).length,
          results: updateResults
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Trust Score Updater Error:', error);
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
async function calculateVendorTrustScore(supabase: any, vendorId: string) {
  // Get vendor data
  const { data: vendor, error: vendorError } = await supabase
    .from('vendor_profiles')
    .select('*')
    .eq('vendor_id', vendorId)
    .single();

  if (vendorError) throw vendorError;

  // Get orders data
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('vendor_id', vendorId);

  // Get reviews data
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('vendor_id', vendorId);

  // Get tester feedback
  const { data: testerFeedback } = await supabase
    .from('tester_feedback')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('is_published', true);

  // Get disputes
  const { data: disputes } = await supabase
    .from('disputes')
    .select('*')
    .eq('vendor_id', vendorId);

  // Calculate individual factors
  const factors = {
    successful_orders: calculateSuccessfulOrdersScore(orders || []),
    customer_reviews: calculateCustomerReviewsScore(reviews || []),
    tester_feedback: calculateTesterFeedbackScore(testerFeedback || []),
    dispute_rate: calculateDisputeRateScore(orders || [], disputes || []),
    response_time: calculateResponseTimeScore(vendor.response_time_hours || 24),
    bond_status: vendor.bond_active ? 10 : 0,
    verification_status: vendor.is_verified ? 15 : 0
  };

  // Calculate weighted score
  const weights = {
    successful_orders: 0.25,
    customer_reviews: 0.20,
    tester_feedback: 0.20,
    dispute_rate: 0.15,
    response_time: 0.10,
    bond_status: 0.05,
    verification_status: 0.05
  };

  let totalScore = 0;
  for (const [factor, score] of Object.entries(factors)) {
    totalScore += score * (weights[factor as keyof typeof weights] || 0);
  }

  return {
    score: Math.round(Math.max(0, Math.min(100, totalScore))),
    factors: factors
  };
}

async function getCurrentTrustScore(supabase: any, vendorId: string): Promise<number> {
  const { data: vendor } = await supabase
    .from('vendor_profiles')
    .select('trust_score')
    .eq('vendor_id', vendorId)
    .single();

  return vendor?.trust_score || 50; // Default score
}

function calculateScoreChange(eventType: string, eventData: any): number {
  switch (eventType) {
    case 'order_completed':
      return 2;
    case 'positive_review':
      return eventData.rating >= 4 ? 3 : 1;
    case 'negative_review':
      return eventData.rating <= 2 ? -5 : -2;
    case 'dispute_opened':
      return -8;
    case 'dispute_resolved_favor_vendor':
      return 5;
    case 'dispute_resolved_favor_buyer':
      return -10;
    case 'tester_positive_feedback':
      return eventData.overall_rating >= 8 ? 4 : 2;
    case 'tester_negative_feedback':
      return eventData.overall_rating <= 5 ? -6 : -3;
    case 'fast_response':
      return 1;
    case 'slow_response':
      return -1;
    default:
      return 0;
  }
}

function getChangeReason(eventType: string): string {
  const reasons: { [key: string]: string } = {
    'order_completed': 'Successful order completion',
    'positive_review': 'Positive customer review',
    'negative_review': 'Negative customer review',
    'dispute_opened': 'New dispute opened',
    'dispute_resolved_favor_vendor': 'Dispute resolved in vendor favor',
    'dispute_resolved_favor_buyer': 'Dispute resolved in buyer favor',
    'tester_positive_feedback': 'Positive tester feedback',
    'tester_negative_feedback': 'Negative tester feedback',
    'fast_response': 'Fast response time',
    'slow_response': 'Slow response time'
  };
  
  return reasons[eventType] || 'Unknown event';
}

// Score calculation helper functions
function calculateSuccessfulOrdersScore(orders: any[]): number {
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalOrders = orders.length;
  
  if (totalOrders === 0) return 50; // Neutral score for new vendors
  
  const successRate = completedOrders.length / totalOrders;
  return Math.min(100, successRate * 100);
}

function calculateCustomerReviewsScore(reviews: any[]): number {
  if (reviews.length === 0) return 50;
  
  const averageRating = reviews.reduce((sum, review) => sum + review.overall_rating, 0) / reviews.length;
  return (averageRating / 5) * 100;
}

function calculateTesterFeedbackScore(feedback: any[]): number {
  if (feedback.length === 0) return 50;
  
  const averageRating = feedback.reduce((sum, fb) => sum + fb.overall_rating, 0) / feedback.length;
  return (averageRating / 10) * 100;
}

function calculateDisputeRateScore(orders: any[], disputes: any[]): number {
  if (orders.length === 0) return 50;
  
  const disputeRate = disputes.length / orders.length;
  return Math.max(0, 100 - (disputeRate * 200)); // Penalize high dispute rates
}

function calculateResponseTimeScore(responseTimeHours: number): number {
  // Score based on response time (lower is better)
  if (responseTimeHours <= 1) return 100;
  if (responseTimeHours <= 6) return 80;
  if (responseTimeHours <= 24) return 60;
  if (responseTimeHours <= 48) return 40;
  return 20;
}