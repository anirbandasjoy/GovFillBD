const encoder = new TextEncoder();
const decoder = new TextDecoder();
const algorithm = 'AES-GCM';
const iterations = 250_000;

export type EncryptedPayload = {
  version: 1;
  algorithm: 'AES-GCM';
  kdf: 'PBKDF2-SHA-256';
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
};

export async function encryptJson(value: unknown, passphrase: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: algorithm, iv: toArrayBuffer(iv) }, key, encoder.encode(JSON.stringify(value)));

  return {
    version: 1,
    algorithm,
    kdf: 'PBKDF2-SHA-256',
    iterations,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext))
  };
}

export async function decryptJson<T>(payload: EncryptedPayload, passphrase: string): Promise<T> {
  const key = await deriveAesKey(passphrase, fromBase64(payload.salt));
  const plaintext = await crypto.subtle.decrypt(
    { name: algorithm, iv: toArrayBuffer(fromBase64(payload.iv)) },
    key,
    toArrayBuffer(fromBase64(payload.ciphertext))
  );
  return JSON.parse(decoder.decode(plaintext)) as T;
}

async function deriveAesKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: toArrayBuffer(salt),
      iterations
    },
    material,
    { name: algorithm, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
