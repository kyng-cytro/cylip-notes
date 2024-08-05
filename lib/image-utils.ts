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

export const isValidImage = (file: File) => {
  const isValidMimeType = file.type.includes("image");
  const extension = file.name.split(".").pop()?.toLowerCase();
  const isValidExtension = allowedExtensions.includes(extension || "");
  return isValidMimeType && isValidExtension;
};
