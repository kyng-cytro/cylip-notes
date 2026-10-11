export const NOTE_LOCK = {
  unlockTokenTtlSeconds: 60 * 60 * 12,
  maxFailedAttempts: 5,
  attemptWindow: 15 * 60 * 1000,
  keyIterations: 600_000,
  saltLength: 16,
  ivLength: 12,
} as const;
