const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";

export const generateId = (length: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let id = "";
  // 252 is the largest multiple of 36 below 256, rejecting above it avoids modulo bias.
  for (const byte of bytes) {
    if (byte < 252) id += alphabet[byte % alphabet.length];
  }
  return id.length === length ? id : id + generateId(length - id.length);
};
