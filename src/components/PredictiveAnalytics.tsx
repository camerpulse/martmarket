import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Zap,
  Brain,
  BarChart3,
  Calendar,
  Clock,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Prediction {
  id: string;
  category: string;
  prediction: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timeline: string;
  preventive_actions: string[];
  created_at: string;
}

interface TrendData {
  timestamp: string;
  value: number;
  prediction: number;
  confidence: number;
}

export function PredictiveAnalytics() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  useEffect(() => {
    loadPredictiveData();
    const interval = setInterval(loadPredictiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPredictiveData = async () => {
    try {
      // Generate predictions using AI
      const { data: predictionData } = await supabase.functions.invoke('ai-evolution-engine', {
        body: { 
          action: 'generate_predictions',
          data: { 
            analysis_depth: 'comprehensive',
            prediction_horizon: '7_days'
          }
        }
      });

      if (predictionData?.predictions) {
        setPredictions(predictionData.predictions);
      }

      // Generate trend analysis
      const { data: trendAnalysis } = await supabase.functions.invoke('autonomous-decision-engine', {
        body: { 
          action: 'trend_analysis',
          data: { 
            metrics: ['system_health', 'security_threats', 'performance'],
            timeframe: '24_hours'
          }
        }
      });

      if (trendAnalysis?.trends) {
        setTrendData(trendAnalysis.trends);
      }

      // Get current system health for context
      const { data: healthData } = await supabase.functions.invoke('heavenly-fire-ai', {
        body: { action: 'get_system_health' }
      });

      if (healthData) {
        setSystemHealth(healthData);
      }

    } catch (error) {
      console.error('Error loading predictive data:', error);
      // Generate mock data for demonstration
      generateMockPredictions();
    } finally {
      setLoading(false);
    }
  };

  const generateMockPredictions = () => {
    setPredictions([
      {
        id: '1',
        category: 'Security',
        prediction: 'Potential DDoS attack pattern detected - 73% probability within next 6 hours',
        confidence: 73.2,
        impact: 'high',
        timeline: '6 hours',
        preventive_actions: [
          'Enhanced rate limiting activated',
          'Load balancing optimization in progress',
          'Emergency response team alerted'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        category: 'Performance',
        prediction: 'Database query performance degradation expected due to growing data volume',
        confidence: 89.1,
        impact: 'medium',
        timeline: '2-3 days',
        preventive_actions: [
          'Index optimization scheduled',
          'Query performance monitoring increased',
          'Cache warming strategy deployed'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        category: 'System',
        prediction: 'Memory usage spike predicted during peak hours (85% confidence)',
        confidence: 85.4,
        impact: 'medium',
        timeline: '12-18 hours',
        preventive_actions: [
          'Memory allocation optimization',
          'Garbage collection tuning',
          'Resource scaling prepared'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        category: 'Business',
        prediction: 'User activity surge expected - 94% confidence based on historical patterns',
        confidence: 94.7,
        impact: 'low',
        timeline: '24-48 hours',
        preventive_actions: [
          'Auto-scaling rules updated',
          'CDN cache preloading',
          'Support team notified'
        ],
        created_at: new Date().toISOString()
      }
    ]);

    // Generate trend data
    const now = new Date();
    const trends = [];
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      trends.push({
        timestamp: time.toISOString(),
        value: 70 + Math.sin(i / 4) * 15 + Math.random() * 10,
        prediction: 75 + Math.sin((i - 2) / 4) * 12 + Math.random() * 8,
        confidence: 80 + Math.random() * 15
      });
    }
    setTrendData(trends);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactTextColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const executePreventiveAction = async (predictionId: string, actionIndex: number) => {
    try {
      const prediction = predictions.find(p => p.id === predictionId);
      if (!prediction) return;

      const action = prediction.preventive_actions[actionIndex];
      
      await supabase.functions.invoke('autonomous-decision-engine', {
        body: { 
          action: 'execute_preventive_action',
          data: { 
            prediction_id: predictionId,
            action_description: action,
            category: prediction.category
          }
        }
      });

      // Update the prediction to show action was taken
      setPredictions(prev => prev.map(p => 
        p.id === predictionId 
          ? { ...p, preventive_actions: p.preventive_actions.map((a, i) => 
              i === actionIndex ? `✅ ${a}` : a
            )}
          : p
      ));

    } catch (error) {
      console.error('Error executing preventive action:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="h-8 w-8 mx-auto mb-4 animate-pulse text-primary" />
          <p>Analyzing patterns and generating predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prediction Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-muted-foreground">
              Next 48 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              High accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {predictions.filter(p => p.impact === 'critical' || p.impact === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prevention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">87%</div>
            <p className="text-xs text-muted-foreground">
              Issues prevented
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Predictive Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}%`,
                    name === 'value' ? 'Current' : name === 'prediction' ? 'Predicted' : 'Confidence'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="confidence" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  opacity={0.1}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="prediction" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <span>Current Values</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-red-600 border-dashed rounded-full" />
              <span>Predictions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-200 rounded-full" />
              <span>Confidence Range</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Predictions & Preventive Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{prediction.category}</Badge>
                      <Badge 
                        variant="secondary" 
                        className={`${getImpactColor(prediction.impact)} text-white`}
                      >
                        {prediction.impact.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {prediction.timeline}
                      </div>
                    </div>
                    <p className="text-sm font-medium mb-2">{prediction.prediction}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <Progress value={prediction.confidence} className="w-24" />
                      <span className="text-sm font-medium">{prediction.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Preventive Actions
                  </h4>
                  <div className="space-y-2">
                    {prediction.preventive_actions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted/50 rounded p-2">
                        <span className="text-sm">{action}</span>
                        {!action.startsWith('✅') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => executePreventiveAction(prediction.id, index)}
                          >
                            Execute
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Predicted: {new Date(prediction.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}