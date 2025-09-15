export const CONSTANTS = {
  imageSizeLimit: 300000,
  profileImageSizeLimit: 1000000,
  imageCompressionOptions: {
    maxSizeMB: 0.01,
    maxWidthOrHeight: 1920,
  },
  imageFileTypes: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "video/mp4",
    "video/webm",
    "image/webp",
    "image/svg+xml",
  ],
  rates: {
    title: 1,
    refine: 5,
    suggest: 3,
  },
  maxFreeLables: 3,
  maxImagePerNote: {
    free: 1,
    premium: 3,
  },
};

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export const capitalize = (text: string) => {
  return text
    .replaceAll("-", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getTwoChars = (text: string) => {
  const split = text.split(" ");
  if (split[0] && split[1]) {
    return split[0].charAt(0) + split[1].charAt(0);
  }
  return text.slice(0, 2);
};

export const getFilterConfig = (status: string, labelId?: string) => {
  const filterMap: Record<string, (note: Note) => boolean> = {
    active: (note) => {
      if (labelId && labelId !== "all-notes") {
        return (
          !note.trashed &&
          !note.archived &&
          !note.pinned &&
          note.labelId === labelId
        );
      }
      return !note.trashed && !note.archived && !note.pinned;
    },
    pinned: (note) => !note.trashed && !note.archived && note.pinned,
    trashed: (note) => note.trashed,
    archived: (note) => note.archived,
    reminders: (note) => !!note.reminderAt,
  };
  return filterMap[status] || (() => false);
};

export const getToggleConfig = (note: Note, prop: string) => {
  const { pinned, trashed, archived, options } = note;
  const toggleMap: Record<
    string,
    { body: Record<string, any>; message: string }
  > = {
    preview: {
      body: {
        field: "options",
        value: { ...options, preview: !options?.preview },
      },
      message: note.options?.preview ? "preview disabled" : "preview enabled",
    },
    public: {
      body: {
        field: "options",
        value: {
          ...options,
          public: {
            ...options?.public,
            enabled: !options?.public?.enabled,
          },
        },
      },
      message: options?.public ? "is now private" : "is now public",
    },
    pinned: {
      body: { field: "pinned", value: !note.pinned },
      message: pinned ? "unpinned" : "pinned",
    },
    trashed: {
      body: { field: "trashed", value: !note.trashed },
      message: trashed ? "restored" : "trashed",
    },
    archived: {
      body: { field: "archived", value: !note.archived },
      message: archived ? "unarchived" : "archived",
    },
  };
  return toggleMap[prop] || { body: {}, message: "" };
};
