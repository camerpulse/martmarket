import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Download, 
  Eye, 
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Scale,
  User,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Dispute {
  id: string;
  buyer_id: string;
  vendor_id: string;
  order_id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  amount_disputed_btc: number;
  created_at: string;
  resolved_at: string | null;
  orders?: {
    id: string;
    products?: {
      title: string;
    };
  };
  profiles?: {
    display_name: string;
  };
}

export const ComprehensiveDisputeManagement = () => {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          orders!inner(id, products(title)),
          profiles!disputes_buyer_id_fkey(display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setDisputes(data as any || []);
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

  const updateDisputeStatus = async (disputeId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus.startsWith('resolved_')) {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolution_notes = resolutionNotes;
      }

      const { error } = await supabase
        .from('disputes')
        .update(updateData)
        .eq('id', disputeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Dispute status updated successfully",
      });

      loadDisputes();
      setDetailsDialogOpen(false);
      setResolutionNotes('');
    } catch (error) {
      console.error('Error updating dispute:', error);
      toast({
        title: "Error",
        description: "Failed to update dispute status",
        variant: "destructive",
      });
    }
  };

  const escalateDispute = async (disputeId: string) => {
    try {
      const { error } = await supabase
        .from('disputes')
        .update({ 
          status: 'escalated',
          escalated_at: new Date().toISOString(),
          priority: 'high'
        })
        .eq('id', disputeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Dispute escalated successfully",
      });

      loadDisputes();
    } catch (error) {
      console.error('Error escalating dispute:', error);
      toast({
        title: "Error",
        description: "Failed to escalate dispute",
        variant: "destructive",
      });
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = 
      dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: 'destructive' as const, icon: AlertTriangle },
      escalated: { variant: 'destructive' as const, icon: AlertTriangle },
      'awaiting_buyer_response': { variant: 'secondary' as const, icon: Clock },
      'awaiting_vendor_response': { variant: 'secondary' as const, icon: Clock },
      'resolved_favor_buyer': { variant: 'default' as const, icon: CheckCircle },
      'resolved_favor_vendor': { variant: 'default' as const, icon: CheckCircle },
      'resolved_partial_refund': { variant: 'default' as const, icon: Scale },
      'resolved_dismissed': { variant: 'secondary' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, icon: AlertTriangle };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'secondary' as const, className: 'text-blue-600' },
      medium: { variant: 'secondary' as const, className: 'text-yellow-600' },
      high: { variant: 'destructive' as const, className: 'text-red-600' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;

    return (
      <Badge variant={config.variant} className={config.className}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getDisputeStats = () => {
    const total = disputes.length;
    const open = disputes.filter(d => d.status === 'open').length;
    const escalated = disputes.filter(d => d.status === 'escalated').length;
    const resolved = disputes.filter(d => d.status.startsWith('resolved_')).length;

    return { total, open, escalated, resolved };
  };

  const stats = getDisputeStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Disputes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Escalated</p>
                <p className="text-2xl font-bold text-orange-600">{stats.escalated}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Dispute Management
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => loadDisputes()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search disputes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Disputes</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="awaiting_buyer_response">Awaiting Buyer</SelectItem>
                <SelectItem value="awaiting_vendor_response">Awaiting Vendor</SelectItem>
                <SelectItem value="resolved_favor_buyer">Resolved - Buyer</SelectItem>
                <SelectItem value="resolved_favor_vendor">Resolved - Vendor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Disputes Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount (BTC)</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading disputes...
                    </TableCell>
                  </TableRow>
                ) : filteredDisputes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No disputes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDisputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell className="font-mono text-sm">
                        {dispute.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {dispute.title}
                      </TableCell>
                      <TableCell>
                        {dispute.profiles?.display_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {dispute.orders?.products?.title || 'Unknown Product'}
                      </TableCell>
                      <TableCell className="font-mono">
                        {dispute.amount_disputed_btc?.toFixed(8) || '0.00000000'}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(dispute.priority)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(dispute.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(dispute.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {dispute.status === 'open' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => escalateDispute(dispute.id)}
                            >
                              Escalate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dispute Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Dispute Details & Resolution</DialogTitle>
            <DialogDescription>
              Review and resolve this dispute
            </DialogDescription>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Dispute ID</Label>
                  <p className="font-mono text-sm">{selectedDispute.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  {getStatusBadge(selectedDispute.status)}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="font-semibold">{selectedDispute.title}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm bg-muted p-3 rounded-lg">{selectedDispute.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p>{selectedDispute.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  {getPriorityBadge(selectedDispute.priority)}
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount Disputed</Label>
                  <p className="font-mono">{selectedDispute.amount_disputed_btc?.toFixed(8) || '0.00000000'} BTC</p>
                </div>
              </div>

              {!selectedDispute.status.startsWith('resolved_') && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-semibold">Resolve Dispute</h4>
                  <div>
                    <Label htmlFor="resolution-notes">Resolution Notes</Label>
                    <Textarea
                      id="resolution-notes"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Enter resolution details..."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => updateDisputeStatus(selectedDispute.id, 'resolved_favor_buyer')}
                      variant="outline"
                    >
                      Resolve - Favor Buyer
                    </Button>
                    <Button 
                      onClick={() => updateDisputeStatus(selectedDispute.id, 'resolved_favor_vendor')}
                      variant="outline"
                    >
                      Resolve - Favor Vendor
                    </Button>
                    <Button 
                      onClick={() => updateDisputeStatus(selectedDispute.id, 'resolved_partial_refund')}
                      variant="outline"
                    >
                      Partial Refund
                    </Button>
                    <Button 
                      onClick={() => updateDisputeStatus(selectedDispute.id, 'resolved_dismissed')}
                      variant="outline"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};