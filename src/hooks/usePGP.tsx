import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PGPKeyPair {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
}

export interface PGPMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  encrypted_content: string;
  created_at: string;
  is_read: boolean;
}

export const usePGP = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const generateKeyPair = useCallback(async (name: string, email: string, passphrase?: string) => {
    setLoading(true);
    try {
      console.log('🔄 Starting PGP key generation...', { name, email, hasPassphrase: !!passphrase });
      
      const { data, error } = await supabase.functions.invoke('pgp-generator', {
        body: {
          action: 'generate_keypair',
          name,
          email,
          passphrase
        }
      });

      console.log('📥 PGP function response:', { data, error });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`Function failed: ${error.message || JSON.stringify(error)}`);
      }

      if (!data || !data.success) {
        console.error('❌ Invalid response data:', data);
        throw new Error(data?.error || 'PGP function returned invalid data');
      }

      console.log('✅ PGP key generation successful');
      
      const fingerprint = await getKeyFingerprint(data.public_key);
      
      return {
        publicKey: data.public_key,
        privateKey: data.private_key,
        keyType: data.key_type,
        fingerprint
      };
    } catch (error: any) {
      console.error('💥 Error generating PGP key pair:', error);
      const errorMessage = error?.message || 'Failed to generate PGP key pair';
      toast.error(`PGP Generation Error: ${errorMessage}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const encryptMessage = useCallback(async (message: string, recipientId: string, orderId?: string) => {
    if (!user) throw new Error('User must be authenticated');
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pgp-encryption', {
        body: {
          action: 'encrypt_message',
          message,
          recipient_id: recipientId,
          order_id: orderId
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error encrypting message:', error);
      toast.error('Failed to encrypt message');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const decryptMessage = useCallback(async (encryptedMessage: string, privateKey: string, passphrase?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pgp-encryption', {
        body: {
          action: 'decrypt_message',
          encrypted_message: encryptedMessage,
          private_key: privateKey,
          passphrase
        }
      });

      if (error) throw error;
      return data.decrypted_message;
    } catch (error) {
      console.error('Error decrypting message:', error);
      toast.error('Failed to decrypt message');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const validatePublicKey = useCallback(async (publicKey: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pgp-tools', {
        body: {
          action: 'validate_public_key',
          public_key_armored: publicKey
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error validating public key:', error);
      toast.error('Failed to validate public key');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signMessage = useCallback(async (message: string, privateKey: string, passphrase?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pgp-encryption', {
        body: {
          action: 'sign_message',
          message_to_sign: message,
          private_key_armored: privateKey,
          passphrase
        }
      });

      if (error) throw error;
      return data.signed_message;
    } catch (error) {
      console.error('Error signing message:', error);
      toast.error('Failed to sign message');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifySignature = useCallback(async (signedMessage: string, publicKey: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pgp-encryption', {
        body: {
          action: 'verify_signature',
          signed_message: signedMessage,
          public_key_armored: publicKey
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error verifying signature:', error);
      toast.error('Failed to verify signature');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveKeyPair = useCallback(async (publicKey: string, privateKeyEncrypted: string, fingerprint: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { error } = await supabase
        .from('pgp_keys')
        .insert({
          user_id: user.id,
          public_key: publicKey,
          private_key_encrypted: privateKeyEncrypted,
          key_fingerprint: fingerprint
        });

      if (error) throw error;

      // Also update MFA settings
      await supabase
        .from('mfa_settings')
        .upsert({
          user_id: user.id,
          pgp_public_key: publicKey,
          is_pgp_enabled: true
        });

      toast.success('PGP keys saved successfully');
    } catch (error) {
      console.error('Error saving PGP keys:', error);
      toast.error('Failed to save PGP keys');
      throw error;
    }
  }, [user]);

  const getUserPGPKeys = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('pgp_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user PGP keys:', error);
      return null;
    }
  }, [user]);

  const getKeyFingerprint = async (publicKey: string): Promise<string> => {
    try {
      const validation = await validatePublicKey(publicKey);
      return validation.fingerprint || '';
    } catch {
      return '';
    }
  };

  const downloadKeyPair = useCallback((publicKey: string, privateKey: string, name: string) => {
    // Download public key
    const publicBlob = new Blob([publicKey], { type: 'text/plain' });
    const publicUrl = URL.createObjectURL(publicBlob);
    const publicLink = document.createElement('a');
    publicLink.href = publicUrl;
    publicLink.download = `${name}_public_key.asc`;
    publicLink.click();
    URL.revokeObjectURL(publicUrl);

    // Download private key
    const privateBlob = new Blob([privateKey], { type: 'text/plain' });
    const privateUrl = URL.createObjectURL(privateBlob);
    const privateLink = document.createElement('a');
    privateLink.href = privateUrl;
    privateLink.download = `${name}_private_key.asc`;
    privateLink.click();
    URL.revokeObjectURL(privateUrl);

    toast.success('PGP keys downloaded successfully');
  }, []);

  return {
    loading,
    generateKeyPair,
    encryptMessage,
    decryptMessage,
    validatePublicKey,
    signMessage,
    verifySignature,
    saveKeyPair,
    getUserPGPKeys,
    downloadKeyPair
  };
};