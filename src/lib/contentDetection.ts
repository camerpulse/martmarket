// Content detection utility for flagging off-platform communication attempts
import { supabase } from '@/integrations/supabase/client';

export interface DetectedContent {
  type: 'email' | 'phone' | 'telegram' | 'crypto_address' | 'external_contact';
  content: string;
  position: number;
}

// Regex patterns for detecting various contact methods
const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b|(?:\+?[1-9]\d{0,3}[-.\s]?)?\(?[0-9]{2,4}\)?[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}\b/g,
  telegram: /@[a-zA-Z0-9_]{5,32}\b|(?:telegram\.me\/|t\.me\/)[a-zA-Z0-9_]{5,32}/g,
  crypto_address: {
    bitcoin: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b|bc1[a-z0-9]{39,59}\b/g,
    ethereum: /\b0x[a-fA-F0-9]{40}\b/g,
    monero: /\b4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}\b/g,
    litecoin: /\b[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}\b/g,
  },
  external_contact: /\b(?:whatsapp|signal|discord|skype|wickr|session|element|riot)\b/gi
};

export function detectOffPlatformContent(text: string): DetectedContent[] {
  const detected: DetectedContent[] = [];

  // Check for emails
  const emails = text.match(PATTERNS.email);
  if (emails) {
    emails.forEach(email => {
      const position = text.indexOf(email);
      detected.push({ type: 'email', content: email, position });
    });
  }

  // Check for phone numbers
  const phones = text.match(PATTERNS.phone);
  if (phones) {
    phones.forEach(phone => {
      const position = text.indexOf(phone);
      detected.push({ type: 'phone', content: phone, position });
    });
  }

  // Check for Telegram usernames
  const telegrams = text.match(PATTERNS.telegram);
  if (telegrams) {
    telegrams.forEach(telegram => {
      const position = text.indexOf(telegram);
      detected.push({ type: 'telegram', content: telegram, position });
    });
  }

  // Check for crypto addresses
  Object.entries(PATTERNS.crypto_address).forEach(([currency, pattern]) => {
    const addresses = text.match(pattern);
    if (addresses) {
      addresses.forEach(address => {
        const position = text.indexOf(address);
        detected.push({ type: 'crypto_address', content: `${currency}: ${address}`, position });
      });
    }
  });

  // Check for external contact platforms
  const externalContacts = text.match(PATTERNS.external_contact);
  if (externalContacts) {
    externalContacts.forEach(contact => {
      const position = text.indexOf(contact);
      detected.push({ type: 'external_contact', content: contact, position });
    });
  }

  return detected;
}

export async function flagContent(
  userId: string,
  detectedContent: DetectedContent[],
  messageId?: string,
  draftId?: string
): Promise<void> {
  if (detectedContent.length === 0) return;

  const flagEntries = detectedContent.map(item => ({
    user_id: userId,
    message_id: messageId || null,
    draft_id: draftId || null,
    flag_type: item.type,
    detected_content: item.content
  }));

  const { error } = await supabase
    .from('content_flags')
    .insert(flagEntries);

  if (error) {
    console.error('Error flagging content:', error);
  }
}

export function hasOffPlatformContent(text: string): boolean {
  return detectOffPlatformContent(text).length > 0;
}