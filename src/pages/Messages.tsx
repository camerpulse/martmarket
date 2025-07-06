import { MessagingInterface } from '@/components/MessagingInterface';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Messages() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageCircle className="h-8 w-8" />
              Secure Messages
            </h1>
            <p className="text-muted-foreground">
              End-to-end encrypted communications with buyers and vendors
            </p>
          </div>
        </div>

        {/* Messaging Interface */}
        <MessagingInterface />
      </div>
    </div>
  );
}