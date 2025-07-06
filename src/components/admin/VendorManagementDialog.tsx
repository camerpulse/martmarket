import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Ban, UserX, Eye, Edit, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  status: string;
  verification_status: string;
  created_at: string;
  is_banned?: boolean;
  ban_reason?: string;
  business_description?: string;
}

interface VendorManagementDialogProps {
  vendor: Vendor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVendorUpdated: () => void;
}

export function VendorManagementDialog({ vendor, open, onOpenChange, onVendorUpdated }: VendorManagementDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState(vendor?.business_name || '');
  const [businessDescription, setBusinessDescription] = useState(vendor?.business_description || '');
  const [status, setStatus] = useState(vendor?.status || 'pending');
  const [verificationStatus, setVerificationStatus] = useState(vendor?.verification_status || 'pending');
  const [banReason, setBanReason] = useState(vendor?.ban_reason || '');

  const handleUpdateVendor = async () => {
    if (!vendor) return;
    
    setLoading(true);
    try {
      const supabaseClient = supabase as any;
      const { error } = await supabaseClient
        .from('vendor_profiles')
        .update({
          business_name: businessName,
          business_description: businessDescription,
          status: status,
          verification_status: verificationStatus
        })
        .eq('user_id', vendor.user_id);

      if (error) throw error;

      toast({
        title: "Vendor Updated",
        description: "Vendor profile has been updated successfully.",
      });
      
      onVendorUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async () => {
    if (!vendor) return;

    setLoading(true);
    try {
      const supabaseClient = supabase as any;
      const { error } = await supabaseClient
        .from('vendor_profiles')
        .update({
          status: 'approved',
          verification_status: 'verified'
        })
        .eq('user_id', vendor.user_id);

      if (error) throw error;

      toast({
        title: "Vendor Approved",
        description: `${vendor.business_name} has been approved successfully.`,
      });
      
      onVendorUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error approving vendor:', error);
      toast({
        title: "Error",
        description: "Failed to approve vendor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectVendor = async () => {
    if (!vendor || !banReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this vendor.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const supabaseClient = supabase as any;
      const { error } = await supabaseClient
        .from('vendor_profiles')
        .update({
          status: 'rejected',
          verification_status: 'rejected',
          ban_reason: banReason
        })
        .eq('user_id', vendor.user_id);

      if (error) throw error;

      toast({
        title: "Vendor Rejected",
        description: `${vendor.business_name} application has been rejected.`,
      });
      
      onVendorUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      toast({
        title: "Error",
        description: "Failed to reject vendor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanVendor = async () => {
    if (!vendor || !banReason.trim()) {
      toast({
        title: "Ban Reason Required",
        description: "Please provide a reason for banning this vendor.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const currentUser = await supabase.auth.getUser();
      const supabaseClient = supabase as any;
      
      const { error } = await supabaseClient
        .from('vendor_profiles')
        .update({
          is_banned: true,
          ban_reason: banReason,
          banned_at: new Date().toISOString(),
          banned_by: currentUser.data.user?.id,
          status: 'banned'
        })
        .eq('user_id', vendor.user_id);

      if (error) throw error;

      // Also create a ban record
      await supabaseClient
        .from('user_bans')
        .insert({
          user_id: vendor.user_id,
          banned_by: currentUser.data.user?.id,
          ban_reason: `Vendor banned: ${banReason}`
        });

      toast({
        title: "Vendor Banned",
        description: `${vendor.business_name} has been banned.`,
      });
      
      onVendorUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error banning vendor:', error);
      toast({
        title: "Error",
        description: "Failed to ban vendor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanVendor = async () => {
    if (!vendor) return;

    setLoading(true);
    try {
      const supabaseClient = supabase as any;
      const { error } = await supabaseClient
        .from('vendor_profiles')
        .update({
          is_banned: false,
          ban_reason: null,
          banned_at: null,
          banned_by: null,
          status: 'approved'
        })
        .eq('user_id', vendor.user_id);

      if (error) throw error;

      toast({
        title: "Vendor Unbanned",
        description: `${vendor.business_name} has been unbanned.`,
      });
      
      onVendorUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error unbanning vendor:', error);
      toast({
        title: "Error",
        description: "Failed to unban vendor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!vendor) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'banned': return 'destructive';
      default: return 'secondary';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Manage Vendor: {vendor.business_name}
          </DialogTitle>
          <DialogDescription>
            View and manage vendor account details and verification status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vendor Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium text-sm">Status</p>
                <Badge variant={getStatusColor(vendor.status)}>
                  {vendor.status?.charAt(0).toUpperCase() + vendor.status?.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium text-sm">Verification</p>
                <Badge variant={getVerificationColor(vendor.verification_status)}>
                  {vendor.verification_status?.charAt(0).toUpperCase() + vendor.verification_status?.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {vendor.is_banned && vendor.ban_reason && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Ban Reason:</p>
              <p className="text-sm text-red-600 dark:text-red-400">{vendor.ban_reason}</p>
            </div>
          )}

          {/* Edit Vendor Details */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business name"
              />
            </div>

            <div>
              <Label htmlFor="businessDescription">Business Description</Label>
              <Textarea
                id="businessDescription"
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="Business description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="verificationStatus">Verification</Label>
                <Select value={verificationStatus} onValueChange={setVerificationStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reason Input (for rejection/banning) */}
            {(vendor.status === 'pending' || !vendor.is_banned) && (
              <div>
                <Label htmlFor="banReason">Rejection/Ban Reason</Label>
                <Textarea
                  id="banReason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Reason for rejection or banning..."
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleUpdateVendor}
              disabled={loading}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Update
            </Button>
            
            {vendor.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleApproveVendor}
                  disabled={loading}
                  className="flex-1 text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRejectVendor}
                  disabled={loading || !banReason.trim()}
                  className="flex-1 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            
            {vendor.is_banned ? (
              <Button
                variant="outline"
                onClick={handleUnbanVendor}
                disabled={loading}
                className="flex-1 text-green-600 hover:bg-green-50"
              >
                <UserX className="h-4 w-4 mr-2" />
                Unban
              </Button>
            ) : (
              vendor.status !== 'pending' && (
                <Button
                  variant="outline"
                  onClick={handleBanVendor}
                  disabled={loading || !banReason.trim()}
                  className="flex-1 text-red-600 hover:bg-red-50"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Ban
                </Button>
              )
            )}
          </div>
          
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}