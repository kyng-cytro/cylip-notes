export const CONSTANTS = {
  imageSizeLimit: 300000,
  imageCompressionOptions: {
    maxSizeMB: 0.01,
    maxWidthOrHeight: 1920,
  },
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
  const toggleMap: Record<
    string,
    { body: Record<string, any>; message: string }
  > = {
    preview: {
      body: {
        field: "options",
        value: { ...note.options, preview: !note.options?.preview },
      },
      message: note.options?.preview ? "preview disabled" : "preview enabled",
    },
    public: {
      body: {
        field: "options",
        value: { ...note.options, public: !note.options?.public },
      },
      message: note.options?.public ? "is now private" : "is now public",
    },
    pinned: {
      body: { field: "pinned", value: !note.pinned },
      message: note.pinned ? "unpinned" : "pinned",
    },
    trashed: {
      body: { field: "trashed", value: !note.trashed },
      message: note.trashed ? "restored" : "trashed",
    },
    archived: {
      body: { field: "archived", value: !note.archived },
      message: note.archived ? "unarchived" : "archived",
    },
  };
  return toggleMap[prop] || { body: {}, message: "" };
};
