export const NOTE_LOCK = {
  unlockTokenTtlSeconds: 60 * 60 * 12,
  maxFailedAttempts: 5,
  attemptWindow: 15 * 60 * 1000,
  keyIterations: 600_000,
  saltLength: 16,
  ivLength: 12,
} as const;

export const NOTE_PASSKEY = {
  prfSalt: "cylip-notes/note-unlock/v1",
  challengeLength: 32,
  timeout: 60_000,
} as const;
