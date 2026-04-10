import { describe, it, expect } from 'vitest';
import {
  deriveKey,
  encrypt,
  decrypt,
  exportKey,
  importKey,
  generateSalt,
  generateIV,
} from './encryptionService';

describe('encryptionService', () => {
  it('generateSalt returns 16 bytes', () => {
    const salt = generateSalt();
    expect(salt).toBeInstanceOf(Uint8Array);
    expect(salt.byteLength).toBe(16);
  });

  it('generateIV returns 12 bytes', () => {
    const iv = generateIV();
    expect(iv).toBeInstanceOf(Uint8Array);
    expect(iv.byteLength).toBe(12);
  });

  it('derives a key from password and salt', async () => {
    const salt = generateSalt();
    const key = await deriveKey('my-password', salt);
    expect(key).toBeDefined();
    expect(key.type).toBe('secret');
    expect(key.algorithm.name).toBe('AES-GCM');
  });

  it('encrypts and decrypts a string correctly', async () => {
    const salt = generateSalt();
    const key = await deriveKey('test-password', salt);
    const plaintext = 'Hello, TabNova!';

    const { ciphertext, iv } = await encrypt(plaintext, key);
    expect(ciphertext).not.toBe(plaintext);

    const result = await decrypt(ciphertext, iv, key);
    expect(result).toBe(plaintext);
  });

  it('different IV produces different ciphertext for same plaintext', async () => {
    const salt = generateSalt();
    const key = await deriveKey('test-password', salt);
    const plaintext = 'same data';

    const first = await encrypt(plaintext, key);
    const second = await encrypt(plaintext, key);

    // IVs should differ (random), leading to different ciphertexts
    expect(first.iv).not.toBe(second.iv);
    expect(first.ciphertext).not.toBe(second.ciphertext);
  });

  it('exports and imports key correctly', async () => {
    const salt = generateSalt();
    const originalKey = await deriveKey('export-test', salt);

    const exported = await exportKey(originalKey);
    expect(typeof exported).toBe('string');
    expect(exported.length).toBeGreaterThan(0);

    const importedKey = await importKey(exported);
    expect(importedKey.type).toBe('secret');
    expect(importedKey.algorithm.name).toBe('AES-GCM');

    // Verify the imported key works correctly
    const plaintext = 'round-trip test';
    const { ciphertext, iv } = await encrypt(plaintext, importedKey);
    const decrypted = await decrypt(ciphertext, iv, importedKey);
    expect(decrypted).toBe(plaintext);
  });

  it('wrong key fails to decrypt', async () => {
    const salt = generateSalt();
    const correctKey = await deriveKey('correct-password', salt);
    const wrongKey = await deriveKey('wrong-password', salt);

    const plaintext = 'secret data';
    const { ciphertext, iv } = await encrypt(plaintext, correctKey);

    await expect(decrypt(ciphertext, iv, wrongKey)).rejects.toThrow();
  });
});
