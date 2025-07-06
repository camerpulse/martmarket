-- Create tables for self-learning AI system
CREATE TABLE public.ai_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_type TEXT NOT NULL, -- 'search_trend', 'competitor_analysis', 'market_insight', 'user_behavior'
  topic TEXT NOT NULL,
  content JSONB NOT NULL,
  confidence_score FLOAT NOT NULL DEFAULT 0.0,
  source_urls TEXT[],
  learned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_validated TIMESTAMP WITH TIME ZONE,
  validation_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_learning_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_type TEXT NOT NULL, -- 'trend_analysis', 'competitor_scan', 'user_feedback', 'performance_analysis'
  data_sources TEXT[],
  insights_generated INTEGER DEFAULT 0,
  knowledge_updated INTEGER DEFAULT 0,
  performance_metrics JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_model_evolution (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_version TEXT NOT NULL,
  improvement_type TEXT NOT NULL, -- 'accuracy', 'speed', 'knowledge', 'reasoning'
  performance_before JSONB,
  performance_after JSONB,
  training_data_size INTEGER,
  learning_method TEXT, -- 'supervised', 'unsupervised', 'reinforcement', 'transfer'
  evolved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.search_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_term TEXT NOT NULL,
  search_volume INTEGER,
  trend_direction TEXT, -- 'rising', 'falling', 'stable'
  related_terms TEXT[],
  market_category TEXT,
  user_intent JSONB, -- classified intent: informational, commercial, navigational
  opportunity_score FLOAT,
  competition_level TEXT, -- 'low', 'medium', 'high'
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT NOT NULL, -- 'google_trends', 'bing_trends', 'competitor_analysis'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_intelligence ENABLE ROW LEVEL SECURITY;

-- Create policies (system-level access for AI operations)
CREATE POLICY "System can manage AI knowledge" ON public.ai_knowledge_base FOR ALL USING (true);
CREATE POLICY "System can manage learning sessions" ON public.ai_learning_sessions FOR ALL USING (true);
CREATE POLICY "System can manage model evolution" ON public.ai_model_evolution FOR ALL USING (true);
CREATE POLICY "System can manage search intelligence" ON public.search_intelligence FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_ai_knowledge_topic ON public.ai_knowledge_base(topic);
CREATE INDEX idx_ai_knowledge_type ON public.ai_knowledge_base(knowledge_type);
CREATE INDEX idx_ai_knowledge_confidence ON public.ai_knowledge_base(confidence_score DESC);
CREATE INDEX idx_search_intelligence_term ON public.search_intelligence(search_term);
CREATE INDEX idx_search_intelligence_opportunity ON public.search_intelligence(opportunity_score DESC);

-- Create triggers for timestamp updates
CREATE TRIGGER update_ai_knowledge_base_updated_at
  BEFORE UPDATE ON public.ai_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get trending opportunities
CREATE OR REPLACE FUNCTION public.get_trending_opportunities()
RETURNS TABLE (
  search_term TEXT,
  opportunity_score FLOAT,
  trend_direction TEXT,
  search_volume INTEGER,
  related_terms TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    si.search_term,
    si.opportunity_score,
    si.trend_direction,
    si.search_volume,
    si.related_terms
  FROM public.search_intelligence si
  WHERE si.opportunity_score > 0.7
    AND si.trend_direction = 'rising'
    AND si.captured_at > NOW() - INTERVAL '7 days'
  ORDER BY si.opportunity_score DESC, si.search_volume DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;