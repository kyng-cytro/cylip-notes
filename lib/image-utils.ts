import type { Editor } from "@tiptap/core";
import imageCompression from "browser-image-compression";

type ValidationResult =
  { valid: true; file: File } | { valid: false; message: string };

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "bmp", "tiff"];

const isImage = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (
    file.type.startsWith("image/") && ALLOWED_EXTENSIONS.includes(extension)
  );
};

const readAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const toCompressedDataUrl = async (file: File) => {
  const compressed = await imageCompression(
    file,
    CONSTANTS.imageCompressionOptions,
  );
  if (compressed.size > CONSTANTS.imageSizeLimit)
    throw new Error("File too large.");
  return readAsDataUrl(compressed);
};

export const validateImageFiles = (
  editor: Editor,
  files: File[],
): ValidationResult => {
  const [file] = files;
  if (!file) return { valid: false, message: "No file found." };
  if (files.length > 1)
    return { valid: false, message: "You can only upload one file at a time." };
  if (!isImage(file))
    return { valid: false, message: "Only image files are allowed." };
  const accountType = useUser().user.value?.accountType ?? "free";
  const max = CONSTANTS.maxImagePerNote[accountType];
  if ((editor.$nodes("image")?.length ?? 0) >= max) {
    return {
      valid: false,
      message: `Notes under the ${accountType} plan can only have ${max} image at a time.`,
    };
  }
  return { valid: true, file };
};
