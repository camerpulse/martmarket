import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, AlertTriangle } from 'lucide-react';

export const ComprehensiveSecurityManagement = () => {
  const { toast } = useToast();
  const [securityEvents, setSecurityEvents] = useState([]);

  useEffect(() => {
    loadSecurityEvents();
  }, []);

  const loadSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSecurityEvents(data || []);
    } catch (error) {
      console.error('Error loading security events:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Type</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Threat Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {securityEvents.map((event: any) => (
              <TableRow key={event.id}>
                <TableCell>{event.event_type}</TableCell>
                <TableCell>
                  <Badge variant={event.event_level === 'critical' ? 'destructive' : 'default'}>
                    {event.event_level}
                  </Badge>
                </TableCell>
                <TableCell>{event.threat_score}/10</TableCell>
                <TableCell>
                  <Badge variant={event.is_resolved ? 'default' : 'destructive'}>
                    {event.is_resolved ? 'Resolved' : 'Open'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(event.created_at).toLocaleDateString()}</TableCell>
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