import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, Ban, UserX, Mail, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  user_id: string;
  display_name: string;
  user_type: string;
  created_at: string;
}

interface UserManagementDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function UserManagementDialog({ user, open, onOpenChange, onUserUpdated }: UserManagementDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [userType, setUserType] = useState(user?.user_type || 'buyer');
  const [banReason, setBanReason] = useState('');

  const handleUpdateUser = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          user_type: userType
        })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: "User Updated",
        description: "User profile has been updated successfully.",
      });
      
      onUserUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!user || !banReason.trim()) {
      toast({
        title: "Ban Reason Required",
        description: "Please provide a reason for banning this user.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // For now, we'll just show a message since the ban functionality requires database schema updates
      toast({
        title: "Ban Feature",
        description: "Ban functionality requires database setup. Contact system administrator.",
        variant: "destructive",
      });
      
      onUserUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Error",
        description: "Failed to ban user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // For now, we'll just show a message since the unban functionality requires database schema updates
      toast({
        title: "Unban Feature", 
        description: "Unban functionality requires database setup. Contact system administrator.",
        variant: "destructive",
      });
      
      onUserUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Error",
        description: "Failed to unban user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Manage User: {user.display_name}
          </DialogTitle>
          <DialogDescription>
            View and manage user account details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Status */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Account Status</p>
              <p className="text-sm text-muted-foreground">Current user status</p>
            </div>
            <Badge variant="default">
              Active
            </Badge>
          </div>

          {/* Edit User Details */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="User display name"
              />
            </div>

            <div>
              <Label htmlFor="userType">User Type</Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ban Reason Input */}
            <div>
              <Label htmlFor="banReason">Ban Reason (optional)</Label>
              <Textarea
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason for banning this user..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleUpdateUser}
              disabled={loading}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Update
            </Button>
            
            <Button
              variant="outline"
              onClick={handleBanUser}
              disabled={loading || !banReason.trim()}
              className="flex-1 text-red-600 hover:bg-red-50"
            >
              <Ban className="h-4 w-4 mr-2" />
              Ban User
            </Button>
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