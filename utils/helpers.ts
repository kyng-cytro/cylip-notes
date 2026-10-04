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
    "image/webp",
    "image/svg+xml",
  ],
  rates: {
    title: 1,
    refine: 5,
    suggest: 3,
  },
  maxFreeLabels: 3,
  minContentLength: 10,
  maxImagePerNote: {
    free: 1,
    premium: 3,
  },
  maxSharedPeople: {
    free: 1,
    premium: 5,
  },
};

export const hasEnoughContent = (content: string | null) =>
  (content?.length ?? 0) >= CONSTANTS.minContentLength;

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
