import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminStatus = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const checkAdminStatus = async () => {
      try {
        console.log('Checking admin status for user:', user.id);
        const { data, error } = await supabase
          .from('admin_profiles')
          .select('admin_role, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        console.log('Admin check result:', { data, error });
        
        if (error || !data) {
          console.log('No admin profile found or error occurred');
          setIsAdmin(false);
        } else {
          console.log('User is admin with role:', data.admin_role);
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};