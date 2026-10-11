import { LIMITS } from "@/constants";
export const hasFinePointer = () =>
  window.matchMedia("(pointer: fine)").matches;

export const hasEnoughContent = (content: string | null) =>
  (content?.length ?? 0) >= LIMITS.minContentLength;

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
