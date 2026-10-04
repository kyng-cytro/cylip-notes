const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";

export const generateId = (length: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let id = "";
  for (const byte of bytes) {
    if (byte < 252) id += alphabet[byte % alphabet.length];
  }
  return id.length === length ? id : id + generateId(length - id.length);
};
