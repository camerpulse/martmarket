-- Create AI conversation memory table
CREATE TABLE public.ai_conversation_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'ai')),
  content TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI user profiles table
CREATE TABLE public.ai_user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferences JSONB DEFAULT '{}',
  preferred_style TEXT DEFAULT 'balanced',
  technical_level TEXT DEFAULT 'intermediate',
  interaction_history JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI knowledge memory table
CREATE TABLE public.ai_knowledge_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  confidence DOUBLE PRECISION DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_count INTEGER DEFAULT 0,
  related_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI personality memory table
CREATE TABLE public.ai_personality_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trait TEXT NOT NULL,
  value TEXT NOT NULL,
  strength DOUBLE PRECISION DEFAULT 5.0 CHECK (strength >= 0.0 AND strength <= 10.0),
  examples TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_knowledge_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_personality_memory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_conversation_memory
CREATE POLICY "Users can view their own conversation memory"
ON public.ai_conversation_memory FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation memory"
ON public.ai_conversation_memory FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can manage conversation memory"
ON public.ai_conversation_memory FOR ALL
USING (true);

-- Create RLS policies for ai_user_profiles
CREATE POLICY "Users can view their own AI profile"
ON public.ai_user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI profile"
ON public.ai_user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI profile"
ON public.ai_user_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can manage AI profiles"
ON public.ai_user_profiles FOR ALL
USING (true);

-- Create RLS policies for ai_knowledge_memory
CREATE POLICY "System can manage AI knowledge"
ON public.ai_knowledge_memory FOR ALL
USING (true);

-- Create RLS policies for ai_personality_memory
CREATE POLICY "System can manage AI personality"
ON public.ai_personality_memory FOR ALL
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_ai_conversation_memory_user_id ON public.ai_conversation_memory(user_id);
CREATE INDEX idx_ai_conversation_memory_session_id ON public.ai_conversation_memory(session_id);
CREATE INDEX idx_ai_conversation_memory_created_at ON public.ai_conversation_memory(created_at);
CREATE INDEX idx_ai_user_profiles_user_id ON public.ai_user_profiles(user_id);
CREATE INDEX idx_ai_knowledge_memory_topic ON public.ai_knowledge_memory(topic);
CREATE INDEX idx_ai_knowledge_memory_confidence ON public.ai_knowledge_memory(confidence);
CREATE INDEX idx_ai_personality_memory_trait ON public.ai_personality_memory(trait);

-- Create triggers for updated_at
CREATE TRIGGER update_ai_user_profiles_updated_at
  BEFORE UPDATE ON public.ai_user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_knowledge_memory_updated_at
  BEFORE UPDATE ON public.ai_knowledge_memory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_personality_memory_updated_at
  BEFORE UPDATE ON public.ai_personality_memory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();