import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Ban, 
  UserCheck, 
  Shield, 
  Mail, 
  Calendar,
  Eye,
  Download,
  RefreshCw,
  MoreHorizontal,
  UserX,
  Key,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  user_id: string;
  display_name: string;
  user_type: string;
  created_at: string;
  is_banned?: boolean;
  ban_reason?: string;
  banned_at?: string;
  two_factor_enabled?: boolean;
  admin_profiles?: any[];
}

interface ComprehensiveUserManagementProps {
  onUserSelect?: (user: User) => void;
}

export const ComprehensiveUserManagement = ({ onUserSelect }: ComprehensiveUserManagementProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    display_name: '',
    user_type: 'buyer',
    is_banned: false,
    ban_reason: ''
  });

  // Admin form state  
  const [adminForm, setAdminForm] = useState({
    admin_role: 'support_agent',
    is_active: true,
    permissions: {}
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          admin_profiles!inner(admin_role, is_active)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setUsers(data as any || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      display_name: user.display_name || '',
      user_type: user.user_type,
      is_banned: user.is_banned || false,
      ban_reason: user.ban_reason || ''
    });
    setEditDialogOpen(true);
  };

  const handleMakeAdmin = (user: User) => {
    setSelectedUser(user);
    setAdminForm({
      admin_role: 'support_agent',
      is_active: true,
      permissions: {}
    });
    setAdminDialogOpen(true);
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name,
          user_type: editForm.user_type,
          is_banned: editForm.is_banned,
          ban_reason: editForm.is_banned ? editForm.ban_reason : null,
          banned_at: editForm.is_banned ? new Date().toISOString() : null
        })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setEditDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const saveAdminChanges = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('admin_profiles')
        .upsert({
          user_id: selectedUser.user_id,
          admin_role: adminForm.admin_role as "support_agent" | "admin" | "super_admin" | "moderator",
          is_active: adminForm.is_active,
          permissions: adminForm.permissions
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin privileges updated successfully",
      });

      setAdminDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating admin privileges:', error);
      toast({
        title: "Error",
        description: "Failed to update admin privileges",
        variant: "destructive",
      });
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['User ID', 'Display Name', 'Type', 'Created', 'Status', 'Admin'],
      ...users.map(user => [
        user.user_id,
        user.display_name || 'N/A',
        user.user_type,
        new Date(user.created_at).toLocaleDateString(),
        user.is_banned ? 'Banned' : 'Active',
        user.admin_profiles?.length > 0 ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'banned' && user.is_banned) ||
      (filterType === 'admin' && user.admin_profiles?.length > 0) ||
      (filterType === user.user_type);

    return matchesSearch && matchesFilter;
  });

  const getUserStats = () => {
    const total = users.length;
    const banned = users.filter(u => u.is_banned).length;
    const admins = users.filter(u => u.admin_profiles?.length > 0).length;
    const vendors = users.filter(u => u.user_type === 'vendor').length;
    const buyers = users.filter(u => u.user_type === 'buyer').length;

    return { total, banned, admins, vendors, buyers };
  };

  const stats = getUserStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Buyers</p>
                <p className="text-2xl font-bold">{stats.buyers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vendors</p>
                <p className="text-2xl font-bold">{stats.vendors}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Banned</p>
                <p className="text-2xl font-bold text-red-500">{stats.banned}</p>
              </div>
              <Ban className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => loadUsers()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportUsers} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="buyer">Buyers</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.display_name || 'Anonymous User'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.user_id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.user_type === 'vendor' ? 'default' : 'secondary'}>
                            {user.user_type}
                          </Badge>
                          {user.admin_profiles?.length > 0 && (
                            <Badge variant="outline">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.is_banned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {user.two_factor_enabled && (
                            <Key className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!user.admin_profiles?.length && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMakeAdmin(user)}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onUserSelect?.(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Modify user account details and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={editForm.display_name}
                onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="user_type">User Type</Label>
              <Select value={editForm.user_type} onValueChange={(value) => setEditForm({ ...editForm, user_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editForm.is_banned}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_banned: checked })}
              />
              <Label>Ban User</Label>
            </div>
            {editForm.is_banned && (
              <div>
                <Label htmlFor="ban_reason">Ban Reason</Label>
                <Textarea
                  id="ban_reason"
                  value={editForm.ban_reason}
                  onChange={(e) => setEditForm({ ...editForm, ban_reason: e.target.value })}
                  placeholder="Reason for banning this user..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveUserChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Dialog */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Admin Privileges</DialogTitle>
            <DialogDescription>
              Give this user admin access to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin_role">Admin Role</Label>
              <Select value={adminForm.admin_role} onValueChange={(value) => setAdminForm({ ...adminForm, admin_role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support_agent">Support Agent</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={adminForm.is_active}
                onCheckedChange={(checked) => setAdminForm({ ...adminForm, is_active: checked })}
              />
              <Label>Active Admin Status</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAdminChanges}>
              Grant Admin Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};