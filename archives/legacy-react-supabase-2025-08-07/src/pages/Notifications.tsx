import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, CheckCircle, AlertCircle, Info, Package, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Notification {
  id: string;
  type: 'order' | 'message' | 'system' | 'security';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

const Notifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Order Shipped',
      message: 'Your order #ORD-2024-001 has been shipped and is on its way.',
      timestamp: '2 hours ago',
      read: false,
      priority: 'medium'
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'You have received a new message from VendorTech regarding your inquiry.',
      timestamp: '4 hours ago',
      read: false,
      priority: 'high'
    },
    {
      id: '3',
      type: 'system',
      title: 'Account Verification',
      message: 'Your account has been successfully verified. You can now access all features.',
      timestamp: '1 day ago',
      read: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'security',
      title: 'Security Alert',
      message: 'New login detected from a different device. If this wasn\'t you, please secure your account.',
      timestamp: '2 days ago',
      read: true,
      priority: 'high'
    },
    {
      id: '5',
      type: 'order',
      title: 'Payment Confirmed',
      message: 'Your Bitcoin payment for order #ORD-2024-002 has been confirmed.',
      timestamp: '3 days ago',
      read: true,
      priority: 'low'
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast({
      title: "All notifications marked as read",
      description: "Your notification list has been updated.",
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-4 w-4" />;
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'security':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = (filter: string) => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === filter);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/shop">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              <span className="bitcoin-gradient">Notifications</span>
            </h1>
            <p className="text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="order">
              Orders ({notifications.filter(n => n.type === 'order').length})
            </TabsTrigger>
            <TabsTrigger value="message">
              Messages ({notifications.filter(n => n.type === 'message').length})
            </TabsTrigger>
            <TabsTrigger value="security">
              Security ({notifications.filter(n => n.type === 'security').length})
            </TabsTrigger>
          </TabsList>

          {(['all', 'unread', 'order', 'message', 'security'] as const).map(filter => (
            <TabsContent key={filter} value={filter} className="space-y-4">
              {filteredNotifications(filter).length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent className="space-y-4">
                    <div className="text-6xl">🔔</div>
                    <h2 className="text-2xl font-semibold">No notifications</h2>
                    <p className="text-muted-foreground">
                      {filter === 'unread' 
                        ? "You're all caught up! No unread notifications."
                        : `No ${filter === 'all' ? '' : filter} notifications to show.`
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications(filter).map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.read ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'security' ? 'bg-destructive/10 text-destructive' :
                          notification.type === 'message' ? 'bg-blue-500/10 text-blue-500' :
                          notification.type === 'order' ? 'bg-green-500/10 text-green-500' :
                          'bg-muted'
                        }`}>
                          {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{notification.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(notification.priority) as any}>
                                {notification.priority}
                              </Badge>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default Notifications;