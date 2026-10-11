import { BLOB_PREFIXES } from "@/constants";
import { blob } from "hub:blob";

export const putProfilePicture = async (userId: string, file: File) => {
  ensureBlob(file, { maxSize: "1MB", types: ["image"] });
  await blob.put(userId, file, {
    addRandomSuffix: false,
    prefix: BLOB_PREFIXES.profilePictures,
  });
  await useStorage("cache").removeItem(
    `nitro:functions:${BLOB_PREFIXES.profilePictures}:${userId}.json`,
  );
  return `${useRuntimeConfig().public.baseUrl}/${BLOB_PREFIXES.profilePictures}/${userId}?v=${Date.now()}`;
};

export const getProfilePicture = defineCachedFunction(
  async (userId: string) => {
    const file = await blob.get(`${BLOB_PREFIXES.profilePictures}/${userId}`);
    if (!file) return null;
    return {
      type: file.type,
      data: Array.from(new Uint8Array(await file.arrayBuffer())),
    };
  },
  {
    name: BLOB_PREFIXES.profilePictures,
    getKey: (userId) => userId,
    maxAge: 60 * 60 * 24 * 365,
  },
);
