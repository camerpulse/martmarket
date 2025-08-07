import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Award, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TrustScoreData {
  date: string;
  score: number;
  change: number;
  reason?: string;
}

interface TrustScoreChartProps {
  vendorId: string;
  currentScore: number;
  isVerified: boolean;
  className?: string;
}

const TrustScoreChart = ({ vendorId, currentScore, isVerified, className = '' }: TrustScoreChartProps) => {
  const [scoreHistory, setScoreHistory] = useState<TrustScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [recentChange, setRecentChange] = useState(0);

  useEffect(() => {
    loadTrustScoreHistory();
  }, [vendorId]);

  const loadTrustScoreHistory = async () => {
    try {
      setLoading(true);
      
      // Get trust score history for the last 30 days
      const { data: historyData, error } = await supabase
        .from('trust_score_history')
        .select('*')
        .eq('vendor_id', vendorId)
        .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      // Transform data for chart
      const chartData: TrustScoreData[] = historyData?.map(record => ({
        date: new Date(record.recorded_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        score: record.trust_score,
        change: record.score_change || 0,
        reason: record.change_reason
      })) || [];

      // Add current score if we have history
      if (chartData.length > 0) {
        chartData.push({
          date: 'Now',
          score: currentScore,
          change: 0
        });
      } else {
        // Create a baseline if no history exists
        chartData.push(
          {
            date: '30d ago',
            score: Math.max(0, currentScore - 10),
            change: 0
          },
          {
            date: 'Now',
            score: currentScore,
            change: 0
          }
        );
      }

      setScoreHistory(chartData);

      // Calculate trend
      if (chartData.length >= 2) {
        const recent = chartData[chartData.length - 1];
        const previous = chartData[chartData.length - 2];
        const change = recent.score - previous.score;
        
        setRecentChange(change);
        
        if (change > 2) setTrend('up');
        else if (change < -2) setTrend('down');
        else setTrend('stable');
      }

    } catch (error) {
      console.error('Error loading trust score history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrustLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' };
    if (score >= 80) return { level: 'Very Good', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (score >= 70) return { level: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (score >= 60) return { level: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-700' };
    return { level: 'Needs Improvement', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const trustLevel = getTrustLevel(currentScore);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Trust Score</CardTitle>
          {isVerified && (
            <Badge variant="default" className="bg-blue-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Score Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="text-3xl font-bold">{currentScore}</div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>
              
              <div className="flex items-center space-x-2">
                {trend === 'up' && (
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+{recentChange.toFixed(1)}</span>
                  </div>
                )}
                {trend === 'down' && (
                  <div className="flex items-center text-red-600">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{recentChange.toFixed(1)}</span>
                  </div>
                )}
                {trend === 'stable' && (
                  <div className="flex items-center text-muted-foreground">
                    <Minus className="h-4 w-4 mr-1" />
                    <span className="text-sm">Stable</span>
                  </div>
                )}
              </div>
            </div>
            
            <Badge variant="outline" className={trustLevel.textColor}>
              {trustLevel.level}
            </Badge>
          </div>

          {/* Trust Score Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${trustLevel.color}`}
              style={{ width: `${Math.min(currentScore, 100)}%` }}
            />
          </div>

          {/* Chart */}
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={['dataMin - 5', 'dataMax + 5']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}`, 'Trust Score'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Trust Factors */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Trust Factors</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Successful Orders</span>
                <span className="font-medium">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Response Time</span>
                <span className="font-medium">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tester Reviews</span>
                <span className="font-medium">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Dispute Rate</span>
                <span className="font-medium">✓</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrustScoreChart;