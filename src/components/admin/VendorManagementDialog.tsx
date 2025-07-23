import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Store, Eye } from 'lucide-react';

interface VendorManagementDialogProps {
  open: boolean;
  onClose: () => void;
}

export const VendorManagementDialog = ({ open, onClose }: VendorManagementDialogProps) => {
  const { toast } = useToast();
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    if (open) {
      loadVendors();
    }
  }, [open]);

  const loadVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Vendor Management
          </DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor: any) => (
              <TableRow key={vendor.user_id}>
                <TableCell>{vendor.business_name}</TableCell>
                <TableCell>{vendor.display_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{vendor.business_type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={vendor.verification_status === 'verified' ? 'default' : 'secondary'}>
                    {vendor.verification_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={vendor.is_active ? 'default' : 'secondary'}>
                    {vendor.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};