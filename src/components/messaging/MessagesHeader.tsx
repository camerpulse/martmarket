import { Shield, MessageSquare } from 'lucide-react';

export default function MessagesHeader() {
  return (
    <div className="border-b bg-card">
      <div className="container px-4 py-6">
        <div className="flex items-center gap-4">
          <MessageSquare className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Opes Messenger
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Our secure messaging system uses industry-standard encryption protocols to protect your communications. 
              Messages are encrypted in transit and stored securely on our servers with restricted access controls.
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm text-primary">
              <Shield className="h-4 w-4" />
              <span>Platform-secured messaging</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}