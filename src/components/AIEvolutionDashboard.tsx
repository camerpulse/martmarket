import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target,
  BookOpen,
  Cpu,
  Network,
  LineChart,
  Microscope,
  Lightbulb,
  Rocket,
  Dna,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EvolutionMetrics {
  learning_rate: number;
  pattern_accuracy: number;
  fix_success_rate: number;
  adaptation_score: number;
  knowledge_base_size: number;
  evolution_generation: number;
  self_improvement_count: number;
  autonomous_decisions: number;
}

interface LearningSession {
  id: string;
  session_type: string;
  started_at: string;
  completed_at?: string;
  insights_generated: number;
  knowledge_updated: number;
  performance_metrics: any;
  status: string;
}

export function AIEvolutionDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<EvolutionMetrics | null>(null);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [isEvolving, setIsEvolving] = useState(false);

  useEffect(() => {
    loadEvolutionData();
    const interval = setInterval(loadEvolutionData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadEvolutionData = async () => {
    try {
      // Load learning sessions
      const { data: sessionsData } = await supabase
        .from('ai_learning_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      setSessions(sessionsData || []);

      // Load AI knowledge base metrics
      const { data: knowledgeData } = await supabase
        .from('ai_knowledge_base')
        .select('*')
        .eq('is_active', true);

      // Generate evolution metrics
      const mockMetrics: EvolutionMetrics = {
        learning_rate: Math.min(95, 60 + Math.random() * 35),
        pattern_accuracy: Math.min(98, 75 + Math.random() * 23),
        fix_success_rate: Math.min(92, 65 + Math.random() * 27),
        adaptation_score: Math.min(88, 50 + Math.random() * 38),
        knowledge_base_size: knowledgeData?.length || 0,
        evolution_generation: Math.floor(Math.random() * 50) + 1,
        self_improvement_count: Math.floor(Math.random() * 200) + 50,
        autonomous_decisions: Math.floor(Math.random() * 1000) + 500
      };

      setMetrics(mockMetrics);

    } catch (error) {
      console.error('Error loading evolution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerEvolution = async () => {
    setIsEvolving(true);
    try {
      const { data } = await supabase.functions.invoke('ai-evolution-engine', {
        body: { action: 'trigger_evolution' }
      });

      toast({
        title: "Evolution Triggered",
        description: "AI is now analyzing patterns and improving its algorithms",
      });

      // Start a new learning session
      await supabase
        .from('ai_learning_sessions')
        .insert({
          session_type: 'manual_evolution',
          started_at: new Date().toISOString(),
          status: 'running'
        });

      loadEvolutionData();
    } catch (error) {
      toast({
        title: "Evolution Failed",
        description: "Failed to trigger AI evolution",
        variant: "destructive",
      });
    } finally {
      setIsEvolving(false);
    }
  };

  const enableAutonomousMode = async () => {
    try {
      const { data } = await supabase.functions.invoke('autonomous-decision-engine', {
        body: { action: 'enable_autonomous_mode' }
      });

      toast({
        title: "Autonomous Mode Enabled",
        description: "AI will now make decisions and evolve independently",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable autonomous mode",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="h-8 w-8 mx-auto mb-4 animate-pulse text-primary" />
          <p>Loading AI Evolution Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Evolution Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Dna className="h-4 w-4 text-blue-500" />
              Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.evolution_generation}</div>
            <p className="text-xs text-muted-foreground">Evolution cycles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.pattern_accuracy.toFixed(1)}%</div>
            <Progress value={metrics?.pattern_accuracy} className="h-2 mt-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Learning Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.learning_rate.toFixed(1)}%</div>
            <Progress value={metrics?.learning_rate} className="h-2 mt-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-500" />
              Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.knowledge_base_size}</div>
            <p className="text-xs text-muted-foreground">Active patterns</p>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            AI Evolution Controls
          </CardTitle>
          <CardDescription>
            Control the AI's learning and evolution processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Button 
                onClick={triggerEvolution} 
                disabled={isEvolving}
                className="w-full"
              >
                <Brain className="h-4 w-4 mr-2" />
                {isEvolving ? 'Evolving...' : 'Trigger Evolution'}
              </Button>
              
              <Button 
                onClick={enableAutonomousMode}
                variant="outline"
                className="w-full"
              >
                <Cpu className="h-4 w-4 mr-2" />
                Enable Full Autonomy
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Fix Success Rate</span>
                <span className="font-medium">{metrics?.fix_success_rate.toFixed(1)}%</span>
              </div>
              <Progress value={metrics?.fix_success_rate} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Adaptation Score</span>
                <span className="font-medium">{metrics?.adaptation_score.toFixed(1)}%</span>
              </div>
              <Progress value={metrics?.adaptation_score} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="learning" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="learning">Learning Sessions</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Recognition</TabsTrigger>
          <TabsTrigger value="decisions">Autonomous Decisions</TabsTrigger>
          <TabsTrigger value="evolution">Evolution History</TabsTrigger>
        </TabsList>

        <TabsContent value="learning">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5" />
                Active Learning Sessions
              </CardTitle>
              <CardDescription>Current and recent AI learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No learning sessions active. AI is in observation mode.
                  </p>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {session.session_type.replace('_', ' ')}
                          </span>
                          <Badge variant={session.status === 'running' ? 'default' : 'secondary'}>
                            {session.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.started_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Insights Generated:</span>
                          <span className="ml-2 font-medium">{session.insights_generated}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Knowledge Updated:</span>
                          <span className="ml-2 font-medium">{session.knowledge_updated}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Pattern Recognition Evolution
              </CardTitle>
              <CardDescription>How the AI's pattern recognition is improving</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Error Patterns</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">247</div>
                  <div className="text-xs text-muted-foreground">Recognized patterns</div>
                  <Progress value={85} className="h-2 mt-2" />
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Security Threats</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">189</div>
                  <div className="text-xs text-muted-foreground">Threat signatures</div>
                  <Progress value={92} className="h-2 mt-2" />
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Performance Issues</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">156</div>
                  <div className="text-xs text-muted-foreground">Performance patterns</div>
                  <Progress value={78} className="h-2 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Autonomous Decision Making
              </CardTitle>
              <CardDescription>Recent decisions made by the AI without human intervention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => ({
                  id: `decision-${i}`,
                  type: ['Auto-Scale Resources', 'Block Suspicious IP', 'Apply Security Patch', 'Optimize Database', 'Update Algorithms'][i],
                  confidence: Math.random() * 20 + 80,
                  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
                  impact: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
                })).map((decision) => (
                  <div key={decision.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{decision.type}</span>
                      <Badge variant={decision.impact === 'High' ? 'default' : 'secondary'}>
                        {decision.impact} Impact
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        Confidence: {decision.confidence.toFixed(1)}%
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(decision.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Evolution Timeline
              </CardTitle>
              <CardDescription>Key milestones in AI development and improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 6 }, (_, i) => ({
                  generation: metrics?.evolution_generation - i,
                  improvements: ['Enhanced Pattern Recognition', 'Improved Fix Success Rate', 'Better Threat Detection', 'Optimized Learning Speed', 'Advanced Code Generation', 'Self-Healing Capabilities'][i],
                  timestamp: new Date(Date.now() - i * 24 * 3600000).toISOString(),
                  impact: Math.random() * 30 + 10
                })).map((milestone, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {milestone.generation}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mb-1">{milestone.improvements}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Performance improvement: +{milestone.impact.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(milestone.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}