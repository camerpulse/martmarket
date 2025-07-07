import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Save, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { detectOffPlatformContent, flagContent } from '@/lib/contentDetection';

interface MessageComposerProps {
  userId: string;
  onMessageSent?: () => void;
  onDraftSaved?: () => void;
  draftData?: {
    id: string;
    recipient_username: string;
    subject: string;
    content: string;
  };
}

export default function MessageComposer({ 
  userId, 
  onMessageSent, 
  onDraftSaved, 
  draftData 
}: MessageComposerProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    recipient: draftData?.recipient_username || '',
    subject: draftData?.subject || '',
    content: draftData?.content || ''
  });
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [detectedContent, setDetectedContent] = useState<any[]>([]);

  const handleContentChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Detect off-platform content in real-time
    if (field === 'content') {
      const detected = detectOffPlatformContent(value);
      setDetectedContent(detected);
    }
  };

  const saveDraft = async () => {
    if (!formData.content.trim()) return;

    setIsSavingDraft(true);
    try {
      const draftPayload = {
        user_id: userId,
        recipient_username: formData.recipient,
        subject: formData.subject,
        content: formData.content
      };

      let draftId = draftData?.id;

      if (draftData?.id) {
        // Update existing draft
        const { error } = await supabase
          .from('message_drafts')
          .update(draftPayload)
          .eq('id', draftData.id);
        
        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('message_drafts')
          .insert(draftPayload)
          .select()
          .single();
        
        if (error) throw error;
        draftId = data.id;
      }

      // Flag content if detected
      if (detectedContent.length > 0) {
        await flagContent(userId, detectedContent, undefined, draftId);
      }

      toast({
        title: "Success",
        description: "Draft saved successfully",
      });

      onDraftSaved?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save draft",
        variant: "destructive",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const sendMessage = async () => {
    if (!formData.recipient.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in recipient and message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Find recipient
      const { data: recipientData, error: recipientError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('display_name', formData.recipient.trim())
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
          subject: formData.subject,
          buyer_id: userId,
          vendor_id: recipientData.user_id,
          is_encrypted: true
        })
        .select()
        .single();

      if (threadError) throw threadError;

      // Send message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: threadData.id,
          sender_id: userId,
          recipient_id: recipientData.user_id,
          content: formData.content,
          message_type: 'text'
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Flag content if detected
      if (detectedContent.length > 0) {
        await flagContent(userId, detectedContent, messageData.id);
      }

      // Delete draft if it exists
      if (draftData?.id) {
        await supabase.from('message_drafts').delete().eq('id', draftData.id);
      }

      // Clear form
      setFormData({ recipient: '', subject: '', content: '' });
      setDetectedContent([]);

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      onMessageSent?.();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {draftData ? 'Edit Draft' : 'Compose New Message'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {detectedContent.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Detected potential off-platform contact information. Please keep all communications 
              within the Opes platform for security and dispute resolution purposes.
            </AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="recipient">To (Username)</Label>
          <Input
            id="recipient"
            placeholder="Enter recipient's username"
            value={formData.recipient}
            onChange={(e) => handleContentChange('recipient', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Message subject (optional)"
            value={formData.subject}
            onChange={(e) => handleContentChange('subject', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="content">Message</Label>
          <Textarea
            id="content"
            placeholder="Type your message here..."
            rows={8}
            value={formData.content}
            onChange={(e) => handleContentChange('content', e.target.value)}
            className={detectedContent.length > 0 ? 'border-destructive' : ''}
          />
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={saveDraft}
            disabled={isSavingDraft || !formData.content.trim()}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </Button>

          <Button
            onClick={sendMessage}
            disabled={isSending || !formData.recipient.trim() || !formData.content.trim()}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSending ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}