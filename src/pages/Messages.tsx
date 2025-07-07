import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Header from '@/components/Header';
import MessagesHeader from '@/components/messaging/MessagesHeader';
import MessageTabs from '@/components/messaging/MessageTabs';
import MessageList from '@/components/messaging/MessageList';
import MessageComposer from '@/components/messaging/MessageComposer';
import { supabase } from '@/integrations/supabase/client';

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
  recipient_username?: string;
}

export default function Messages() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [showComposer, setShowComposer] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState<Message | null>(null);

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-16">
          <Card className="max-w-md mx-auto p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-6">
              Please log in to access your secure messages.
            </p>
            <Button asChild>
              <Link to="/auth">Login to Continue</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      let query;
      
      if (activeTab === 'inbox') {
        query = supabase
          .from('messages')
          .select(`
            *,
            sender_profile:profiles!messages_sender_id_fkey(display_name)
          `)
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false });
      } else if (activeTab === 'sent') {
        query = supabase
          .from('messages')
          .select(`
            *,
            recipient_profile:profiles!messages_recipient_id_fkey(display_name)
          `)
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false });
      } else {
        // drafts
        query = supabase
          .from('message_drafts')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error in loadMessages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [activeTab, user.id]);

  const handleMessageSent = () => {
    setShowComposer(false);
    setSelectedDraft(null);
    loadMessages();
  };

  const handleDraftSaved = () => {
    if (activeTab === 'drafts') {
      loadMessages();
    }
  };

  const handleDraftEdit = (draft: Message) => {
    setSelectedDraft(draft);
    setShowComposer(true);
  };

  const getMessageCounts = () => {
    // This would typically come from separate queries or be calculated
    return {
      inbox: activeTab === 'inbox' ? messages.length : 0,
      sent: activeTab === 'sent' ? messages.length : 0,
      drafts: activeTab === 'drafts' ? messages.length : 0,
    };
  };

  const counts = getMessageCounts();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MessagesHeader />
      
      <div className="container px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {showComposer ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  {selectedDraft ? 'Edit Draft' : 'Compose Message'}
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowComposer(false);
                    setSelectedDraft(null);
                  }}
                >
                  Back to Messages
                </Button>
              </div>
              <MessageComposer
                userId={user.id}
                onMessageSent={handleMessageSent}
                onDraftSaved={handleDraftSaved}
                draftData={selectedDraft ? {
                  id: selectedDraft.id,
                  recipient_username: selectedDraft.recipient_username || '',
                  subject: selectedDraft.subject || '',
                  content: selectedDraft.content
                } : undefined}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Messages</h2>
                <Button onClick={() => setShowComposer(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Compose
                </Button>
              </div>

              <MessageTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                inboxCount={counts.inbox}
                sentCount={counts.sent}
                draftsCount={counts.drafts}
              />

              <div className="bg-card rounded-lg border min-h-[600px]">
                <MessageList
                  messages={messages}
                  type={activeTab as 'inbox' | 'sent' | 'drafts'}
                  userId={user.id}
                  isLoading={isLoading}
                  onDraftEdit={handleDraftEdit}
                  onRefresh={loadMessages}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}