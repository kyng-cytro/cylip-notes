export const ALL_NOTES = "all-notes";

export const SHARED_WITH_ME = "shared-with-me";

export const UNTITLED_NOTE = "Untitled note";

export const IMAGE_CLEANUP_GRACE_DAYS = 7;

export const SEARCH = { maxResults: 20, snippetRadius: 60 } as const;

export const NOTE_ROLES = ["owner", "editor", "viewer"] as const;

export const NOTE_VERSIONS = {
  kept: 6,
  sessionGap: 30 * 60 * 1000,
} as const;
