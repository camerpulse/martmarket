import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Rocket, 
  GitBranch, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play,
  Pause,
  RotateCcw,
  Settings,
  Activity,
  FileText,
  AlertTriangle,
  Zap,
  Code,
  Database,
  Server
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeploymentPipeline {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'paused';
  steps: DeploymentStep[];
  lastRun: Date | null;
  nextScheduled: Date | null;
  autoTrigger: boolean;
  environment: 'development' | 'staging' | 'production';
}

interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration: number; // in milliseconds
  logs: string[];
  startTime?: Date;
  endTime?: Date;
}

interface DeploymentHistory {
  id: string;
  pipelineId: string;
  version: string;
  status: 'success' | 'failed' | 'rollback';
  deployedAt: Date;
  deployedBy: string;
  changes: string[];
  performance: {
    buildTime: number;
    testTime: number;
    deployTime: number;
  };
}

export function AutoDeployment() {
  const { toast } = useToast();
  const [pipelines, setPipelines] = useState<DeploymentPipeline[]>([]);
  const [history, setHistory] = useState<DeploymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePipeline, setActivePipeline] = useState<string | null>(null);

  useEffect(() => {
    initializeDeploymentSystem();
    const interval = setInterval(updatePipelineStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const initializeDeploymentSystem = () => {
    // Initialize deployment pipelines
    const initialPipelines: DeploymentPipeline[] = [
      {
        id: 'frontend-prod',
        name: 'Frontend Production',
        status: 'idle',
        environment: 'production',
        autoTrigger: true,
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        nextScheduled: null,
        steps: [
          {
            id: 'lint',
            name: 'Code Linting',
            description: 'Run ESLint and TypeScript checks',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'test',
            name: 'Run Tests',
            description: 'Execute unit and integration tests',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'build',
            name: 'Build Application',
            description: 'Compile and optimize for production',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'security',
            name: 'Security Scan',
            description: 'Vulnerability assessment and dependency check',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'deploy',
            name: 'Deploy to Production',
            description: 'Deploy to production servers',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'verify',
            name: 'Post-Deployment Verification',
            description: 'Health checks and smoke tests',
            status: 'pending',
            duration: 0,
            logs: []
          }
        ]
      },
      {
        id: 'backend-prod',
        name: 'Backend Production',
        status: 'idle',
        environment: 'production',
        autoTrigger: true,
        lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        nextScheduled: null,
        steps: [
          {
            id: 'validate',
            name: 'Schema Validation',
            description: 'Validate database schema changes',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'migrate',
            name: 'Database Migration',
            description: 'Apply database migrations',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'functions',
            name: 'Deploy Edge Functions',
            description: 'Update serverless functions',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'policies',
            name: 'Update RLS Policies',
            description: 'Apply security policy changes',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'rollback-ready',
            name: 'Prepare Rollback',
            description: 'Create rollback checkpoint',
            status: 'pending',
            duration: 0,
            logs: []
          }
        ]
      },
      {
        id: 'ai-systems',
        name: 'AI Systems Update',
        status: 'idle',
        environment: 'production',
        autoTrigger: false,
        lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        nextScheduled: null,
        steps: [
          {
            id: 'ai-validate',
            name: 'AI Model Validation',
            description: 'Validate AI model integrity and performance',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'ai-deploy',
            name: 'Deploy AI Updates',
            description: 'Update Heavenly Fire AI components',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'ai-test',
            name: 'AI System Tests',
            description: 'Comprehensive AI functionality testing',
            status: 'pending',
            duration: 0,
            logs: []
          }
        ]
      }
    ];

    // Initialize deployment history
    const initialHistory: DeploymentHistory[] = [
      {
        id: '1',
        pipelineId: 'frontend-prod',
        version: 'v2.1.4',
        status: 'success',
        deployedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        deployedBy: 'Heavenly Fire AI',
        changes: [
          'Enhanced AI chat interface',
          'Improved security monitoring',
          'Performance optimizations'
        ],
        performance: {
          buildTime: 45000,
          testTime: 23000,
          deployTime: 12000
        }
      },
      {
        id: '2',
        pipelineId: 'backend-prod',
        version: 'v1.8.2',
        status: 'success',
        deployedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        deployedBy: 'Autonomous System',
        changes: [
          'New edge functions for AI processing',
          'Database schema updates',
          'Enhanced RLS policies'
        ],
        performance: {
          buildTime: 0,
          testTime: 15000,
          deployTime: 8000
        }
      }
    ];

    setPipelines(initialPipelines);
    setHistory(initialHistory);
    setLoading(false);
  };

  const updatePipelineStatus = () => {
    // Simulate real-time pipeline updates
    if (activePipeline) {
      setPipelines(prev => prev.map(pipeline => {
        if (pipeline.id === activePipeline && pipeline.status === 'running') {
          const updatedSteps = [...pipeline.steps];
          const runningStepIndex = updatedSteps.findIndex(step => step.status === 'running');
          const nextStepIndex = updatedSteps.findIndex(step => step.status === 'pending');
          
          if (runningStepIndex !== -1) {
            // Complete current step
            if (Math.random() > 0.7) { // 30% chance to complete each update
              updatedSteps[runningStepIndex] = {
                ...updatedSteps[runningStepIndex],
                status: 'success',
                duration: Date.now() - (updatedSteps[runningStepIndex].startTime?.getTime() || Date.now()),
                endTime: new Date(),
                logs: [...updatedSteps[runningStepIndex].logs, `✅ Step completed successfully`]
              };

              // Start next step
              if (nextStepIndex !== -1) {
                updatedSteps[nextStepIndex] = {
                  ...updatedSteps[nextStepIndex],
                  status: 'running' as const,
                  startTime: new Date(),
                  logs: [`🚀 Starting ${updatedSteps[nextStepIndex].name}...`]
                };
              }
            } else {
              // Add progress logs
              updatedSteps[runningStepIndex] = {
                ...updatedSteps[runningStepIndex],
                logs: [...updatedSteps[runningStepIndex].logs, `⏳ Processing ${updatedSteps[runningStepIndex].name}...`]
              };
            }
          }

          // Check if all steps are complete
          const allComplete = updatedSteps.every(step => step.status === 'success');
          if (allComplete) {
            setActivePipeline(null);
            return {
              ...pipeline,
              status: 'success' as const,
              steps: updatedSteps,
              lastRun: new Date()
            };
          }

          return {
            ...pipeline,
            steps: updatedSteps
          };
        }
        return pipeline;
      }));
    }
  };

  const startPipeline = async (pipelineId: string) => {
    try {
      setActivePipeline(pipelineId);
      
      setPipelines(prev => prev.map(pipeline => {
        if (pipeline.id === pipelineId) {
          const updatedSteps = pipeline.steps.map(step => ({
            ...step,
            status: 'pending' as const,
            logs: [],
            duration: 0,
            startTime: undefined,
            endTime: undefined
          }));

          // Start first step
          if (updatedSteps.length > 0) {
            updatedSteps[0] = {
              ...updatedSteps[0],
              status: 'running' as const,
              startTime: new Date(),
              logs: [`🚀 Starting ${updatedSteps[0].name}...`]
            };
          }

          return {
            ...pipeline,
            status: 'running' as const,
            steps: updatedSteps
          };
        }
        return pipeline;
      }));

      // Trigger actual deployment through AI system
      await supabase.functions.invoke('autonomous-decision-engine', {
        body: { 
          action: 'trigger_deployment',
          data: { 
            pipeline_id: pipelineId,
            auto_deploy: true
          }
        }
      });

      toast({
        title: "Deployment Started",
        description: `${pipelineId} pipeline is now running`,
      });

    } catch (error) {
      console.error('Error starting pipeline:', error);
      toast({
        title: "Deployment Failed",
        description: "Failed to start deployment pipeline",
        variant: "destructive",
      });
    }
  };

  const pausePipeline = (pipelineId: string) => {
    setPipelines(prev => prev.map(pipeline => 
      pipeline.id === pipelineId 
        ? { ...pipeline, status: 'paused' as const }
        : pipeline
    ));
    setActivePipeline(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'lint': case 'validate': return <Code className="h-4 w-4" />;
      case 'test': case 'ai-test': return <CheckCircle className="h-4 w-4" />;
      case 'build': return <Settings className="h-4 w-4" />;
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      case 'deploy': case 'ai-deploy': return <Rocket className="h-4 w-4" />;
      case 'migrate': return <Database className="h-4 w-4" />;
      case 'functions': return <Zap className="h-4 w-4" />;
      case 'verify': return <Activity className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-red-100 text-red-800';
      case 'staging': return 'bg-yellow-100 text-yellow-800';
      case 'development': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Rocket className="h-8 w-8 mx-auto mb-4 animate-pulse text-primary" />
          <p>Initializing deployment system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deployment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelines.filter(p => p.status === 'running').length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">  
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.7%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Deploy Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2m</div>
            <p className="text-xs text-muted-foreground">End to end</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Auto Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelines.filter(p => p.autoTrigger).length}</div>
            <p className="text-xs text-muted-foreground">Enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Pipelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Deployment Pipelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {pipelines.map((pipeline) => (
              <div key={pipeline.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(pipeline.status)}
                      <h3 className="font-semibold">{pipeline.name}</h3>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={getEnvironmentColor(pipeline.environment)}
                    >
                      {pipeline.environment}
                    </Badge>
                    {pipeline.autoTrigger && (
                      <Badge variant="outline">Auto-Deploy</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {pipeline.lastRun && (
                      <span className="text-sm text-muted-foreground">
                        Last: {pipeline.lastRun.toLocaleTimeString()}
                      </span>
                    )}
                    {pipeline.status === 'idle' && (
                      <Button size="sm" onClick={() => startPipeline(pipeline.id)}>
                        <Play className="h-4 w-4 mr-1" />
                        Deploy
                      </Button>
                    )}
                    {pipeline.status === 'running' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => pausePipeline(pipeline.id)}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    )}
                  </div>
                </div>

                {/* Pipeline Steps */}
                <div className="space-y-3">
                  {pipeline.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-48">
                        {getStepIcon(step.id)}
                        <span className="text-sm font-medium">{step.name}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(step.status)}
                          <span className="text-sm text-muted-foreground">
                            {step.description}
                          </span>
                          {step.duration > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {(step.duration / 1000).toFixed(1)}s
                            </Badge>
                          )}
                        </div>
                        
                        {step.status === 'running' && (
                          <Progress value={Math.random() * 100} className="mt-2 h-1" />
                        )}
                        
                        {step.logs.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {step.logs[step.logs.length - 1]}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Recent Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.map((deployment) => (
              <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(deployment.status)}
                  <div>
                    <div className="font-medium">{deployment.version}</div>
                    <div className="text-sm text-muted-foreground">
                      by {deployment.deployedBy} • {deployment.deployedAt.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {((deployment.performance.buildTime + deployment.performance.testTime + deployment.performance.deployTime) / 1000).toFixed(1)}s
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {deployment.changes.length} changes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}