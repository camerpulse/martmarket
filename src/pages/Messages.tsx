import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle,
  Send,
  Shield,
  Search,
  Plus,
  ArrowLeft,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  MoreHorizontal,
  Trash2,
  Reply,
  Forward,
  Archive,
  Inbox,
  FileText,
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newConversation, setNewConversation] = useState({
    recipient: '',
    subject: '',
    message: ''
  });

  // Check authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">
                Please log in to access your secure messages.
              </p>
              <Button asChild>
                <Link to="/auth">Login to Continue</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('message_threads')
        .select(`
          id,
          subject,
          buyer_id,
          vendor_id,
          buyer_unread_count,
          vendor_unread_count,
          last_message_at,
          is_encrypted,
          buyer_profile:profiles!message_threads_buyer_id_fkey(display_name),
          vendor_profile:profiles!message_threads_vendor_id_fkey(display_name)
        `)
        .or(`buyer_id.eq.${user.id},vendor_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          is_read,
          sender_profile:profiles!messages_sender_id_fkey(display_name)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      
      // Mark messages as read
      await markAsRead(threadId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markAsRead = async (threadId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('thread_id', threadId)
        .eq('recipient_id', user.id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      const recipientId = selectedConversation.buyer_id === user.id 
        ? selectedConversation.vendor_id 
        : selectedConversation.buyer_id;

      const { error } = await supabase
        .from('messages')
        .insert({
          thread_id: selectedConversation.id,
          sender_id: user.id,
          recipient_id: recipientId,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      // Update thread last message time
      await supabase
        .from('message_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      setNewMessage('');
      await loadMessages(selectedConversation.id);
      await loadConversations();
      
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const createConversation = async () => {
    if (!newConversation.recipient.trim() || !newConversation.subject.trim() || !newConversation.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find recipient by username
      const { data: recipientData, error: recipientError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('display_name', newConversation.recipient.trim())
        .single();

      if (recipientError || !recipientData) {
        toast({
          title: "Error",
          description: "Recipient not found. Please check the username.",
          variant: "destructive",
        });
        return;
      }

      // Create thread
      const { data: threadData, error: threadError } = await supabase
        .from('message_threads')
        .insert({
          subject: newConversation.subject,
          buyer_id: user.id,
          vendor_id: recipientData.user_id,
          is_encrypted: true
        })
        .select()
        .single();

      if (threadError) throw threadError;

      // Send first message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: threadData.id,
          sender_id: user.id,
          recipient_id: recipientData.user_id,
          content: newConversation.message,
          message_type: 'text'
        });

      if (messageError) throw messageError;

      setIsComposeOpen(false);
      setNewConversation({ recipient: '', subject: '', message: '' });
      await loadConversations();
      
      toast({
        title: "Success",
        description: "Conversation started successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create conversation",
        variant: "destructive",
      });
    }
  };

  const getOtherParticipant = (conversation: any) => {
    if (!user) return 'Unknown';
    return conversation.buyer_id === user.id 
      ? conversation.vendor_profile?.display_name || 'Unknown User'
      : conversation.buyer_profile?.display_name || 'Unknown User';
  };

  const getUnreadCount = (conversation: any) => {
    if (!user) return 0;
    return conversation.buyer_id === user.id 
      ? conversation.buyer_unread_count 
      : conversation.vendor_unread_count;
  };

  const filteredConversations = conversations.filter(conv => 
    conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getOtherParticipant(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <div className="border-b bg-card">
        <div className="container px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-2 flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-primary" />
                Secure Messages
              </h1>
              <p className="text-muted-foreground">
                End-to-end encrypted communications with verified users
              </p>
            </div>
            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Compose Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Compose New Message</DialogTitle>
                  <DialogDescription>
                    Send a secure message to another OpesMarket user
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">To (Username)</Label>
                    <Input
                      id="recipient"
                      placeholder="Enter recipient's username"
                      value={newConversation.recipient}
                      onChange={(e) => setNewConversation({ ...newConversation, recipient: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Message subject"
                      value={newConversation.subject}
                      onChange={(e) => setNewConversation({ ...newConversation, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      rows={6}
                      value={newConversation.message}
                      onChange={(e) => setNewConversation({ ...newConversation, message: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm">This message will be end-to-end encrypted</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createConversation}>
                      Send Message
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Messages Interface */}
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <div className="lg:col-span-1 border rounded-lg bg-card">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[500px]">
              {isLoading ? (
                <div className="p-8 text-center">
                  <MessageCircle className="h-8 w-8 mx-auto mb-4 animate-pulse text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">No conversations yet</p>
                  <p className="text-xs text-muted-foreground">Start a new conversation to get started</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedConversation?.id === conversation.id ? 'bg-primary/5 border-r-2 border-primary' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getOtherParticipant(conversation).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium truncate">
                                {getOtherParticipant(conversation)}
                              </h4>
                              {getUnreadCount(conversation) > 0 && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {conversation.is_encrypted && (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(conversation.last_message_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mb-1">
                            {conversation.subject || 'No subject'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getUnreadCount(conversation) > 0 && (
                              <span className="font-medium text-primary">
                                {getUnreadCount(conversation)} unread
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Message View */}
          <div className="lg:col-span-2 border rounded-lg bg-card">
            {selectedConversation ? (
              <div className="flex flex-col h-full">
                {/* Message Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {selectedConversation.subject || 'No subject'}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {getOtherParticipant(selectedConversation).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {getOtherParticipant(selectedConversation)}
                        </span>
                      </div>
                    </div>
                    {selectedConversation.is_encrypted && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Encrypted
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Start the conversation</p>
                      <p className="text-sm text-muted-foreground">Send a message to begin this conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${
                            message.sender_id === user.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          } rounded-lg p-3`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <p className={`text-xs mt-2 ${
                              message.sender_id === user.id 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {new Date(message.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  {selectedConversation.is_encrypted && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-primary/5 rounded text-xs text-primary">
                      <Shield className="h-3 w-3" />
                      <span>This conversation is end-to-end encrypted</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      disabled={isSending}
                      rows={3}
                      className="flex-1 resize-none"
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-6 opacity-20 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Choose a conversation from the list to view and reply to messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}