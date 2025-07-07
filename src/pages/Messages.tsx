import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import MessagesHeader from '@/components/messaging/MessagesHeader';
import MessageTabs from '@/components/messaging/MessageTabs';
import MessageList from '@/components/messaging/MessageList';
import MessageComposer from '@/components/messaging/MessageComposer';

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('inbox');
  const [isLoading, setIsLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [editingDraft, setEditingDraft] = useState<any>(null);
  
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  
  const [counts, setCounts] = useState({
    inbox: 0,
    sent: 0,
    drafts: 0
  });

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

  useEffect(() => {
    loadAllMessages();
  }, [user]);

  const loadAllMessages = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        loadInboxMessages(),
        loadSentMessages(),
        loadDrafts()
      ]);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInboxMessages = async () => {
    try {
      console.log('Loading inbox messages for user:', user.id);
      
      // First, try a simple query to see if we have any messages
      const { data: simpleData, error: simpleError } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', user.id);
      
      console.log('Simple messages query result:', { simpleData, simpleError });

      // Get received messages with sender info
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(display_name),
          message_threads(
            buyer_id,
            vendor_id,
            subject
          )
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Inbox query result:', { data, error });

      if (error) {
        console.error('Inbox query error:', error);
        throw error;
      }
      
      const messagesWithSubject = data?.map(msg => ({
        ...msg,
        subject: msg.message_threads?.subject
      })) || [];
      
      console.log('Processed inbox messages:', messagesWithSubject);
      
      setInboxMessages(messagesWithSubject);
      setCounts(prev => ({ 
        ...prev, 
        inbox: messagesWithSubject.filter(m => !m.is_read).length 
      }));
    } catch (error) {
      console.error('Error loading inbox:', error);
      toast({
        title: "Error",
        description: "Failed to load inbox messages",
        variant: "destructive",
      });
    }
  };

  const loadSentMessages = async () => {
    try {
      console.log('Loading sent messages for user:', user.id);
      
      // First, try a simple query to see if we have any sent messages
      const { data: simpleData, error: simpleError } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user.id);
      
      console.log('Simple sent messages query result:', { simpleData, simpleError });

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          recipient_profile:profiles!messages_recipient_id_fkey(display_name),
          message_threads(
            buyer_id,
            vendor_id,
            subject
          )
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Sent messages query result:', { data, error });

      if (error) {
        console.error('Sent messages query error:', error);
        throw error;
      }
      
      const messagesWithSubject = data?.map(msg => ({
        ...msg,
        subject: msg.message_threads?.subject
      })) || [];
      
      console.log('Processed sent messages:', messagesWithSubject);
      
      setSentMessages(messagesWithSubject);
      setCounts(prev => ({ ...prev, sent: messagesWithSubject.length }));
    } catch (error) {
      console.error('Error loading sent messages:', error);
      toast({
        title: "Error",
        description: "Failed to load sent messages",
        variant: "destructive",
      });
    }
  };

  const loadDrafts = async () => {
    try {
      console.log('Loading drafts for user:', user.id);
      
      const { data, error } = await supabase
        .from('message_drafts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      console.log('Drafts query result:', { data, error });

      if (error) {
        console.error('Drafts query error:', error);
        throw error;
      }
      
      setDrafts(data || []);
      setCounts(prev => ({ ...prev, drafts: data?.length || 0 }));
    } catch (error) {
      console.error('Error loading drafts:', error);
      toast({
        title: "Error",
        description: "Failed to load drafts",
        variant: "destructive",
      });
    }
  };

  const handleMessageSent = () => {
    setShowComposer(false);
    setEditingDraft(null);
    loadAllMessages();
    toast({
      title: "Success",
      description: "Message sent successfully",
    });
  };

  const handleDraftSaved = () => {
    loadDrafts();
    if (!editingDraft) {
      setShowComposer(false);
    }
  };

  const handleDraftEdit = (draft: any) => {
    setEditingDraft(draft);
    setShowComposer(true);
  };

  const handleNewMessage = () => {
    setEditingDraft(null);
    setShowComposer(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MessagesHeader />
      
      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Action Bar */}
          <div className="flex justify-between items-center mb-6">
            <MessageTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              inboxCount={counts.inbox}
              sentCount={counts.sent}
              draftsCount={counts.drafts}
            />
            
            <Button onClick={handleNewMessage} className="gap-2">
              <Plus className="h-4 w-4" />
              New Message
            </Button>
          </div>

          {/* Message Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Message List */}
            <div className="lg:col-span-1">
              <Card className="h-[600px]">
                <TabsContent value="inbox" className="h-full m-0">
                  {activeTab === 'inbox' && (
                    <MessageList
                      messages={inboxMessages}
                      type="inbox"
                      userId={user.id}
                      isLoading={isLoading}
                      onRefresh={loadInboxMessages}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="sent" className="h-full m-0">
                  {activeTab === 'sent' && (
                    <MessageList
                      messages={sentMessages}
                      type="sent"
                      userId={user.id}
                      isLoading={isLoading}
                      onRefresh={loadSentMessages}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="drafts" className="h-full m-0">
                  {activeTab === 'drafts' && (
                    <MessageList
                      messages={drafts}
                      type="drafts"
                      userId={user.id}
                      isLoading={isLoading}
                      onDraftEdit={handleDraftEdit}
                      onRefresh={loadDrafts}
                    />
                  )}
                </TabsContent>
              </Card>
            </div>

            {/* Message Composer */}
            <div className="lg:col-span-1">
              {showComposer ? (
                <MessageComposer
                  userId={user.id}
                  onMessageSent={handleMessageSent}
                  onDraftSaved={handleDraftSaved}
                  draftData={editingDraft}
                />
              ) : (
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Start a New Conversation</h3>
                    <p className="text-muted-foreground max-w-sm mb-4">
                      Click "New Message" to compose a secure message or select a draft to continue editing.
                    </p>
                    <Button onClick={handleNewMessage}>
                      Create New Message
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}