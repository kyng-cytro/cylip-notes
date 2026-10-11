export const LIMITS = {
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
