import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Eye, Gavel } from 'lucide-react';

export const ComprehensiveDisputeManagement = () => {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error) {
      console.error('Error loading disputes:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Dispute Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dispute ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.map((dispute: any) => (
              <TableRow key={dispute.id}>
                <TableCell className="font-mono text-sm">
                  {dispute.id.slice(0, 8)}...
                </TableCell>
                <TableCell>{dispute.dispute_type}</TableCell>
                <TableCell>
                  <Badge>{dispute.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{dispute.priority}</Badge>
                </TableCell>
                <TableCell>{new Date(dispute.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};