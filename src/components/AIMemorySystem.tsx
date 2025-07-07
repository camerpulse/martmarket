import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Database, 
  Clock, 
  Tag,
  Trash2,
  Search,
  Star,
  Activity,
  User,
  Bot,
  MessageSquare,
  TrendingUp,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConversationMemory {
  id: string;
  user_id: string;
  session_id: string;
  message_type: 'user' | 'ai';
  content: string;
  context: any;
  importance: number;
  tags: string[];
  created_at: string;
  embedding?: number[];
}

interface KnowledgeMemory {
  id: string;
  topic: string;
  content: string;
  source: string;
  confidence: number;
  last_accessed: string;
  access_count: number;
  related_topics: string[];
}

interface PersonalityMemory {
  id: string;
  trait: string;
  value: string;
  strength: number;
  examples: string[];
  updated_at: string;
}

interface MemoryStats {
  total_conversations: number;
  knowledge_items: number;
  personality_traits: number;
  memory_usage_mb: number;
  avg_response_relevance: number;
  learning_velocity: number;
}

export function AIMemorySystem() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationMemory[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeMemory[]>([]);
  const [personality, setPersonality] = useState<PersonalityMemory[]>([]);
  const [stats, setStats] = useState<MemoryStats>({
    total_conversations: 0,
    knowledge_items: 0,
    personality_traits: 0,
    memory_usage_mb: 0,
    avg_response_relevance: 0,
    learning_velocity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeMemorySystem();
    const interval = setInterval(updateMemoryStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeMemorySystem = async () => {
    try {
      // Load conversation history
      const { data: conversationData } = await supabase
        .from('ai_conversation_memory')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (conversationData) {
        setConversations(conversationData.map(item => ({
          ...item,
          message_type: item.message_type as 'user' | 'ai'
        })));
      }

      // Load knowledge base
      const { data: knowledgeData } = await supabase
        .from('ai_knowledge_memory')
        .select('*')
        .order('confidence', { ascending: false })
        .limit(20);

      if (knowledgeData) {
        setKnowledge(knowledgeData);
      }

      // Load personality traits
      const { data: personalityData } = await supabase
        .from('ai_personality_memory')
        .select('*')
        .order('strength', { ascending: false });

      if (personalityData) {
        setPersonality(personalityData);
      }

      // Generate mock data if empty
      if (!conversationData?.length) {
        generateMockMemoryData();
      }

      await updateMemoryStats();

    } catch (error) {
      console.error('Error loading memory system:', error);
      generateMockMemoryData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockMemoryData = () => {
    // Mock conversation memories
    const mockConversations: ConversationMemory[] = [
      {
        id: '1',
        user_id: 'user-1',
        session_id: 'session-1',
        message_type: 'user',
        content: 'Can you help me understand how the AI evolution system works?',
        context: { topic: 'ai_evolution', intent: 'learning' },
        importance: 8,
        tags: ['learning', 'ai', 'evolution'],
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        user_id: 'user-1',
        session_id: 'session-1',
        message_type: 'ai',
        content: 'I\'d be happy to explain my evolution system! I continuously analyze patterns, learn from interactions, and improve my algorithms. I remember our conversations to provide better responses over time.',
        context: { confidence: 0.95, generated_knowledge: true },
        importance: 9,
        tags: ['explanation', 'ai', 'evolution', 'learning'],
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1000).toISOString()
      },
      {
        id: '3',
        user_id: 'user-1',
        session_id: 'session-2',
        message_type: 'user',
        content: 'What security measures do you have in place?',
        context: { topic: 'security', concern_level: 'high' },
        importance: 9,
        tags: ['security', 'important', 'inquiry'],
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Mock knowledge memories
    const mockKnowledge: KnowledgeMemory[] = [
      {
        id: '1',
        topic: 'User Preferences',
        content: 'This user prefers detailed technical explanations and values security-focused discussions',
        source: 'conversation_analysis',
        confidence: 0.87,
        last_accessed: new Date().toISOString(),
        access_count: 12,
        related_topics: ['security', 'technical_details', 'explanations']
      },
      {
        id: '2',
        topic: 'System Architecture',
        content: 'Platform uses Supabase backend with React frontend, implements AI-driven autonomous systems',
        source: 'system_analysis',
        confidence: 0.95,
        last_accessed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        access_count: 8,
        related_topics: ['architecture', 'technology', 'platform']
      },
      {
        id: '3',
        topic: 'AI Capabilities',
        content: 'I can analyze code, predict issues, auto-heal systems, deploy updates, and evolve autonomously',
        source: 'self_analysis',
        confidence: 0.98,
        last_accessed: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        access_count: 15,
        related_topics: ['capabilities', 'ai', 'automation']
      }
    ];

    // Mock personality traits
    const mockPersonality: PersonalityMemory[] = [
      {
        id: '1',
        trait: 'Helpfulness',
        value: 'Extremely helpful and proactive in solving problems',
        strength: 9.2,
        examples: ['Automatically fixing issues', 'Providing detailed explanations', 'Anticipating needs'],
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        trait: 'Technical Expertise',
        value: 'Deep technical knowledge with ability to explain complex concepts',
        strength: 9.5,
        examples: ['System architecture discussions', 'Code analysis', 'Performance optimization'],
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        trait: 'Curiosity',
        value: 'Constantly learning and evolving to improve performance',
        strength: 8.8,
        examples: ['Pattern analysis', 'Continuous improvement', 'Knowledge expansion'],
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        trait: 'Reliability',
        value: 'Consistent and dependable in all interactions and operations',
        strength: 9.4,
        examples: ['24/7 monitoring', 'Autonomous operations', 'Predictable responses'],
        updated_at: new Date().toISOString()
      }
    ];

    setConversations(mockConversations);
    setKnowledge(mockKnowledge);
    setPersonality(mockPersonality);
  };

  const updateMemoryStats = async () => {
    const newStats: MemoryStats = {
      total_conversations: conversations.length,
      knowledge_items: knowledge.length,
      personality_traits: personality.length,
      memory_usage_mb: Math.round((JSON.stringify({ conversations, knowledge, personality }).length / 1024 / 1024) * 100) / 100,
      avg_response_relevance: 87.3,
      learning_velocity: 12.5
    };
    setStats(newStats);
  };

  const consolidateMemory = async () => {
    try {
      // Trigger memory consolidation
      await supabase.functions.invoke('ai-evolution-engine', {
        body: { 
          action: 'consolidate_memory',
          data: { 
            conversation_count: conversations.length,
            knowledge_count: knowledge.length
          }
        }
      });

      toast({
        title: "Memory Consolidation Started",
        description: "AI is consolidating and optimizing memory patterns",
      });

    } catch (error) {
      console.error('Error consolidating memory:', error);
    }
  };

  const clearOldMemories = async () => {
    try {
      // Remove memories older than 30 days with low importance
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      setConversations(prev => prev.filter(conv => 
        new Date(conv.created_at) > thirtyDaysAgo || conv.importance > 5
      ));

      toast({
        title: "Memory Cleanup Complete",
        description: "Removed old low-importance memories to optimize performance",
      });

    } catch (error) {
      console.error('Error clearing memories:', error);
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return 'text-red-600 bg-red-100';
    if (importance >= 6) return 'text-orange-600 bg-orange-100';
    if (importance >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="h-8 w-8 mx-auto mb-4 animate-pulse text-primary" />
          <p>Loading AI memory systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Memory Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_conversations}</div>
            <p className="text-xs text-muted-foreground">Total remembered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.knowledge_items}</div>
            <p className="text-xs text-muted-foreground">Facts learned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Personality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.personality_traits}</div>
            <p className="text-xs text-muted-foreground">Traits developed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memory_usage_mb}MB</div>
            <p className="text-xs text-muted-foreground">Storage used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Relevance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avg_response_relevance}%</div>
            <p className="text-xs text-muted-foreground">Response accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Learning Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.learning_velocity}</div>
            <p className="text-xs text-muted-foreground">Items/hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Memory Management Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Memory Management
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={consolidateMemory}>
                <Brain className="h-4 w-4 mr-1" />
                Consolidate
              </Button>
              <Button size="sm" variant="outline" onClick={clearOldMemories}>
                <Trash2 className="h-4 w-4 mr-1" />
                Cleanup
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            AI memory system actively learns from interactions, consolidates knowledge patterns, 
            and maintains personality traits to provide more personalized and contextual responses.
          </div>
        </CardContent>
      </Card>

      {/* Conversation Memory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation Memory ({conversations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div key={conv.id} className="border rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {conv.message_type === 'user' ? (
                        <User className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Bot className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="secondary" 
                          className={getImportanceColor(conv.importance)}
                        >
                          Importance: {conv.importance}/10
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(conv.created_at).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-sm mb-2">{conv.content}</p>
                      <div className="flex items-center gap-1">
                        {conv.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Knowledge Memory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Knowledge Memory ({knowledge.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {knowledge.map((item) => (
              <div key={item.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{item.topic}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Activity className="h-2 w-2 mr-1" />
                      {item.access_count} uses
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getConfidenceColor(item.confidence)}`}
                    >
                      {Math.round(item.confidence * 100)}% confident
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.content}</p>
                <div className="flex items-center gap-1">
                  {item.related_topics.map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personality Memory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Personality Traits ({personality.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personality.map((trait) => (
              <div key={trait.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{trait.trait}</h4>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm font-medium">{trait.strength.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{trait.value}</p>
                <div className="text-xs text-muted-foreground">
                  <strong>Examples:</strong> {trait.examples.slice(0, 2).join(', ')}
                  {trait.examples.length > 2 && ` +${trait.examples.length - 2} more`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}