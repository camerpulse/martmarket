import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

const WishlistButton = ({ 
  productId, 
  className, 
  variant = 'ghost',
  size = 'sm',
  showText = false 
}: WishlistButtonProps) => {
  const { user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [user, productId]);

  const checkWishlistStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsInWishlist(!!data);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add items to your wishlist');
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            product_id: productId
          });

        if (error) throw error;
        
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleWishlist}
      disabled={loading}
      className={cn(
        'transition-colors',
        isInWishlist && 'text-red-500 hover:text-red-600',
        className
      )}
    >
      {isInWishlist ? (
        <Heart className="h-4 w-4 fill-current" />
      ) : (
        <Heart className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">
          {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </Button>
  );
};

export default WishlistButton;