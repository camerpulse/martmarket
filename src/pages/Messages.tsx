import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import ContactsList from '@/components/messages/ContactsList';
import MessageThread from '@/components/messages/MessageThread';
import PGPKeyManager from '@/components/pgp/PGPKeyManager';
import { MessageSquare, Key, Shield } from 'lucide-react';

interface Contact {
  id: string;
  display_name: string;
  last_message_at?: string;
  unread_count?: number;
  has_pgp_key: boolean;
}

export default function Messages() {
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <div className="border-b bg-card">
        <div className="container px-4 py-6">
          <div className="flex items-center gap-4">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
                Secure Messenger
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                End-to-end encrypted messaging using industry-standard PGP encryption. 
                Your messages are protected by military-grade cryptography that only you and your recipient can decrypt.
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-primary">
                <Shield className="h-4 w-4" />
                <span>PGP End-to-End Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="keys" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                PGP Keys
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-0">
              <div className="grid grid-cols-12 gap-6 h-[600px]">
                {/* Contacts Sidebar */}
                <div className="col-span-4">
                  <Card className="h-full">
                    <ContactsList
                      userId={user.id}
                      selectedContactId={selectedContact?.id}
                      onContactSelect={setSelectedContact}
                    />
                  </Card>
                </div>

                {/* Message Thread */}
                <div className="col-span-8">
                  <Card className="h-full">
                    {selectedContact ? (
                      <MessageThread
                        recipientId={selectedContact.id}
                        recipientName={selectedContact.display_name}
                        userId={user.id}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-center">
                        <div>
                          <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                          <p className="text-muted-foreground max-w-sm">
                            Choose a contact from the sidebar to start or continue a secure conversation.
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="keys" className="space-y-6">
              <div className="max-w-2xl">
                <Card className="p-6">
                  <PGPKeyManager />
                </Card>

                <Card className="p-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">About PGP Encryption</h3>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">End-to-End Encryption</p>
                        <p>Messages are encrypted on your device and can only be decrypted by the intended recipient.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Your Keys, Your Control</p>
                        <p>You control your private keys. We never see your decrypted messages or private keys.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Military-Grade Security</p>
                        <p>Uses the same encryption standards trusted by governments and security professionals worldwide.</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}