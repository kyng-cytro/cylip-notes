import type { Editor } from "@tiptap/vue-3";
import imageCompression, { type Options } from "browser-image-compression";

const allowedExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "tiff"];

const compressImage = async (file: File, options: Options = {}) => {
  return await imageCompression(file, options);
};

const getUrl = async (file: File): Promise<string | ArrayBuffer | null> => {
  const fileReader = new FileReader();
  fileReader.readAsDataURL(file);
  return new Promise((resolve) => {
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
  });
};

export const getDataUrl = async (
  file: File,
  options = { compress: true, sizeLimit: CONSTANTS.imageSizeLimit }, // Defualt 300kb
): Promise<string | ArrayBuffer | null> => {
  if (!file) return null;
  const result = options.compress
    ? await compressImage(file, CONSTANTS.imageCompressionOptions)
    : file;
  if (result.size > options.sizeLimit) throw new Error("File too large.");
  return await getUrl(result);
};

const isValidImage = (file: File) => {
  const isValidMimeType = file.type.includes("image");
  const extension = file.name.split(".").pop()?.toLowerCase();
  const isValidExtension = allowedExtensions.includes(extension || "");
  return isValidMimeType && isValidExtension;
};

export const imagePreProcessChecks = (
  editor: Editor,
  files: File[],
): { valid: true; file: File } | { valid: false; message: string } => {
  // Cheking if the file list is empty
  if (!files.length || !files[0])
    return { valid: false, message: "No file found." };
  // Cheking if the file list has more than one file
  if (files.length > 1)
    return { valid: false, message: "You can only upload one file at a time." };
  // Cheking if any of the files is not an image
  if (files.some((file) => !isValidImage(file)))
    return {
      valid: false,
      message: "Only image files are allowed.",
    };
  // Cheking if the user is not logged in
  const { user } = useUser();
  if (!user.value) return { valid: false, message: "User not found." };
  // Cheking if the user has reached the max image limit
  const images = editor.$nodes("image");
  const max = CONSTANTS.maxImagePerNote[user.value.accountType];
  if (images && images.length >= max)
    return {
      valid: false,
      message: `Notes under the ${user.value.accountType} plan can only have ${max} image at a time.`,
    };
  return { valid: true, file: files[0] };
};
