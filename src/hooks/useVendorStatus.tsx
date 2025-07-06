import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useVendorStatus() {
  const { user } = useAuth();
  const [isVendor, setIsVendor] = useState(false);
  const [hasActiveBond, setHasActiveBond] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      checkVendorStatus();
    } else {
      setIsVendor(false);
      setHasActiveBond(false);
      setVendorProfile(null);
      setLoading(false);
    }
  }, [user]);

  const checkVendorStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Check if user has vendor profile
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('vendor_id', user.id)
        .single();

      if (!vendorError && vendorData) {
        setIsVendor(true);
        setVendorProfile(vendorData);
        
        // Check for active bonds separately
        const { data: bondsData } = await supabase
          .from('vendor_bonds')
          .select('*')
          .eq('vendor_id', user.id)
          .eq('is_active', true);
        
        setHasActiveBond(bondsData && bondsData.length > 0);
      } else {
        setIsVendor(false);
        setHasActiveBond(false);
        setVendorProfile(null);
      }
    } catch (error) {
      console.error('Error checking vendor status:', error);
      setIsVendor(false);
      setHasActiveBond(false);
      setVendorProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    isVendor,
    hasActiveBond,
    vendorProfile,
    loading,
    refreshStatus: checkVendorStatus
  };
}