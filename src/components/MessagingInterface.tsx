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
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (user) {
      loadThreads();
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
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Thread List */}
      <div className="w-1/3 border-r bg-muted/30">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messages
          </h3>
        </div>
        <ScrollArea className="h-[calc(600px-60px)]">
          {threads.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedThread?.id === thread.id 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedThread(thread)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getOtherParticipant(thread).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getOtherParticipant(thread)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {thread.orders?.products?.title || 'General Discussion'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getUnreadCount(thread) > 0 && (
                        <Badge variant="destructive" className="text-xs px-1 py-0 min-w-[16px] h-4">
                          {getUnreadCount(thread)}
                        </Badge>
                      )}
                      {thread.is_encrypted && (
                        <Lock className="h-3 w-3 text-primary" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(thread.last_message_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getOtherParticipant(selectedThread).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{getOtherParticipant(selectedThread)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedThread.orders?.products?.title || 'General Discussion'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedThread.is_encrypted && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Encrypted
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Start the conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                          <span>{formatTime(message.created_at)}</span>
                          {message.reactions?.length > 0 && (
                            <div className="flex gap-1">
                              {message.reactions.map((reaction, idx) => (
                                <span key={idx} className="px-1 rounded">
                                  {reaction.reaction_type === 'like' && '👍'}
                                  {reaction.reaction_type === 'heart' && '❤️'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicators */}
                  {typingUsers.filter(t => t.is_typing).length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3">
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

            {/* Message Input */}
            <div className="p-4 border-t bg-muted/30">
              {selectedThread.is_encrypted && (
                <Alert className="mb-3">
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Messages in this conversation are end-to-end encrypted
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isSending}
                />
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}