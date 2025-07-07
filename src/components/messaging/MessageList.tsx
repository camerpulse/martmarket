import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MessageCircle, Edit, Trash2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id?: string;
  recipient_id?: string;
  thread_id?: string;
  subject?: string;
  content: string;
  created_at: string;
  is_read?: boolean;
  sender_profile?: { display_name: string };
  recipient_profile?: { display_name: string };
  buyer_profile?: { display_name: string };
  vendor_profile?: { display_name: string };
  recipient_username?: string; // For drafts
}

interface MessageListProps {
  messages: Message[];
  type: 'inbox' | 'sent' | 'drafts';
  userId: string;
  isLoading: boolean;
  onMessageSelect?: (message: Message) => void;
  onDraftEdit?: (draft: Message) => void;
  onRefresh?: () => void;
}

export default function MessageList({ 
  messages, 
  type, 
  userId, 
  isLoading, 
  onMessageSelect, 
  onDraftEdit,
  onRefresh 
}: MessageListProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = messages.filter(message => {
    const searchText = searchQuery.toLowerCase();
    return (
      message.content?.toLowerCase().includes(searchText) ||
      message.subject?.toLowerCase().includes(searchText) ||
      getMessagePartner(message)?.toLowerCase().includes(searchText)
    );
  });

  function getMessagePartner(message: Message): string {
    if (type === 'drafts') {
      return message.recipient_username || 'Unknown';
    }
    
    if (type === 'sent') {
      return message.recipient_profile?.display_name || 
             message.vendor_profile?.display_name || 
             message.buyer_profile?.display_name || 'Unknown';
    }
    
    // inbox
    return message.sender_profile?.display_name ||
           (message.sender_id === userId ? 'You' : 'Unknown');
  }

  const deleteDraft = async (draftId: string) => {
    try {
      const { error } = await supabase
        .from('message_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Draft deleted successfully",
      });

      onRefresh?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete draft",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${type}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Message List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-4 animate-pulse text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading {type}...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">No {type} found</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : `Your ${type} will appear here`}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => type === 'drafts' ? onDraftEdit?.(message) : onMessageSelect?.(message)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getMessagePartner(message).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium truncate">
                          {type === 'sent' ? `To: ${getMessagePartner(message)}` : getMessagePartner(message)}
                        </h4>
                        {type === 'inbox' && !message.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                        {type === 'drafts' && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {type === 'drafts' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDraftEdit?.(message);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteDraft(message.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {message.subject && (
                      <p className="text-sm font-medium mb-1 truncate">
                        {message.subject}
                      </p>
                    )}
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}