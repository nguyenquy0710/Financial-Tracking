import crypto from 'crypto';

import config from '@/config/config';

// Encryption configuration
export const ALGORITHM = config.totp.aesAlgorithm || 'aes-256-cbc';
export const ENCRYPTION_KEY = config.totp.encryptionKey; // Must be 32 bytes for aes-256
export const IV_LENGTH = 16;

/**
 * Encrypts the given text using AES-256-CBC algorithm.
 * @param text - The text to encrypt.
 * @returns The encrypted text.
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts the given text using AES-256-CBC algorithm.
 * @param text - The encrypted text to decrypt.
 * @returns The decrypted text or an empty string if decryption fails.
 */
export function decrypt(text: string): string {
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = parts.join(':');
    const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}
