import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Lock, Shield, AlertTriangle, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { encryptMessage, decryptMessage, getRecipientPublicKey, getUserPGPKeys } from '@/lib/pgp';

interface Message {
  id: string;
  content: string;
  encrypted_content?: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  is_encrypted?: boolean;
  sender_profile?: { display_name: string };
}

interface MessageThreadProps {
  recipientId: string;
  recipientName: string;
  userId: string;
}

export default function MessageThread({ recipientId, recipientName, userId }: MessageThreadProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [pgpPassphrase, setPgpPassphrase] = useState('');
  const [needsPassphrase, setNeedsPassphrase] = useState(false);
  const [userPgpKeys, setUserPgpKeys] = useState<any[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    loadUserPgpKeys();
  }, [recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUserPgpKeys = async () => {
    try {
      const keys = await getUserPGPKeys();
      setUserPgpKeys(keys);
      if (keys.length === 0) {
        toast({
          title: "No PGP Keys",
          description: "Generate a PGP key pair to send encrypted messages",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Failed to load PGP keys:', error);
    }
  };

  const createThreadIfNeeded = async () => {
    try {
      // Check if a thread already exists
      const { data: existingThread } = await supabase
        .from('message_threads')
        .select('id')
        .or(`and(buyer_id.eq.${userId},vendor_id.eq.${recipientId}),and(buyer_id.eq.${recipientId},vendor_id.eq.${userId})`)
        .maybeSingle();

      if (existingThread) {
        return existingThread.id;
      }

      // Create new thread using the function
      const { data, error } = await supabase.rpc('create_general_message_thread', {
        participant1_id: userId,
        participant2_id: recipientId,
        subject_text: `Conversation with ${recipientName}`
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create thread:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation thread",
        variant: "destructive",
      });
      return null;
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(display_name)
        `)
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Decrypt messages
      const decryptedMessages = await Promise.all(
        (data || []).map(async (message: any) => {
          // Handle case where encrypted columns might not exist yet
          const isEncrypted = message.is_encrypted || false;
          const encryptedContent = message.encrypted_content;
          
          if (isEncrypted && message.recipient_id === userId) {
            try {
              // Try to decrypt if we have the passphrase
              if (pgpPassphrase && userPgpKeys.length > 0) {
                const defaultKey = userPgpKeys.find(k => k.is_default);
                if (defaultKey?.encrypted_private_key && encryptedContent) {
                  const decrypted = await decryptMessage(
                    encryptedContent,
                    defaultKey.encrypted_private_key,
                    pgpPassphrase
                  );
                  return { ...message, content: decrypted, is_encrypted: true };
                }
              }
              return { ...message, content: '[Encrypted Message - Enter passphrase to decrypt]', is_encrypted: true };
            } catch (error) {
              return { ...message, content: '[Decryption Failed]', is_encrypted: true };
            }
          }
          return { ...message, is_encrypted: isEncrypted };
        })
      );

      setMessages(decryptedMessages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    if (userPgpKeys.length === 0) {
      toast({
        title: "No PGP Keys",
        description: "Generate a PGP key pair first",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // Ensure thread exists
      const threadId = await createThreadIfNeeded();
      if (!threadId) {
        setSending(false);
        return;
      }

      // Get recipient's public key
      const recipientPublicKey = await getRecipientPublicKey(recipientId);
      if (!recipientPublicKey) {
        toast({
          title: "Encryption Error",
          description: "Recipient doesn't have a PGP public key. Cannot send encrypted message.",
          variant: "destructive",
        });
        return;
      }

      // Encrypt the message
      const encryptedContent = await encryptMessage(messageText, recipientPublicKey);

      // Send the message
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          recipient_id: recipientId,
          content: '[Encrypted Message]',
          encrypted_content: encryptedContent,
          is_encrypted: true,
          message_type: 'text',
          thread_id: threadId
        });

      if (error) throw error;

      setMessageText('');
      await loadMessages();

      toast({
        title: "Success",
        description: "Encrypted message sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handlePassphraseSubmit = () => {
    setNeedsPassphrase(false);
    loadMessages();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {recipientName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{recipientName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>End-to-end encrypted</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Lock className="h-3 w-3" />
            PGP Encrypted
          </Badge>
        </div>
      </div>

      {/* Passphrase prompt */}
      {needsPassphrase && (
        <Alert className="m-4">
          <Key className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center gap-2">
              <Input
                type="password"
                placeholder="Enter PGP passphrase to decrypt messages"
                value={pgpPassphrase}
                onChange={(e) => setPgpPassphrase(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePassphraseSubmit()}
              />
              <Button size="sm" onClick={handlePassphraseSubmit}>
                Decrypt
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet. Start a secure conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === userId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-2 opacity-70">
                      <span className="text-xs">
                        {formatTime(message.created_at)}
                      </span>
                      {message.is_encrypted && (
                        <Lock className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      <div className="border-t p-4">
        {userPgpKeys.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Generate a PGP key pair to send encrypted messages</span>
              <Button size="sm" variant="outline">
                Generate Keys
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your encrypted message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={2}
              className="resize-none"
            />
            <Button
              onClick={sendMessage}
              disabled={sending || !messageText.trim()}
              className="shrink-0 gap-2"
            >
              <Send className="h-4 w-4" />
              {sending ? 'Encrypting...' : 'Send'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}