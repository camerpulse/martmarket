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
  is_banned?: boolean;
  ban_reason?: string;
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
  const [banReason, setBanReason] = useState(user?.ban_reason || '');

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
      // Insert ban record (you may need to create a user_bans table)
      const { error } = await supabase
        .from('user_bans')
        .insert({
          user_id: user.user_id,
          banned_by: (await supabase.auth.getUser()).data.user?.id,
          ban_reason: banReason,
          banned_at: new Date().toISOString()
        });

      if (error) {
        // If table doesn't exist, you could update profiles with ban info
        console.warn('user_bans table may not exist, updating profiles instead');
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            is_banned: true,
            ban_reason: banReason
          })
          .eq('user_id', user.user_id);
        
        if (profileError) throw profileError;
      }

      toast({
        title: "User Banned",
        description: `User ${user.display_name} has been banned.`,
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
      // Remove ban record or update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          ban_reason: null
        })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: "User Unbanned",
        description: `User ${user.display_name} has been unbanned.`,
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
            <Badge variant={user.is_banned ? "destructive" : "default"}>
              {user.is_banned ? "Banned" : "Active"}
            </Badge>
          </div>

          {user.is_banned && user.ban_reason && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Ban Reason:</p>
              <p className="text-sm text-red-600 dark:text-red-400">{user.ban_reason}</p>
            </div>
          )}

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

            {/* Ban Reason Input (for banning) */}
            {!user.is_banned && (
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
            )}
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
            
            {user.is_banned ? (
              <Button
                variant="outline"
                onClick={handleUnbanUser}
                disabled={loading}
                className="flex-1 text-green-600 hover:bg-green-50"
              >
                <UserX className="h-4 w-4 mr-2" />
                Unban
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleBanUser}
                disabled={loading || !banReason.trim()}
                className="flex-1 text-red-600 hover:bg-red-50"
              >
                <Ban className="h-4 w-4 mr-2" />
                Ban User
              </Button>
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