-- Enable pg_cron and pg_net extensions for scheduled AI operations
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule autonomous AI learning every 6 hours
SELECT cron.schedule(
  'ai-autonomous-learning',
  '0 */6 * * *', -- Every 6 hours
  $$
  SELECT
    net.http_post(
        url:='https://rkdhsqndcvwbglbtrgbz.supabase.co/functions/v1/ai-web-intelligence',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZGhzcW5kY3Z3YmdsYnRyZ2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjIwMDEsImV4cCI6MjA2NzMzODAwMX0.jqO2_cen3Mbs-eOs_AHq6Yr-hCRSQwFcI9qAmp5hcG8"}'::jsonb,
        body:='{"action": "collect_intelligence"}'::jsonb
    ) as intelligence_request_id;
  $$
);

-- Schedule autonomous optimization every 2 hours
SELECT cron.schedule(
  'ai-autonomous-optimization',
  '0 */2 * * *', -- Every 2 hours
  $$
  SELECT
    net.http_post(
        url:='https://rkdhsqndcvwbglbtrgbz.supabase.co/functions/v1/ai-autonomous-optimizer',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZGhzcW5kY3Z3YmdsYnRyZ2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjIwMDEsImV4cCI6MjA2NzMzODAwMX0.jqO2_cen3Mbs-eOs_AHq6Yr-hCRSQwFcI9qAmp5hcG8"}'::jsonb,
        body:='{"action": "optimize_autonomously", "target_type": "all"}'::jsonb
    ) as optimization_request_id;
  $$
);

-- Schedule daily deep learning and model evolution
SELECT cron.schedule(
  'ai-daily-evolution',
  '0 3 * * *', -- Daily at 3 AM
  $$
  SELECT
    net.http_post(
        url:='https://rkdhsqndcvwbglbtrgbz.supabase.co/functions/v1/ai-autonomous-optimizer',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZGhzcW5kY3Z3YmdsYnRyZ2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjIwMDEsImV4cCI6MjA2NzMzODAwMX0.jqO2_cen3Mbs-eOs_AHq6Yr-hCRSQwFcI9qAmp5hcG8"}'::jsonb,
        body:='{"action": "deep_learning_session", "evolution_check": true}'::jsonb
    ) as evolution_request_id;
  $$
);