import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

export default function Messages() {
  console.log('Messages component is loading...');
  
  const { user } = useAuth();
  
  console.log('Current user:', user);

  // Authentication check
  if (!user) {
    console.log('No user found, showing login prompt');
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

  console.log('User authenticated, showing messages interface');
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="border-b bg-card">
        <div className="container px-4 py-6">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Opes Messenger
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Our secure messaging system uses industry-standard encryption protocols to protect your communications. 
            Messages are encrypted in transit and stored securely on our servers with restricted access controls.
          </p>
        </div>
      </div>
      
      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Messages System</h2>
            <p className="text-muted-foreground mb-4">
              This is a simplified version to test if the page loads correctly.
            </p>
            <p className="text-sm text-green-600">
              ✅ Page is loading successfully! User ID: {user.id}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}