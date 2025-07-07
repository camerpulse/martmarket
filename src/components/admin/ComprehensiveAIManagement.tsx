import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Search, 
  RefreshCw, 
  Download, 
  Eye, 
  Settings,
  Activity,
  Database,
  Cpu,
  Zap,
  BarChart3,
  MessageSquare,
  BookOpen,
  User,
  Trash2,
  Edit,
  Plus,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIKnowledgeEntry {
  id: string;
  topic: string;
  knowledge_type: string;
  content: any;
  confidence_score: number;
  is_active: boolean;
  learned_at: string;
  validation_count: number;
}

interface AIUserProfile {
  id: string;
  user_id: string;
  technical_level: string;
  preferred_style: string;
  preferences: any;
  interaction_history: any;
  updated_at: string;
}

interface AIOptimizationLog {
  id: string;
  action: string;
  model_used: string;
  processing_time: number;
  tokens_used: number;
  user_id: string | null;
  created_at: string;
}

export const ComprehensiveAIManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('knowledge');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Knowledge base state
  const [knowledgeEntries, setKnowledgeEntries] = useState<AIKnowledgeEntry[]>([]);
  const [selectedKnowledge, setSelectedKnowledge] = useState<AIKnowledgeEntry | null>(null);
  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false);

  // AI User profiles state
  const [aiUserProfiles, setAiUserProfiles] = useState<AIUserProfile[]>([]);
  
  // Optimization logs state
  const [optimizationLogs, setOptimizationLogs] = useState<AIOptimizationLog[]>([]);

  // AI Settings state
  const [aiSettings, setAiSettings] = useState<any>({
    ai_mode: 'balanced',
    auto_learning_enabled: true,
    max_tokens_per_request: 4000,
    confidence_threshold: 0.7,
    learning_rate: 0.1,
    memory_retention_days: 30
  });

  useEffect(() => {
    loadAIData();
  }, [activeTab]);

  const loadAIData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'knowledge') {
        await loadKnowledgeBase();
      } else if (activeTab === 'profiles') {
        await loadAIUserProfiles();
      } else if (activeTab === 'logs') {
        await loadOptimizationLogs();
      } else if (activeTab === 'settings') {
        await loadAISettings();
      }
    } catch (error) {
      console.error('Error loading AI data:', error);
      toast({
        title: "Error",
        description: "Failed to load AI data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadKnowledgeBase = async () => {
    const { data, error } = await supabase
      .from('ai_knowledge_base')
      .select('*')
      .order('learned_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    setKnowledgeEntries(data || []);
  };

  const loadAIUserProfiles = async () => {
    const { data, error } = await supabase
      .from('ai_user_profiles')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    setAiUserProfiles(data || []);
  };

  const loadOptimizationLogs = async () => {
    const { data, error } = await supabase
      .from('ai_optimization_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    setOptimizationLogs(data || []);
  };

  const loadAISettings = async () => {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'ai_mode',
        'auto_learning_enabled',
        'max_tokens_per_request',
        'confidence_threshold',
        'learning_rate',
        'memory_retention_days'
      ]);

    if (error) throw error;
    
    const settings = { ...aiSettings };
    data?.forEach(setting => {
      if (setting.setting_key in settings) {
        const value = setting.setting_value;
        if (setting.setting_key === 'auto_learning_enabled') {
          settings[setting.setting_key as keyof typeof settings] = value === 'true';
        } else if (['max_tokens_per_request', 'memory_retention_days'].includes(setting.setting_key)) {
          settings[setting.setting_key as keyof typeof settings] = parseInt(value) as any;
        } else if (['confidence_threshold', 'learning_rate'].includes(setting.setting_key)) {
          settings[setting.setting_key as keyof typeof settings] = parseFloat(value) as any;
        } else {
          settings[setting.setting_key as keyof typeof settings] = value as any;
        }
      }
    });
    setAiSettings(settings);
  };

  const updateAISetting = async (key: string, value: string | boolean | number) => {
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          setting_key: key,
          setting_value: value.toString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "AI setting updated successfully",
      });
    } catch (error) {
      console.error('Error updating AI setting:', error);
      toast({
        title: "Error",
        description: "Failed to update AI setting",
        variant: "destructive",
      });
    }
  };

  const deleteKnowledgeEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Knowledge entry deleted successfully",
      });

      loadKnowledgeBase();
    } catch (error) {
      console.error('Error deleting knowledge entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete knowledge entry",
        variant: "destructive",
      });
    }
  };

  const toggleKnowledgeStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_knowledge_base')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Knowledge entry status updated",
      });

      loadKnowledgeBase();
    } catch (error) {
      console.error('Error updating knowledge status:', error);
      toast({
        title: "Error",
        description: "Failed to update knowledge status",
        variant: "destructive",
      });
    }
  };

  const getConfidenceBadge = (score: number) => {
    let variant: 'secondary' | 'destructive' | 'default' = 'secondary';
    let color = 'text-red-600';
    
    if (score >= 0.8) {
      variant = 'default';
      color = 'text-green-600';
    } else if (score >= 0.6) {
      variant = 'secondary';
      color = 'text-yellow-600';
    }

    return (
      <Badge variant={variant} className={color}>
        {(score * 100).toFixed(1)}%
      </Badge>
    );
  };

  const getAIStats = () => {
    const totalKnowledge = knowledgeEntries.length;
    const activeKnowledge = knowledgeEntries.filter(k => k.is_active).length;
    const highConfidence = knowledgeEntries.filter(k => k.confidence_score >= 0.8).length;
    const totalProfiles = aiUserProfiles.length;
    const totalOptimizations = optimizationLogs.length;
    const avgProcessingTime = optimizationLogs.length > 0 
      ? optimizationLogs.reduce((sum, log) => sum + log.processing_time, 0) / optimizationLogs.length
      : 0;

    return { 
      totalKnowledge, 
      activeKnowledge, 
      highConfidence, 
      totalProfiles, 
      totalOptimizations,
      avgProcessingTime
    };
  };

  const stats = getAIStats();

  const filteredKnowledge = knowledgeEntries.filter(entry =>
    entry.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.knowledge_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProfiles = aiUserProfiles.filter(profile =>
    profile.technical_level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.preferred_style?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = optimizationLogs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.model_used.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Knowledge Base</p>
                <p className="text-2xl font-bold">{stats.totalKnowledge}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Knowledge</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeKnowledge}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Confidence</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.highConfidence}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">User Profiles</p>
                <p className="text-2xl font-bold">{stats.totalProfiles}</p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Optimizations</p>
                <p className="text-2xl font-bold">{stats.totalOptimizations}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Processing</p>
                <p className="text-2xl font-bold">{stats.avgProcessingTime.toFixed(0)}ms</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI System Management
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => loadAIData()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === 'knowledge' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('knowledge')}
            >
              Knowledge Base
            </Button>
            <Button
              variant={activeTab === 'profiles' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('profiles')}
            >
              User Profiles
            </Button>
            <Button
              variant={activeTab === 'logs' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('logs')}
            >
              Optimization Logs
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('settings')}
            >
              AI Settings
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search */}
          {activeTab !== 'settings' && (
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Knowledge Base Tab */}
          {activeTab === 'knowledge' && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Learned</TableHead>
                    <TableHead>Validations</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading knowledge base...
                      </TableCell>
                    </TableRow>
                  ) : filteredKnowledge.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No knowledge entries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredKnowledge.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {entry.topic}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {entry.knowledge_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getConfidenceBadge(entry.confidence_score)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.is_active ? 'default' : 'secondary'}>
                            {entry.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(entry.learned_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {entry.validation_count}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedKnowledge(entry);
                                setKnowledgeDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toggleKnowledgeStatus(entry.id, entry.is_active)}
                            >
                              {entry.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteKnowledgeEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* AI Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Core AI Settings</h3>
                  
                  <div>
                    <Label htmlFor="ai-mode">AI Mode</Label>
                    <Select 
                      value={aiSettings.ai_mode} 
                      onValueChange={(value) => {
                        setAiSettings(prev => ({ ...prev, ai_mode: value }));
                        updateAISetting('ai_mode', value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                        <SelectItem value="off">Off</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-learning">Auto Learning</Label>
                    <Switch
                      id="auto-learning"
                      checked={aiSettings.auto_learning_enabled}
                      onCheckedChange={(checked) => {
                        setAiSettings(prev => ({ ...prev, auto_learning_enabled: checked }));
                        updateAISetting('auto_learning_enabled', checked);
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max-tokens">Max Tokens per Request</Label>
                    <Input
                      id="max-tokens"
                      type="number"
                      value={aiSettings.max_tokens_per_request}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setAiSettings(prev => ({ ...prev, max_tokens_per_request: value }));
                        updateAISetting('max_tokens_per_request', value);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Learning Parameters</h3>
                  
                  <div>
                    <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                    <Input
                      id="confidence-threshold"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={aiSettings.confidence_threshold}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setAiSettings(prev => ({ ...prev, confidence_threshold: value }));
                        updateAISetting('confidence_threshold', value);
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="learning-rate">Learning Rate</Label>
                    <Input
                      id="learning-rate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={aiSettings.learning_rate}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setAiSettings(prev => ({ ...prev, learning_rate: value }));
                        updateAISetting('learning_rate', value);
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="memory-retention">Memory Retention (days)</Label>
                    <Input
                      id="memory-retention"
                      type="number"
                      value={aiSettings.memory_retention_days}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setAiSettings(prev => ({ ...prev, memory_retention_days: value }));
                        updateAISetting('memory_retention_days', value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Details Dialog */}
      <Dialog open={knowledgeDialogOpen} onOpenChange={setKnowledgeDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Knowledge Entry Details</DialogTitle>
          </DialogHeader>
          {selectedKnowledge && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Topic</Label>
                  <p className="font-semibold">{selectedKnowledge.topic}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge variant="outline">{selectedKnowledge.knowledge_type}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Confidence</Label>
                  {getConfidenceBadge(selectedKnowledge.confidence_score)}
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={selectedKnowledge.is_active ? 'default' : 'secondary'}>
                    {selectedKnowledge.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Validations</Label>
                  <p>{selectedKnowledge.validation_count}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Content</Label>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
                  {JSON.stringify(selectedKnowledge.content, null, 2)}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setKnowledgeDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};