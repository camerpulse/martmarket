import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MessageCircle, Plus, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  display_name: string;
  last_message_at?: string;
  unread_count?: number;
  has_pgp_key: boolean;
}

interface ContactsListProps {
  userId: string;
  selectedContactId?: string;
  onContactSelect: (contact: Contact) => void;
}

export default function ContactsList({ userId, selectedContactId, onContactSelect }: ContactsListProps) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewContact, setShowNewContact] = useState(false);
  const [newContactUsername, setNewContactUsername] = useState('');

  useEffect(() => {
    loadContacts();
  }, [userId]);

  const loadContacts = async () => {
    try {
      // Get all users who have exchanged messages with current user
      const { data: messageContacts, error: messagesError } = await supabase
        .from('messages')
        .select(`
          sender_id,
          recipient_id,
          created_at,
          profiles_sender:profiles!messages_sender_id_fkey(user_id, display_name),
          profiles_recipient:profiles!messages_recipient_id_fkey(user_id, display_name)
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Extract unique contacts
      const contactsMap = new Map<string, Contact>();
      
      messageContacts?.forEach(message => {
        const isCurrentUserSender = message.sender_id === userId;
        const contactId = isCurrentUserSender ? message.recipient_id : message.sender_id;
        const contactProfile = isCurrentUserSender ? message.profiles_recipient : message.profiles_sender;
        
        if (contactProfile && !contactsMap.has(contactId)) {
          contactsMap.set(contactId, {
            id: contactId,
            display_name: contactProfile.display_name,
            last_message_at: message.created_at,
            unread_count: 0,
            has_pgp_key: false
          });
        }
      });

      // Check which contacts have PGP keys
      const contactIds = Array.from(contactsMap.keys());
      if (contactIds.length > 0) {
        const { data: pgpKeys } = await supabase
          .from('user_pgp_keys')
          .select('user_id')
          .in('user_id', contactIds);

        pgpKeys?.forEach(key => {
          const contact = contactsMap.get(key.user_id);
          if (contact) {
            contact.has_pgp_key = true;
          }
        });
      }

      setContacts(Array.from(contactsMap.values()));
    } catch (error: any) {
      console.error('Failed to load contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addNewContact = async () => {
    if (!newContactUsername.trim()) return;

    try {
      // Find user by display name
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('display_name', newContactUsername.trim())
        .single();

      if (error || !userProfile) {
        toast({
          title: "User Not Found",
          description: "No user found with that username",
          variant: "destructive",
        });
        return;
      }

      if (userProfile.user_id === userId) {
        toast({
          title: "Invalid Contact",
          description: "You cannot add yourself as a contact",
          variant: "destructive",
        });
        return;
      }

      // Check if user has PGP key
      const { data: pgpKey } = await supabase
        .from('user_pgp_keys')
        .select('id')
        .eq('user_id', userProfile.user_id)
        .eq('is_default', true)
        .single();

      const newContact: Contact = {
        id: userProfile.user_id,
        display_name: userProfile.display_name,
        has_pgp_key: !!pgpKey,
        unread_count: 0
      };

      // Check if contact already exists
      const existingContact = contacts.find(c => c.id === newContact.id);
      if (existingContact) {
        onContactSelect(existingContact);
      } else {
        setContacts(prev => [newContact, ...prev]);
        onContactSelect(newContact);
      }

      setShowNewContact(false);
      setNewContactUsername('');

      toast({
        title: "Contact Added",
        description: `Added ${userProfile.display_name} to your contacts`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add contact",
        variant: "destructive",
      });
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLastMessageTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Dialog open={showNewContact} onOpenChange={setShowNewContact}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Start New Conversation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={newContactUsername}
                    onChange={(e) => setNewContactUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewContact()}
                  />
                </div>
                <Button onClick={addNewContact} className="w-full">
                  Start Conversation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contacts List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-4 animate-pulse text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading contacts...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">No contacts found</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'Start a new conversation to see contacts here'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                  selectedContactId === contact.id ? 'bg-muted' : ''
                }`}
                onClick={() => onContactSelect(contact)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {contact.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">
                        {contact.display_name}
                      </h4>
                      <div className="flex items-center gap-2">
                        {contact.has_pgp_key && (
                          <Shield className="h-3 w-3 text-green-600" />
                        )}
                        {contact.unread_count && contact.unread_count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {contact.unread_count}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatLastMessageTime(contact.last_message_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {contact.has_pgp_key ? (
                        <>
                          <Shield className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">PGP Enabled</span>
                        </>
                      ) : (
                        <span className="text-yellow-600">No PGP Key</span>
                      )}
                    </div>
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