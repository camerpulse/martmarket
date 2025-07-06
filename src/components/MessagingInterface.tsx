import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Send, 
  Shield, 
  Lock, 
  Smile, 
  Paperclip,
  MoreVertical,
  Clock,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  thread_id: string;
  created_at: string;
  message_type: string;
  is_read: boolean;
  sender: { display_name: string };
  reactions: Array<{ reaction_type: string; user_id: string }>;
  attachments: Array<{ file_name: string; file_type: string; encrypted_file_url: string }>;
}

interface MessageThread {
  id: string;
  subject: string;
  buyer_id: string;
  vendor_id: string;
  buyer_unread_count: number;
  vendor_unread_count: number;
  last_message_at: string;
  is_encrypted: boolean;
  orders: { id: string; status: string; products: { title: string } };
  buyer_profile: { display_name: string };
  vendor_profile: { display_name: string };
}

interface TypingIndicator {
  user_id: string;
  is_typing: boolean;
}

export function MessagingInterface() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (user) {
      loadThreads();
      loadAvailableOrders();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
      markThreadAsRead(selectedThread.id);
    }
  }, [selectedThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as any;
          if (selectedThread && newMessage.thread_id === selectedThread.id) {
            setMessages(prev => [...prev, newMessage]);
          }
          // Update thread list
          loadThreads();
        }
      )
      .subscribe();

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel('typing-indicators')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators'
        },
        (payload) => {
          const typingData = payload.new as any;
          if (selectedThread && typingData?.thread_id === selectedThread.id) {
            setTypingUsers(prev => {
              const filtered = prev.filter(t => t.user_id !== typingData.user_id);
              if (typingData?.is_typing && typingData.user_id !== user.id) {
                return [...filtered, { user_id: typingData.user_id, is_typing: true }];
              }
              return filtered;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
    };
  };

  const loadThreads = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-messaging', {
        body: { action: 'get_threads' }
      });

      if (error) throw error;
      if (data.success) {
        setThreads(data.threads);
      }
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-messaging', {
        body: { action: 'get_messages', thread_id: threadId }
      });

      if (error) throw error;
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadAvailableOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          products(id, title),
          vendor_id,
          buyer_id,
          profiles!orders_vendor_id_fkey(display_name),
          profiles!orders_buyer_id_fkey(display_name)
        `)
        .or(`buyer_id.eq.${user?.id},vendor_id.eq.${user?.id}`)
        .in('status', ['pending', 'processing', 'shipped', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const createNewThread = async () => {
    if (!selectedOrderId) return;

    try {
      const { data, error } = await supabase.functions.invoke('secure-messaging', {
        body: { 
          action: 'create_thread', 
          order_id: selectedOrderId,
          subject: `Order Discussion - ${selectedOrderId}`
        }
      });

      if (error) throw error;
      if (data.success) {
        setIsComposeOpen(false);
        setSelectedOrderId('');
        await loadThreads();
        
        // Select the new thread
        const newThread = threads.find(t => t.orders?.id === selectedOrderId);
        if (newThread) setSelectedThread(newThread);
        
        toast({
          title: "Success",
          description: "New conversation started",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create conversation",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || isSending) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('secure-messaging', {
        body: {
          action: 'send_message',
          thread_id: selectedThread.id,
          content: newMessage.trim(),
          encrypt: selectedThread.is_encrypted
        }
      });

      if (error) throw error;
      if (data.success) {
        setNewMessage('');
        setIsTyping(false);
        // Message will be added via realtime subscription
      }
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

  const markThreadAsRead = async (threadId: string) => {
    try {
      await supabase.functions.invoke('secure-messaging', {
        body: { action: 'mark_as_read', thread_id: threadId }
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!selectedThread) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing indicator
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      supabase.functions.invoke('secure-messaging', {
        body: {
          action: 'set_typing',
          thread_id: selectedThread.id,
          is_typing: true
        }
      });
    }

    // Clear typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      supabase.functions.invoke('secure-messaging', {
        body: {
          action: 'set_typing',
          thread_id: selectedThread.id,
          is_typing: false
        }
      });
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUnreadCount = (thread: MessageThread) => {
    if (!user) return 0;
    return user.id === thread.buyer_id ? 
      thread.buyer_unread_count : 
      thread.vendor_unread_count;
  };

  const getOtherParticipant = (thread: MessageThread) => {
    if (!user) return 'Unknown';
    return user.id === thread.buyer_id ? 
      thread.vendor_profile?.display_name || 'Vendor' :
      thread.buyer_profile?.display_name || 'Buyer';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-8 w-8 mx-auto mb-4 animate-pulse" />
          <p>Loading messages...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-[700px] bg-background border rounded-lg overflow-hidden shadow-sm">
      {/* Email-style Sidebar */}
      <div className="w-80 border-r bg-card">
        {/* Header with Compose */}
        <div className="p-4 border-b bg-muted/20">
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button className="w-full justify-start gap-2 h-10 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Compose
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Conversation</DialogTitle>
                <DialogDescription>
                  Select an order to start messaging about
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.products?.title}</span>
                          <span className="text-xs text-muted-foreground">
                            Order #{order.id.slice(0, 8)} • {order.status}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsComposeOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createNewThread}
                    disabled={!selectedOrderId}
                  >
                    Start Conversation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Inbox Label */}
        <div className="px-4 py-2 border-b">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Inbox ({threads.length})
          </h2>
        </div>
        {/* Email List */}
        <ScrollArea className="h-[calc(700px-140px)]">
          {threads.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Your inbox is empty</p>
              <p className="text-xs mt-1">Start a new conversation to get started</p>
            </div>
          ) : (
            <div className="divide-y">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`p-4 cursor-pointer transition-all hover:bg-muted/30 ${
                    selectedThread?.id === thread.id 
                      ? 'bg-primary/5 border-r-2 border-primary' 
                      : ''
                  }`}
                  onClick={() => setSelectedThread(thread)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getOtherParticipant(thread).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-medium truncate ${
                            getUnreadCount(thread) > 0 ? 'font-semibold' : ''
                          }`}>
                            {getOtherParticipant(thread)}
                          </h4>
                          {getUnreadCount(thread) > 0 && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {thread.is_encrypted && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(thread.last_message_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm mb-1 truncate ${
                        getUnreadCount(thread) > 0 ? 'font-medium' : 'text-muted-foreground'
                      }`}>
                        {thread.subject || `Re: ${thread.orders?.products?.title || 'Order Discussion'}`}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Order #{thread.orders?.id?.slice(0, 8) || 'N/A'} • {thread.orders?.status || 'Active'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Email Content Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedThread ? (
          <>
            {/* Email Header */}
            <div className="px-6 py-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold">
                    {selectedThread.subject || `Re: ${selectedThread.orders?.products?.title || 'Order Discussion'}`}
                  </h1>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>From:</span>
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {getOtherParticipant(selectedThread).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{getOtherParticipant(selectedThread)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Order #{selectedThread.orders?.id?.slice(0, 8) || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedThread.is_encrypted && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      End-to-end Encrypted
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Email Messages */}
            <ScrollArea className="flex-1 px-6 py-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No messages yet</p>
                  <p className="text-sm">Start the conversation by sending a message below</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div key={message.id} className="group">
                      {/* Message Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {message.sender_id === user?.id 
                              ? 'You'
                              : getOtherParticipant(selectedThread).charAt(0).toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {message.sender_id === user?.id 
                                ? 'You' 
                                : getOtherParticipant(selectedThread)
                              }
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {message.reactions?.length > 0 && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {message.reactions.map((reaction, idx) => (
                              <span key={idx} className="text-sm px-2 py-1 bg-muted rounded-full">
                                {reaction.reaction_type === 'like' && '👍'}
                                {reaction.reaction_type === 'heart' && '❤️'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className="ml-11 mb-4">
                        <div className="bg-card border rounded-lg p-4 shadow-sm">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                      
                      {index < messages.length - 1 && <Separator className="my-6" />}
                    </div>
                  ))}
                  
                  {/* Typing Indicators */}
                  {typingUsers.filter(t => t.is_typing).length > 0 && (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getOtherParticipant(selectedThread).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-xs">typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Reply Area */}
            <div className="border-t bg-card">
              {selectedThread.is_encrypted && (
                <div className="px-6 py-2 bg-primary/5 border-b">
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Shield className="h-3 w-3" />
                    <span>This conversation is end-to-end encrypted</span>
                  </div>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      You
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Type your reply..."
                      value={newMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      disabled={isSending}
                      className="border-none shadow-none focus-visible:ring-1 text-base px-0"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isSending}
                        size="sm"
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-6 opacity-20" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground max-w-sm">
                Choose a conversation from your inbox to view messages and reply
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}