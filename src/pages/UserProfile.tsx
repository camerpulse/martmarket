import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Shield, Key, Bell, Bitcoin, Copy, Trash2 } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  user_type: string;
  two_factor_enabled: boolean | null;
  pgp_public_key: string | null;
  created_at: string;
  updated_at: string;
}

interface PGPKey {
  id: string;
  key_name: string;
  public_key: string;
  key_fingerprint: string | null;
  is_default: boolean | null;
  created_at: string;
}

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pgpKeys, setPgpKeys] = useState<PGPKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    pgp_public_key: '',
    two_factor_enabled: false,
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadPGPKeys();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      console.log('Loading profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create one
          console.log('No profile found, creating new profile...');
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              user_type: 'buyer', // Default to buyer
              display_name: user.email?.split('@')[0] || 'Anonymous User',
              two_factor_enabled: false,
            })
            .select()
            .single();

          if (createError) throw createError;
          
          setProfile(newProfile);
          setFormData({
            display_name: newProfile.display_name || '',
            pgp_public_key: newProfile.pgp_public_key || '',
            two_factor_enabled: newProfile.two_factor_enabled || false,
          });
          
          toast.success('Profile created successfully');
          return;
        }
        throw error;
      }

      console.log('Profile loaded:', data);
      setProfile(data);
      setFormData({
        display_name: data.display_name || '',
        pgp_public_key: data.pgp_public_key || '',
        two_factor_enabled: data.two_factor_enabled || false,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error(`Failed to load profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPGPKeys = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_pgp_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPgpKeys(data || []);
    } catch (error) {
      console.error('Error loading PGP keys:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const deletePGPKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('user_pgp_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      toast.success('PGP key deleted successfully');
      loadPGPKeys(); // Reload keys
    } catch (error) {
      console.error('Error deleting PGP key:', error);
      toast.error('Failed to delete PGP key');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      console.log('Updating profile for user:', user.id);
      console.log('Update data:', {
        display_name: formData.display_name || null,
        pgp_public_key: formData.pgp_public_key || null,
        two_factor_enabled: formData.two_factor_enabled,
      });

      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name || null,
          pgp_public_key: formData.pgp_public_key || null,
          two_factor_enabled: formData.two_factor_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select();

      console.log('Update result:', { data, error });

      if (error) throw error;

      if (data && data.length === 0) {
        console.log('No rows updated - profile might not exist');
        toast.error('Profile not found. Please refresh and try again.');
        return;
      }

      toast.success('Profile updated successfully');
      loadProfile(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Please Login</h2>
            <p className="text-muted-foreground">
              You need to be logged in to view your profile.
            </p>
            <Button asChild className="mt-4">
              <Link to="/auth">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">User Profile</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">
                  {formData.display_name || 'Anonymous User'}
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {user.email}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Type</span>
                  <Badge variant={profile.user_type === 'vendor' ? 'default' : 'secondary'}>
                    {profile.user_type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Member Since</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">2FA Status</span>
                  <Badge variant={formData.two_factor_enabled ? 'default' : 'secondary'}>
                    {formData.two_factor_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>

              {profile.user_type === 'buyer' && (
                <>
                  <Separator />
                  <div className="text-center">
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/vendor/register">
                        <Bitcoin className="h-4 w-4 mr-2" />
                        Become a Vendor
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Settings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Profile Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Basic Information</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        type="text"
                        placeholder="Enter your display name"
                        value={formData.display_name}
                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This name will be visible to other users.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Security Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>Security Settings</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                        <p className="text-xs text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        checked={formData.two_factor_enabled}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, two_factor_enabled: checked })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="pgp_key">PGP Public Key (Optional)</Label>
                      <Textarea
                        id="pgp_key"
                        placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----
Your PGP public key here...
-----END PGP PUBLIC KEY BLOCK-----"
                        value={formData.pgp_public_key}
                        onChange={(e) => setFormData({ ...formData, pgp_public_key: e.target.value })}
                        rows={6}
                        className="mt-1 font-mono text-xs"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Add your PGP public key for encrypted communications.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={loadProfile}>
                    Reset Changes
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* PGP Keys Section */}
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Saved PGP Keys</span>
                </CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/pgp-tools">
                    <Key className="h-4 w-4 mr-2" />
                    Manage Keys
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pgpKeys.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No PGP Keys Found</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't saved any PGP keys yet. Use our PGP Tools to generate and manage your keys.
                  </p>
                  <Button asChild>
                    <Link to="/pgp-tools">
                      <Key className="h-4 w-4 mr-2" />
                      Generate PGP Keys
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pgpKeys.map((key) => (
                    <div key={key.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{key.key_name}</h4>
                          {key.is_default && (
                            <Badge variant="default" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(key.public_key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePGPKey(key.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {key.key_fingerprint && (
                        <p className="text-sm text-muted-foreground mb-2 font-mono">
                          Fingerprint: {key.key_fingerprint}
                        </p>
                      )}
                      
                      <div className="bg-muted rounded p-3">
                        <p className="text-xs font-mono break-all">
                          {key.public_key.substring(0, 100)}...
                        </p>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(key.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;