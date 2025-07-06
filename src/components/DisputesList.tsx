import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Clock, 
  MessageSquare,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Dispute {
  id: string;
  order_id: string;
  category: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  amount_disputed_btc: number | null;
  created_at: string;
  updated_at: string;
  resolution_deadline: string | null;
  orders: {
    products: {
      title: string;
    };
  };
  dispute_messages: { id: string }[];
}

interface DisputesListProps {
  onDisputeSelect?: (disputeId: string) => void;
  userType?: 'buyer' | 'vendor';
}

const formatDisputeStatus = (status: string) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
    'open': { label: 'Open', variant: 'destructive' },
    'under_review': { label: 'Under Review', variant: 'secondary' },
    'awaiting_buyer_response': { label: 'Awaiting Buyer', variant: 'outline' },
    'awaiting_vendor_response': { label: 'Awaiting Vendor', variant: 'outline' },
    'escalated': { label: 'Escalated', variant: 'destructive' },
    'resolved_favor_buyer': { label: 'Resolved - Buyer', variant: 'default' },
    'resolved_favor_vendor': { label: 'Resolved - Vendor', variant: 'default' },
    'resolved_mutual': { label: 'Resolved - Mutual', variant: 'default' },
    'closed_no_action': { label: 'Closed', variant: 'secondary' }
  };
  
  return statusMap[status] || { label: status, variant: 'outline' as const };
};

const formatCategory = (category: string) => {
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'text-red-500';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-yellow-500';
    case 'low': return 'text-green-500';
    default: return 'text-muted-foreground';
  }
};

export function DisputesList({ onDisputeSelect, userType }: DisputesListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (user) {
      loadDisputes();
    }
  }, [user]);

  const loadDisputes = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let query = supabase
        .from('disputes')
        .select(`
          *,
          orders!inner(
            products!inner(title)
          ),
          dispute_messages(id)
        `)
        .order('created_at', { ascending: false });

      // Filter by user type
      if (userType === 'buyer') {
        query = query.eq('buyer_id', user.id);
      } else if (userType === 'vendor') {
        query = query.eq('vendor_id', user.id);
      } else {
        // Show all disputes where user is involved
        query = query.or(`buyer_id.eq.${user.id},vendor_id.eq.${user.id}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDisputes(data || []);

    } catch (error) {
      console.error('Error loading disputes:', error);
      toast({
        title: "Error",
        description: "Failed to load disputes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.orders.products.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || dispute.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getUniqueCategories = () => {
    const categories = [...new Set(disputes.map(d => d.category))];
    return categories.map(cat => ({ value: cat, label: formatCategory(cat) }));
  };

  const getUniqueStatuses = () => {
    const statuses = [...new Set(disputes.map(d => d.status))];
    return statuses.map(status => ({ value: status, label: formatDisputeStatus(status).label }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Loading disputes...</div>
          <div className="text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Disputes</h2>
          <p className="text-muted-foreground">
            Manage and track order disputes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredDisputes.length} dispute{filteredDisputes.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search disputes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {getUniqueStatuses().map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disputes List */}
      {filteredDisputes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">No Disputes Found</h3>
            <p className="text-muted-foreground">
              {disputes.length === 0 
                ? "You don't have any disputes yet."
                : "No disputes match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((dispute) => {
            const statusInfo = formatDisputeStatus(dispute.status);
            const isUrgent = dispute.priority === 'urgent' || dispute.priority === 'high';
            const isOverdue = dispute.resolution_deadline && 
              new Date(dispute.resolution_deadline) < new Date() && 
              !dispute.status.startsWith('resolved_');

            return (
              <Card 
                key={dispute.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isUrgent ? 'border-destructive/50' : ''
                }`}
                onClick={() => onDisputeSelect?.(dispute.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">{dispute.title}</h3>
                        <Badge variant={statusInfo.variant} className="shrink-0">
                          {statusInfo.label}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive" className="shrink-0">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>Product: {dispute.orders.products.title}</span>
                        <span>•</span>
                        <span>Category: {formatCategory(dispute.category)}</span>
                        <span>•</span>
                        <span className={getPriorityColor(dispute.priority)}>
                          {dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)} Priority
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {dispute.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(dispute.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {dispute.dispute_messages.length} message{dispute.dispute_messages.length !== 1 ? 's' : ''}
                        </div>
                        {dispute.resolution_deadline && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Deadline: {new Date(dispute.resolution_deadline).toLocaleDateString()}
                          </div>
                        )}
                        {dispute.amount_disputed_btc && (
                          <div className="font-mono">
                            {dispute.amount_disputed_btc} BTC
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}