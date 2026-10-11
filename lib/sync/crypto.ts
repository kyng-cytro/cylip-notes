import { NOTE_LOCK } from "@/constants";
import { fromBase64, toBase64 } from "./protocol";

type Bytes = Uint8Array<ArrayBuffer>;

export type Sealed = { iv: Bytes; data: Bytes };

export const randomBytes = (length: number) =>
  crypto.getRandomValues(new Uint8Array(length));

export const deriveKey = async (password: string, salt: Bytes) => {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: NOTE_LOCK.keyIterations,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
};

export const exportKey = async (key: CryptoKey) =>
  toBase64(new Uint8Array(await crypto.subtle.exportKey("raw", key)));

export const importKey = (raw: string) =>
  crypto.subtle.importKey("raw", fromBase64(raw), "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);

export const encrypt = async (
  key: CryptoKey,
  data: Uint8Array,
): Promise<Sealed> => {
  const iv = randomBytes(NOTE_LOCK.ivLength);
  const sealed = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new Uint8Array(data),
  );
  return { iv, data: new Uint8Array(sealed) };
};

export const decrypt = async (key: CryptoKey, { iv, data }: Sealed) =>
  new Uint8Array(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data),
  );
