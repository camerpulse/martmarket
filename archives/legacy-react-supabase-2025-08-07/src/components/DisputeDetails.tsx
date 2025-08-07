import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  Send, 
  User, 
  Calendar,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Dispute {
  id: string;
  order_id: string;
  buyer_id: string;
  vendor_id: string;
  category: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  evidence_urls: string[] | null;
  amount_disputed_btc: number | null;
  resolution_deadline: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolution_type: string | null;
  resolution_notes: string | null;
  escalation_reason: string | null;
  escalated_at: string | null;
  orders: {
    products: {
      title: string;
    };
  };
  buyer_profile: {
    display_name: string;
  };
  vendor_profile: {
    display_name: string;
  };
}

interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  message_type: string;
  content: string;
  attachments: string[] | null;
  created_at: string;
  sender_profile: {
    display_name: string;
  };
}

interface DisputeDetailsProps {
  disputeId: string;
  onBack?: () => void;
}

const formatDisputeStatus = (status: string) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
    'open': { label: 'Open', variant: 'destructive' },
    'under_review': { label: 'Under Review', variant: 'secondary' },
    'awaiting_buyer_response': { label: 'Awaiting Buyer Response', variant: 'outline' },
    'awaiting_vendor_response': { label: 'Awaiting Vendor Response', variant: 'outline' },
    'escalated': { label: 'Escalated', variant: 'destructive' },
    'resolved_favor_buyer': { label: 'Resolved - Buyer Favor', variant: 'default' },
    'resolved_favor_vendor': { label: 'Resolved - Vendor Favor', variant: 'default' },
    'resolved_mutual': { label: 'Resolved - Mutual Agreement', variant: 'default' },
    'closed_no_action': { label: 'Closed - No Action', variant: 'secondary' }
  };
  
  return statusMap[status] || { label: status, variant: 'outline' as const };
};

const formatCategory = (category: string) => {
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const getStatusIcon = (status: string) => {
  if (status.startsWith('resolved_')) return <CheckCircle className="h-4 w-4" />;
  if (status === 'escalated') return <AlertTriangle className="h-4 w-4" />;
  if (status === 'closed_no_action') return <XCircle className="h-4 w-4" />;
  return <AlertCircle className="h-4 w-4" />;
};

export function DisputeDetails({ disputeId, onBack }: DisputeDetailsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadDisputeDetails();
  }, [disputeId]);

  const loadDisputeDetails = async () => {
    try {
      setLoading(true);

      // Load dispute details
      const { data: disputeData, error: disputeError } = await supabase
        .from('disputes')
        .select(`
          *,
          orders!inner(
            products!inner(title)
          )
        `)
        .eq('id', disputeId)
        .single();

      if (disputeError) throw disputeError;

      // Get buyer and vendor profiles separately
      const [buyerProfile, vendorProfile] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('user_id', disputeData.buyer_id).single(),
        supabase.from('profiles').select('display_name').eq('user_id', disputeData.vendor_id).single()
      ]);

      const disputeWithProfiles = {
        ...disputeData,
        buyer_profile: buyerProfile.data,
        vendor_profile: vendorProfile.data
      };

      setDispute(disputeWithProfiles);

      // Load dispute messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('dispute_messages')
        .select(`*`)
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Get sender profiles for messages
      const messagesWithProfiles = await Promise.all(
        (messagesData || []).map(async (message) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', message.sender_id)
            .single();
          
          return {
            ...message,
            sender_profile: senderProfile
          };
        })
      );

      setMessages(messagesWithProfiles);

    } catch (error) {
      console.error('Error loading dispute details:', error);
      toast({
        title: "Error",
        description: "Failed to load dispute details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('dispute_messages')
        .insert({
          dispute_id: disputeId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'message'
        });

      if (error) throw error;

      setNewMessage('');
      loadDisputeDetails(); // Reload to get the new message

      toast({
        title: "Message Sent",
        description: "Your message has been added to the dispute",
      });

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Loading dispute details...</div>
          <div className="text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Dispute Not Found</h3>
        <p className="text-muted-foreground mb-4">
          The dispute you're looking for doesn't exist or you don't have access to it.
        </p>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        )}
      </div>
    );
  }

  const statusInfo = formatDisputeStatus(dispute.status);
  const isResolved = dispute.status.startsWith('resolved_') || dispute.status === 'closed_no_action';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            ← Back to Disputes
          </Button>
        )}
        <div className="flex items-center gap-2">
          {getStatusIcon(dispute.status)}
          <Badge variant={statusInfo.variant}>
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Dispute Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {dispute.title}
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>Order: {dispute.orders.products.title}</span>
            <span>•</span>
            <span>Category: {formatCategory(dispute.category)}</span>
            <span>•</span>
            <span>Filed: {new Date(dispute.created_at).toLocaleDateString()}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {dispute.description}
            </p>
          </div>

          {dispute.amount_disputed_btc && (
            <div>
              <h4 className="font-medium mb-2">Amount Disputed</h4>
              <p className="text-sm font-mono">{dispute.amount_disputed_btc} BTC</p>
            </div>
          )}

          {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Evidence</h4>
              <div className="space-y-2">
                {dispute.evidence_urls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Evidence {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {dispute.resolution_deadline && !isResolved && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Resolution Deadline:</span>
                <span>{new Date(dispute.resolution_deadline).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {dispute.escalation_reason && (
            <div className="bg-destructive/10 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="font-medium">Escalation Reason:</span>
                <span>{dispute.escalation_reason}</span>
              </div>
            </div>
          )}

          {dispute.resolution_notes && (
            <div className="bg-primary/10 p-3 rounded-lg">
              <h4 className="font-medium mb-2">Resolution Notes</h4>
              <p className="text-sm">{dispute.resolution_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No messages yet. Start the conversation by sending a message below.
            </p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {message.sender_profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.sender_profile?.display_name || 'Unknown User'}
                      </span>
                      {message.message_type === 'system' && (
                        <Badge variant="secondary" className="text-xs">System</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isResolved && (
            <>
              <Separator />
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sendingMessage ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}