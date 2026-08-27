/** Encrypt/Decrypt - presidio-anonymizer/.../operators/encrypt.py + aes_cipher.py */
export const OPERATOR_NAME = "encrypt" as const;
export const KEY = "key" as const;

export interface EncryptParams {
  key: string | Uint8Array;
  [k: string]: unknown;
}

function getKeyBytes(key: string | Uint8Array): Uint8Array {
  if (key instanceof Uint8Array) return key;
  return new TextEncoder().encode(key);
}

export function isValidKeySize(key: Uint8Array): boolean {
  const bits = key.length * 8;
  return bits === 128 || bits === 192 || bits === 256;
}

// AES-CBC PKCS7 iv16 - ตรง presidio-anonymizer/.../aes_cipher.py:12 (byte-identical)
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

async function aesEncrypt(keyBytes: Uint8Array, text: string): Promise<string> {
  const bits = keyBytes.length * 8;
  const iv = randomBytes(16);
  const cipher = createCipheriv(`aes-${bits}-cbc`, keyBytes, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const combined = Buffer.concat([iv, encrypted]);
  return combined.toString("base64url");
}

async function aesDecrypt(keyBytes: Uint8Array, token: string): Promise<string> {
  const combined = Buffer.from(token, "base64url");
  const iv = combined.subarray(0, 16);
  const ct = combined.subarray(16);
  const bits = keyBytes.length * 8;
  const decipher = createDecipheriv(`aes-${bits}-cbc`, keyBytes, iv);
  const decrypted = Buffer.concat([decipher.update(ct), decipher.final()]);
  return decrypted.toString("utf8");
}

/** @example operate("secret", {key:"0123456789abcdef"}) // base64url */
export async function operate(text: string, params: EncryptParams): Promise<string> {
  const kb = getKeyBytes(params[KEY]);
  return aesEncrypt(kb, text);
}

export async function decryptOperate(text: string, params: EncryptParams): Promise<string> {
  const kb = getKeyBytes(params[KEY]);
  return aesDecrypt(kb, text);
}

export function validate(params: EncryptParams): void {
  const k = params[KEY];
  if (k === undefined) throw new Error("key required");
  const kb = getKeyBytes(k as string | Uint8Array);
  if (!isValidKeySize(kb)) throw new Error("key must be 128/192/256 bits");
}

export class Encrypt {
  async operate(text: string, params: EncryptParams) { return operate(text, params); }
  validate(params: EncryptParams) { return validate(params); }
  operatorName() { return OPERATOR_NAME; }
}
export class Decrypt {
  async operate(text: string, params: EncryptParams) { return decryptOperate(text, params); }
  validate(params: EncryptParams) { return validate(params); }
  operatorName() { return "decrypt"; }
}
