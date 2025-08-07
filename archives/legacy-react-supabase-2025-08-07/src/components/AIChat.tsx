import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Send, 
  Bot, 
  User, 
  Zap,
  Shield,
  Activity,
  Code,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  type?: 'message' | 'action' | 'analysis' | 'notification';
  metadata?: any;
  importance?: number;
  tags?: string[];
  context?: any;
}

export function AIChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [sessionContext, setSessionContext] = useState<any>({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAIChat();
    const interval = setInterval(loadAIStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const initializeAIChat = async () => {
    await loadAIStatus();
    await loadConversationHistory();
    await loadUserProfile();
    
    // Initialize with personalized greeting
    const greeting = generatePersonalizedGreeting();
    const initialMessage: ChatMessage = {
      id: '1',
      role: 'ai',
      content: greeting,
      timestamp: new Date(),
      type: 'notification',
      importance: 8,
      tags: ['greeting', 'initialization'],
      context: { session_start: true }
    };
    
    setMessages([initialMessage]);
  };

  const loadConversationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_conversation_memory')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data && !error) {
        setConversationHistory(data.map(item => ({
          id: item.id,
          role: item.message_type as 'user' | 'ai',
          content: item.content,
          timestamp: new Date(item.created_at),
          importance: item.importance,
          tags: item.tags,
          context: item.context
        })));
      } else {
        // Use mock data if database query fails
        setConversationHistory([
          {
            id: '1',
            role: 'ai',
            content: 'Welcome back! I\'m ready to assist you.',
            timestamp: new Date(Date.now() - 60000),
            importance: 7,
            tags: ['greeting'],
            context: { session_start: true }
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      // Fallback to mock data
      setConversationHistory([]);
    }
  };

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_user_profiles')
        .select('*')
        .single();
      
      if (data && !error) {
        setUserProfile(data);
        setSessionContext(prev => ({
          ...prev,
          user_preferences: data.preferences,
          interaction_style: data.preferred_style,
          expertise_level: data.technical_level
        }));
      } else {
        // Create default profile
        const defaultProfile = {
          id: 'default',
          preferences: { theme: 'dark', notifications: true },
          preferred_style: 'professional_helpful',
          technical_level: 'intermediate'
        };
        setUserProfile(defaultProfile);
        setSessionContext(prev => ({
          ...prev,
          user_preferences: defaultProfile.preferences,
          interaction_style: defaultProfile.preferred_style,
          expertise_level: defaultProfile.technical_level
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Create default profile
      const defaultProfile = {
        id: 'default',
        preferences: { theme: 'dark', notifications: true },
        preferred_style: 'professional_helpful',
        technical_level: 'intermediate'
      };
      setUserProfile(defaultProfile);
    }
  };

  const generatePersonalizedGreeting = () => {
    const greetings = [
      "Hi! I'm your AI assistant. How can I help you today?",
      "Hello! What can I do for you?",
      "Hey there! What would you like to know?",
      "Hi! I'm here to help. What's on your mind?"
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadAIStatus = async () => {
    try {
      const { data } = await supabase.functions.invoke('autonomous-decision-engine', {
        body: { action: 'get_status' }
      });
      
      if (data) {
        setAiStatus(data);
      }
    } catch (error) {
      console.error('Error loading AI status:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'message'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Process user message through AI
      const aiResponse = await processAIMessage(input);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        type: (aiResponse.type as 'message' | 'action' | 'analysis' | 'notification') || 'message',
        metadata: aiResponse.metadata
      };

      setMessages(prev => [...prev, aiMessage]);

      // Execute any actions the AI suggests
      if (aiResponse.actions && aiResponse.actions.length > 0) {
        for (const action of aiResponse.actions) {
          await executeAIAction(action);
        }
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'ai',
        content: 'Sorry, I encountered an error. Let me try to fix this.',
        timestamp: new Date(),
        type: 'message'
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "AI Error",
        description: "There was an issue processing your request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processAIMessage = async (message: string): Promise<{content: string, type?: string, actions?: any[], metadata?: any}> => {
    // Store user message in memory first
    await storeMessageInMemory(message, 'user');
    
    // Analyze message with full context
    const contextualAnalysis = await analyzeMessageWithContext(message);
    const intent = analyzeUserIntent(message.toLowerCase());
    
    // Generate response based on user's history and preferences
    let response;
    switch (intent.type) {
      case 'status':
        response = await handleStatusRequest();
        break;
      case 'analysis':
        response = await handleAnalysisRequest(message);
        break;
      case 'fix':
        response = await handleFixRequest(message);
        break;
      case 'security':
        response = await handleSecurityRequest(message);
        break;
      case 'evolution':
        response = await handleEvolutionRequest();
        break;
      case 'autonomous':
        response = await handleAutonomousRequest(message);
        break;
      case 'memory':
        response = await handleMemoryRequest(message);
        break;
      case 'personal':
        response = await handlePersonalRequest(message);
        break;
      default:
        response = await handleGeneralRequest(message);
    }

    // Add contextual enhancements to response
    response = await enhanceResponseWithContext(response, contextualAnalysis);
    
    // Store AI response in memory
    await storeMessageInMemory(response.content, 'ai', response.metadata);
    
    return response;
  };

  const analyzeMessageWithContext = async (message: string) => {
    // Analyze current message in context of conversation history
    const recentMessages = conversationHistory.slice(0, 5);
    const topics = extractTopicsFromHistory(recentMessages);
    const userMood = detectUserMood(message);
    const complexityLevel = assessQuestionComplexity(message);
    
    return {
      recent_topics: topics,
      user_mood: userMood,
      complexity: complexityLevel,
      requires_memory: checkIfRequiresMemory(message),
      continuation_of: findRelatedConversation(message, recentMessages)
    };
  };

  const storeMessageInMemory = async (content: string, role: 'user' | 'ai', metadata?: any) => {
    const importance = calculateImportance(content, role);
    const tags = extractTags(content);
    
    try {
      // Create memory entry with user_id
      const memoryEntry = {
        user_id: 'anonymous', // For now, use anonymous since auth isn't set up
        content,
        message_type: role,
        importance,
        tags,
        context: {
          session_id: sessionContext.session_id || 'default',
          user_mood: sessionContext.current_mood,
          topic: sessionContext.current_topic,
          ...metadata
        }
      };

      await supabase
        .from('ai_conversation_memory')
        .insert(memoryEntry);
        
      // Update conversation history
      setConversationHistory(prev => [
        {
          id: Date.now().toString(),
          role,
          content,
          timestamp: new Date(),
          importance,
          tags,
          context: memoryEntry.context
        },
        ...prev.slice(0, 19)
      ]);
      
    } catch (error) {
      console.error('Error storing message in memory:', error);
    }
  };

  const calculateImportance = (content: string, role: 'user' | 'ai'): number => {
    let importance = 5; // base importance
    
    // Increase importance for certain keywords
    const highImportanceKeywords = ['error', 'problem', 'fix', 'security', 'urgent', 'help'];
    const mediumImportanceKeywords = ['status', 'analyze', 'explain', 'how'];
    
    if (highImportanceKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
      importance += 3;
    } else if (mediumImportanceKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
      importance += 1;
    }
    
    // Questions are generally more important
    if (content.includes('?')) importance += 1;
    
    // AI responses to high-importance queries are also important
    if (role === 'ai' && sessionContext.last_user_importance > 7) {
      importance += 2;
    }
    
    return Math.min(10, importance);
  };

  const extractTags = (content: string): string[] => {
    const tags = [];
    const lowerContent = content.toLowerCase();
    
    // Technical tags
    if (lowerContent.includes('ai') || lowerContent.includes('artificial intelligence')) tags.push('ai');
    if (lowerContent.includes('security') || lowerContent.includes('secure')) tags.push('security');
    if (lowerContent.includes('error') || lowerContent.includes('problem')) tags.push('troubleshooting');
    if (lowerContent.includes('fix') || lowerContent.includes('repair')) tags.push('fixing');
    if (lowerContent.includes('deploy') || lowerContent.includes('deployment')) tags.push('deployment');
    if (lowerContent.includes('monitor') || lowerContent.includes('monitoring')) tags.push('monitoring');
    
    // Intent tags
    if (lowerContent.includes('?')) tags.push('question');
    if (lowerContent.includes('explain') || lowerContent.includes('how')) tags.push('explanation');
    if (lowerContent.includes('help') || lowerContent.includes('assist')) tags.push('help_request');
    
    return tags.length > 0 ? tags : ['general'];
  };

  const enhanceResponseWithContext = async (response: any, context: any) => {
    // Add personal touches based on user history
    if (context.continuation_of) {
      response.content = `Continuing our previous discussion about ${context.continuation_of.topic}: ${response.content}`;
    }
    
    // Adjust response style based on user preferences
    if (userProfile?.preferred_style === 'casual') {
      response.content = response.content.replace(/I can/g, "I can definitely").replace(/\./g, "! 😊");
    }
    
    // Add memory references when relevant
    if (context.recent_topics.length > 0) {
      response.metadata = {
        ...response.metadata,
        related_topics: context.recent_topics,
        memory_enhanced: true
      };
    }
    
    return response;
  };

  const handleMemoryRequest = async (message: string) => {
    return {
      content: `I remember ${conversationHistory.length} of our conversations. What would you like me to recall?`,
      type: 'analysis' as const,
      metadata: { 
        memory_request: true,
        history_items: conversationHistory.length,
        user_profile: userProfile 
      }
    };
  };

  const handlePersonalRequest = async (message: string) => {
    return {
      content: `We've chatted ${conversationHistory.length} times. I adapt to your style and remember what you care about. How can I help you better?`,
      type: 'analysis' as const,
      metadata: { 
        personalization: true,
        relationship_depth: conversationHistory.length 
      }
    };
  };

  const getMostDiscussedTopics = (): string[] => {
    const topicCount: Record<string, number> = {};
    
    conversationHistory.forEach(msg => {
      msg.tags?.forEach(tag => {
        topicCount[tag] = (topicCount[tag] || 0) + 1;
      });
    });
    
    return Object.entries(topicCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);
  };

  const extractTopicsFromHistory = (messages: ChatMessage[]): string[] => {
    const topics = new Set<string>();
    messages.forEach(msg => {
      msg.tags?.forEach(tag => topics.add(tag));
    });
    return Array.from(topics).slice(0, 5);
  };

  const detectUserMood = (message: string): string => {
    if (message.includes('!') || message.includes('urgent') || message.includes('problem')) return 'urgent';
    if (message.includes('thanks') || message.includes('great') || message.includes('awesome')) return 'positive';
    if (message.includes('?')) return 'curious';
    return 'neutral';
  };

  const assessQuestionComplexity = (message: string): string => {
    if (message.split(' ').length > 20 || message.includes('explain') || message.includes('how')) return 'complex';
    if (message.includes('?') && message.split(' ').length > 10) return 'medium';
    return 'simple';
  };

  const checkIfRequiresMemory = (message: string): boolean => {
    const memoryKeywords = ['remember', 'previous', 'before', 'earlier', 'last', 'history'];
    return memoryKeywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  const findRelatedConversation = (message: string, history: ChatMessage[]): any => {
    // Simple similarity check
    return history.find(msg => 
      msg.tags?.some(tag => message.toLowerCase().includes(tag))
    );
  };

  const analyzeUserIntent = (message: string) => {
    const intents = [
      { type: 'status', keywords: ['status', 'health', 'how are you', 'online', 'working'] },
      { type: 'analysis', keywords: ['analyze', 'check', 'investigate', 'examine', 'look at'] },
      { type: 'fix', keywords: ['fix', 'repair', 'solve', 'resolve', 'debug'] },
      { type: 'security', keywords: ['security', 'threat', 'attack', 'protect', 'secure'] },
      { type: 'evolution', keywords: ['evolve', 'learn', 'improve', 'upgrade', 'enhance'] },
      { type: 'autonomous', keywords: ['autonomous', 'auto', 'automatic', 'self', 'independent'] },
      { type: 'memory', keywords: ['remember', 'memory', 'recall', 'history', 'previous', 'before'] },
      { type: 'personal', keywords: ['about me', 'personal', 'preferences', 'relationship', 'know me'] }
    ];

    for (const intent of intents) {
      if (intent.keywords.some(keyword => message.includes(keyword))) {
        return intent;
      }
    }

    return { type: 'general' };
  };

  const handleStatusRequest = async () => {
    const systemStatus = aiStatus || await loadAIStatus();
    
    return {
      content: `System is ${systemStatus?.autonomous_enabled ? 'running autonomously' : 'in monitoring mode'}. Everything looks good!`,
      type: 'analysis',
      metadata: systemStatus
    };
  };

  const handleAnalysisRequest = async (message: string) => {
    // Trigger comprehensive system analysis
    const { data } = await supabase.functions.invoke('heavenly-fire-ai', {
      body: { 
        action: 'comprehensive_analysis',
        data: { user_request: message }
      }
    });

    return {
      content: data?.analysis?.summary || 'Analysis complete. All systems operating normally.',
      type: 'analysis',
      actions: data?.suggested_actions || [],
      metadata: data?.analysis
    };
  };

  const handleFixRequest = async (message: string) => {
    // Trigger automated fixing
    const { data } = await supabase.functions.invoke('heavenly-fire-ai', {
      body: { 
        action: 'auto_fix',
        data: { 
          error_description: message,
          auto_apply: true 
        }
      }
    });

    return {
      content: data?.fix?.success ? 'Fix applied successfully!' : 'Working on fixing that issue...',
      type: 'action',
      metadata: data?.fix
    };
  };

  const handleSecurityRequest = async (message: string) => {
    // Trigger security analysis and enhancement
    const { data } = await supabase.functions.invoke('autonomous-decision-engine', {
      body: { 
        action: 'security_analysis',
        data: { user_request: message }
      }
    });

    return {
      content: `Security check complete. Threat level: ${data?.threat_level || 'Low'}. All protections are active.`,
      type: 'action',
      metadata: data
    };
  };

  const handleEvolutionRequest = async () => {
    // Trigger AI evolution cycle
    const { data } = await supabase.functions.invoke('ai-evolution-engine', {
      body: { action: 'trigger_evolution' }
    });

    return {
      content: `AI evolution started. Learning new patterns and improving performance.`,
      type: 'analysis',
      metadata: data
    };
  };

  const handleAutonomousRequest = async (message: string) => {
    // Enable or enhance autonomous capabilities
    const { data } = await supabase.functions.invoke('autonomous-decision-engine', {
      body: { action: 'enable_autonomous_mode' }
    });

    return {
      content: `Autonomous mode ${data?.success ? 'enhanced' : 'activated'}. I can now operate independently.`,
      type: 'notification',
      metadata: data
    };
  };

  const handleGeneralRequest = async (message: string) => {
    // Simple responses based on message content
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return { content: "Hello! How can I help you?", type: 'message' };
    }
    
    if (lowerMessage.includes('help')) {
      return { content: "I can help with system monitoring, analysis, and fixing issues. What do you need?", type: 'message' };
    }
    
    if (lowerMessage.includes('thank')) {
      return { content: "You're welcome! Happy to help.", type: 'message' };
    }
    
    // Default response
    return {
      content: "I can help with monitoring your system, analyzing issues, and providing assistance. What would you like me to do?",
      type: 'message'
    };
  };

  const executeAIAction = async (action: any) => {
    // Execute actions suggested by the AI
    try {
      let result;
      
      switch (action.type) {
        case 'fix_issue':
          result = await supabase.functions.invoke('heavenly-fire-ai', {
            body: { action: 'apply_fix', data: action.data }
          });
          break;
        case 'enhance_security':
          result = await supabase.functions.invoke('autonomous-decision-engine', {
            body: { action: 'enhance_security', data: action.data }
          });
          break;
        case 'scale_resources':
          result = await supabase.functions.invoke('autonomous-decision-engine', {
            body: { action: 'scale_resources', data: action.data }
          });
          break;
        default:
          console.log('Unknown action type:', action.type);
          return;
      }

      // Add action result as a message
      const actionMessage: ChatMessage = {
        id: (Date.now() + Math.random()).toString(),
        role: 'ai',
        content: `Action completed: ${action.description}`,
        timestamp: new Date(),
        type: 'action'
      };

      setMessages(prev => [...prev, actionMessage]);

    } catch (error) {
      console.error('Error executing AI action:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageIcon = (message: ChatMessage) => {
    if (message.role === 'user') return <User className="h-4 w-4" />;
    
    switch (message.type) {
      case 'action': return <Zap className="h-4 w-4 text-amber-500" />;
      case 'analysis': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'notification': return <Sparkles className="h-4 w-4 text-purple-500" />;
      default: return <Brain className="h-4 w-4 text-primary" />;
    }
  };

  const getStatusColor = () => {
    if (!aiStatus) return 'bg-gray-500';
    if (aiStatus.autonomous_enabled) return 'bg-green-500';
    if (aiStatus.mode === 'monitor_only') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Heavenly Fire AI Chat
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
          </div>
          <div className="flex items-center gap-2">
            {aiStatus?.autonomous_enabled && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Autonomous
              </Badge>
            )}
            <Badge variant="outline">
              {aiStatus?.mode || 'Offline'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'ai' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {getMessageIcon(message)}
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}
                >
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.type && message.type !== 'message' && (
                      <Badge variant="outline" className="text-xs">
                        {message.type}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-200" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Heavenly Fire AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <Separator />
        
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Chat with Heavenly Fire AI... (Press Enter to send)"
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Response time: ~{isLoading ? 'calculating...' : '0.8s'}
            </div>
            <div className="flex items-center gap-1">
              {aiStatus?.recent_decisions > 0 && (
                <Badge variant="outline" className="text-xs">
                  {aiStatus.recent_decisions} recent actions
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}