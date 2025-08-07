import * as openpgp from 'openpgp';
import { supabase } from '@/integrations/supabase/client';

export interface PGPKeyPair {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
}

export interface UserPGPKey {
  id: string;
  key_name: string;
  public_key: string;
  encrypted_private_key?: string;
  key_fingerprint: string;
  is_default: boolean;
}

/**
 * Generate a new PGP key pair
 */
export async function generatePGPKeyPair(
  name: string,
  email: string,
  passphrase: string
): Promise<PGPKeyPair> {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: 'rsa',
    rsaBits: 2048,
    userIDs: [{ name, email }],
    passphrase,
    format: 'armored'
  });

  const key = await openpgp.readKey({ armoredKey: publicKey });
  const fingerprint = key.getFingerprint();

  return {
    publicKey,
    privateKey,
    fingerprint
  };
}

/**
 * Encrypt a message using recipient's public key
 */
export async function encryptMessage(
  message: string,
  recipientPublicKey: string
): Promise<string> {
  const publicKey = await openpgp.readKey({ armoredKey: recipientPublicKey });
  
  const encrypted = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: message }),
    encryptionKeys: publicKey,
    format: 'armored'
  });

  return encrypted as string;
}

/**
 * Decrypt a message using user's private key
 */
export async function decryptMessage(
  encryptedMessage: string,
  privateKeyArmored: string,
  passphrase: string
): Promise<string> {
  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
    passphrase
  });

  const message = await openpgp.readMessage({ armoredMessage: encryptedMessage });
  
  const { data: decrypted } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey,
    format: 'utf8'
  });

  return decrypted as string;
}

/**
 * Save PGP key pair to database
 */
export async function savePGPKeyPair(
  keyName: string,
  keyPair: PGPKeyPair,
  passphrase: string,
  isDefault: boolean = false
): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  // Encrypt private key for storage
  const encryptedPrivateKey = await encryptPrivateKeyForStorage(keyPair.privateKey, passphrase);

  const { error } = await supabase
    .from('user_pgp_keys')
    .insert({
      user_id: user.id,
      key_name: keyName,
      public_key: keyPair.publicKey,
      encrypted_private_key: encryptedPrivateKey,
      key_fingerprint: keyPair.fingerprint,
      is_default: isDefault
    });

  if (error) throw error;
}

/**
 * Get user's PGP keys
 */
export async function getUserPGPKeys(): Promise<UserPGPKey[]> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_pgp_keys')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get recipient's public key by user ID
 */
export async function getRecipientPublicKey(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_pgp_keys')
    .select('public_key')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();

  if (error || !data) return null;
  return data.public_key;
}

/**
 * Encrypt private key for secure storage
 */
async function encryptPrivateKeyForStorage(privateKey: string, passphrase: string): Promise<string> {
  // For simplicity, we'll use the same passphrase for storage encryption
  // In production, you might want to use a different storage encryption method
  return privateKey; // The private key is already encrypted with the passphrase
}

/**
 * Verify PGP message signature (if implemented)
 */
export async function verifyMessageSignature(
  message: string,
  signature: string,
  senderPublicKey: string
): Promise<boolean> {
  try {
    const publicKey = await openpgp.readKey({ armoredKey: senderPublicKey });
    const messageObj = await openpgp.createMessage({ text: message });
    const signatureObj = await openpgp.readSignature({ armoredSignature: signature });

    const verificationResult = await openpgp.verify({
      message: messageObj,
      signature: signatureObj,
      verificationKeys: publicKey
    });

    const firstSignature = verificationResult.signatures[0];
    return firstSignature ? await firstSignature.verified : false;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}