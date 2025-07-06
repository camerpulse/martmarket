import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  Users, 
  Pin, 
  Lock, 
  Plus,
  Search,
  Clock,
  Eye,
  Heart,
  Reply,
  CheckCircle,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  post_count: number;
  last_post_at?: string;
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  author_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_anonymous: boolean;
  view_count: number;
  reply_count: number;
  last_reply_at?: string;
  created_at: string;
  profiles?: {
    display_name: string;
  };
}

interface ForumReply {
  id: string;
  content: string;
  author_id: string;
  is_anonymous: boolean;
  is_solution: boolean;
  like_count: number;
  created_at: string;
  profiles?: {
    display_name: string;
  };
}

const Forum = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    is_anonymous: false
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadTopics(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedTopic) {
      loadReplies(selectedTopic.id);
      incrementViewCount(selectedTopic.id);
    }
  }, [selectedTopic]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load forum categories');
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('category_id', categoryId)
        .order('is_pinned', { ascending: false })
        .order('last_reply_at', { ascending: false });

      if (error) throw error;
      
      // Get author info separately
      const topicsWithAuthors = await Promise.all(
        data?.map(async (topic) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', topic.author_id)
            .single();
            
          return {
            ...topic,
            profiles: {
              display_name: profileData?.display_name || 'Unknown User'
            }
          };
        }) || []
      );
      
      setTopics(topicsWithAuthors);
    } catch (error) {
      console.error('Error loading topics:', error);
      toast.error('Failed to load forum topics');
    }
  };

  const loadReplies = async (topicId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Get author info separately
      const repliesWithAuthors = await Promise.all(
        data?.map(async (reply) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', reply.author_id)
            .single();
            
          return {
            ...reply,
            profiles: {
              display_name: profileData?.display_name || 'Unknown User'
            }
          };
        }) || []
      );
      
      setReplies(repliesWithAuthors);
    } catch (error) {
      console.error('Error loading replies:', error);
      toast.error('Failed to load replies');
    }
  };

  const incrementViewCount = async (topicId: string) => {
    try {
      // Simple increment using update
      const { data: currentTopic } = await supabase
        .from('forum_topics')
        .select('view_count')
        .eq('id', topicId)
        .single();
        
      if (currentTopic) {
        await supabase
          .from('forum_topics')
          .update({ view_count: (currentTopic.view_count || 0) + 1 })
          .eq('id', topicId);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const createTopic = async () => {
    if (!user || !selectedCategory || !newTopic.title.trim() || !newTopic.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_topics')
        .insert({
          category_id: selectedCategory,
          title: newTopic.title,
          content: newTopic.content,
          author_id: user.id,
          is_anonymous: newTopic.is_anonymous
        });

      if (error) throw error;

      toast.success('Topic created successfully');
      setNewTopicOpen(false);
      setNewTopic({ title: '', content: '', is_anonymous: false });
      loadTopics(selectedCategory);
    } catch (error) {
      console.error('Error creating topic:', error);
      toast.error('Failed to create topic');
    }
  };

  const renderCategories = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Card 
          key={category.id} 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedCategory(category.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">{category.icon || '💬'}</div>
              <div className="flex-1">
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{category.post_count} posts</span>
              {category.last_post_at && (
                <span>Last: {new Date(category.last_post_at).toLocaleDateString()}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTopics = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setSelectedCategory(null)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
        
        {user && (
          <Dialog open={newTopicOpen} onOpenChange={setNewTopicOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Topic</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                    placeholder="Topic title..."
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newTopic.content}
                    onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                    placeholder="What would you like to discuss?"
                    rows={6}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous"
                    checked={newTopic.is_anonymous}
                    onCheckedChange={(checked) => setNewTopic({ ...newTopic, is_anonymous: checked })}
                  />
                  <Label htmlFor="anonymous">Post anonymously</Label>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createTopic}>Create Topic</Button>
                  <Button variant="outline" onClick={() => setNewTopicOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-2">
        {topics.filter(topic => 
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.content.toLowerCase().includes(searchQuery.toLowerCase())
        ).map((topic) => (
          <Card 
            key={topic.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedTopic(topic)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {topic.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                    {topic.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                    <h3 className="font-semibold">{topic.title}</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {topic.content}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>
                      by {topic.is_anonymous ? 'Anonymous' : topic.profiles?.display_name || 'Unknown'}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {topic.view_count}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {topic.reply_count}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(topic.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTopicDetail = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setSelectedTopic(null)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Topics
        </Button>
      </div>

      {/* Topic */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            {selectedTopic?.is_pinned && <Pin className="h-4 w-4 text-primary" />}
            {selectedTopic?.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
            <CardTitle>{selectedTopic?.title}</CardTitle>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>
              by {selectedTopic?.is_anonymous ? 'Anonymous' : selectedTopic?.profiles?.display_name || 'Unknown'}
            </span>
            <span>{new Date(selectedTopic?.created_at || '').toLocaleDateString()}</span>
            <span className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {selectedTopic?.view_count} views
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap">{selectedTopic?.content}</div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Replies ({replies.length})
        </h3>
        
        {replies.map((reply) => (
          <Card key={reply.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {reply.is_anonymous ? 'Anonymous' : reply.profiles?.display_name || 'Unknown'}
                  </span>
                  {reply.is_solution && (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Solution
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(reply.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="whitespace-pre-wrap mb-3">{reply.content}</div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  {reply.like_count}
                </Button>
                <Button variant="ghost" size="sm">
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading forum...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace  
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Community Forum</h1>
              <p className="text-muted-foreground">
                Connect with other buyers and vendors in our secure community
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        {(selectedCategory && !selectedTopic) && (
          <div className="mb-6">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {!selectedCategory && renderCategories()}
        {selectedCategory && !selectedTopic && renderTopics()}
        {selectedTopic && renderTopicDetail()}
      </div>
    </div>
  );
};

export default Forum;