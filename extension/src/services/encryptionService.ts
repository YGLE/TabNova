/**
 * encryptionService.ts
 * AES-256-GCM encryption via WebCrypto API (Chrome Extension compatible).
 */

/** Derives an AES-256-GCM key from a password using PBKDF2. */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password) as Uint8Array<ArrayBuffer>,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as Uint8Array<ArrayBuffer>, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
}

/** Generates a random 16-byte salt. */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/** Generates a random 12-byte IV for AES-GCM. */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/** Encrypts a UTF-8 string, returning base64-encoded ciphertext and IV. */
export async function encrypt(
  data: string,
  key: CryptoKey,
): Promise<{ ciphertext: string; iv: string }> {
  const enc = new TextEncoder();
  const iv = generateIV();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as Uint8Array<ArrayBuffer> },
    key,
    enc.encode(data) as Uint8Array<ArrayBuffer>,
  );
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

/** Decrypts a base64-encoded ciphertext using the provided IV and key. */
export async function decrypt(ciphertext: string, iv: string, key: CryptoKey): Promise<string> {
  const dec = new TextDecoder();
  const ivBuf = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
  const dataBuf = Uint8Array.from(
    atob(ciphertext),
    (c) => c.charCodeAt(0),
  ) as Uint8Array<ArrayBuffer>;
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBuf }, key, dataBuf);
  return dec.decode(decrypted);
}

/** Exports a CryptoKey as a base64 string (for storage). */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/** Imports a CryptoKey from a base64 string. */
export async function importKey(keyStr: string): Promise<CryptoKey> {
  const keyBuf = Uint8Array.from(atob(keyStr), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', keyBuf, 'AES-GCM', true, ['encrypt', 'decrypt']);
}
