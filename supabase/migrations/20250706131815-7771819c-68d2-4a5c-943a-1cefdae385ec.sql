-- Create comprehensive security system for OpesMarket
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'login_attempt', 'suspicious_activity', 'mfa_challenge', 'password_change', 'pgp_verification'
  event_level TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
  ip_address INET,
  user_agent TEXT,
  location_data JSONB, -- geolocation info
  event_data JSONB, -- specific event details
  threat_score FLOAT DEFAULT 0.0, -- AI-calculated threat score
  blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET NOT NULL,
  user_agent TEXT,
  location_data JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.mfa_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  totp_secret TEXT, -- for authenticator apps
  backup_codes TEXT[], -- emergency backup codes
  pgp_public_key TEXT,
  pgp_fingerprint TEXT,
  sms_phone TEXT, -- encrypted phone for SMS 2FA
  is_totp_enabled BOOLEAN DEFAULT FALSE,
  is_sms_enabled BOOLEAN DEFAULT FALSE,
  is_pgp_enabled BOOLEAN DEFAULT FALSE,
  last_totp_verify TIMESTAMP WITH TIME ZONE,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.security_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  require_mfa_for_login BOOLEAN DEFAULT FALSE,
  require_mfa_for_transactions BOOLEAN DEFAULT TRUE,
  auto_logout_minutes INTEGER DEFAULT 60,
  allowed_ip_ranges INET[],
  blocked_countries TEXT[],
  email_on_login BOOLEAN DEFAULT TRUE,
  email_on_suspicious BOOLEAN DEFAULT TRUE,
  max_sessions INTEGER DEFAULT 3,
  password_expires_days INTEGER DEFAULT 90,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.fraud_detection_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'velocity', 'pattern', 'geolocation', 'behavioral'
  conditions JSONB NOT NULL, -- rule conditions
  action TEXT NOT NULL DEFAULT 'flag', -- 'flag', 'block', 'require_mfa'
  threat_score FLOAT DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.pgp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  encrypted_content TEXT NOT NULL, -- PGP encrypted message
  message_hash TEXT NOT NULL, -- for integrity verification
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all security tables
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_detection_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pgp_messages ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can view their own security events" ON public.security_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can log security events" ON public.security_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own MFA settings" ON public.mfa_settings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own security settings" ON public.security_settings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "System can access fraud rules" ON public.fraud_detection_rules
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own encrypted messages" ON public.pgp_messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send encrypted messages" ON public.pgp_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_level ON public.security_events(event_level);
CREATE INDEX idx_security_events_created ON public.security_events(created_at);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active);
CREATE INDEX idx_pgp_messages_sender ON public.pgp_messages(sender_id);
CREATE INDEX idx_pgp_messages_recipient ON public.pgp_messages(recipient_id);

-- Create triggers for timestamp updates
CREATE TRIGGER update_mfa_settings_updated_at
  BEFORE UPDATE ON public.mfa_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_security_settings_updated_at
  BEFORE UPDATE ON public.security_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default fraud detection rules
INSERT INTO public.fraud_detection_rules (rule_name, rule_type, conditions, action, threat_score) VALUES
('Rapid Login Attempts', 'velocity', '{"max_attempts": 5, "time_window_minutes": 15}', 'block', 8.0),
('Multiple IP Login', 'pattern', '{"different_ips_count": 3, "time_window_hours": 1}', 'require_mfa', 6.0),
('Suspicious Country', 'geolocation', '{"high_risk_countries": ["XX", "YY"]}', 'flag', 4.0),
('Large Transaction Pattern', 'behavioral', '{"transaction_increase_factor": 10, "baseline_days": 30}', 'require_mfa', 7.0),
('New Device Login', 'pattern', '{"new_user_agent": true, "new_ip": true}', 'require_mfa', 5.0);

-- Create function to calculate threat score
CREATE OR REPLACE FUNCTION public.calculate_threat_score(
  user_id UUID,
  event_type TEXT,
  event_data JSONB
) RETURNS FLOAT AS $$
DECLARE
  base_score FLOAT := 0.0;
  recent_events INTEGER;
  rule_score FLOAT;
BEGIN
  -- Get recent suspicious events count
  SELECT COUNT(*)
  INTO recent_events
  FROM public.security_events
  WHERE user_id = user_id
    AND event_level IN ('warning', 'critical')
    AND created_at > NOW() - INTERVAL '24 hours';

  -- Base score from recent activity
  base_score := LEAST(recent_events * 1.5, 10.0);

  -- Add score based on matching fraud rules
  SELECT COALESCE(MAX(threat_score), 0.0)
  INTO rule_score
  FROM public.fraud_detection_rules
  WHERE is_active = TRUE
    AND rule_type = event_type;

  RETURN LEAST(base_score + rule_score, 10.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user requires MFA
CREATE OR REPLACE FUNCTION public.requires_mfa_check(
  user_id UUID,
  action_type TEXT DEFAULT 'login'
) RETURNS BOOLEAN AS $$
DECLARE
  mfa_required BOOLEAN := FALSE;
  user_settings RECORD;
  recent_threat_score FLOAT;
BEGIN
  -- Get user security settings
  SELECT * INTO user_settings
  FROM public.security_settings
  WHERE user_id = user_id;

  -- Check recent threat activity
  SELECT COALESCE(AVG(threat_score), 0.0)
  INTO recent_threat_score
  FROM public.security_events
  WHERE user_id = user_id
    AND created_at > NOW() - INTERVAL '1 hour';

  -- Determine MFA requirement
  IF action_type = 'login' THEN
    mfa_required := COALESCE(user_settings.require_mfa_for_login, FALSE);
  ELSIF action_type = 'transaction' THEN
    mfa_required := COALESCE(user_settings.require_mfa_for_transactions, TRUE);
  END IF;

  -- Force MFA if high threat score
  IF recent_threat_score > 5.0 THEN
    mfa_required := TRUE;
  END IF;

  RETURN mfa_required;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;