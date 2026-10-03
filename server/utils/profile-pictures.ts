import { blob } from "hub:blob";

const PREFIX = "profile-pictures";

export const putProfilePicture = async (userId: string, file: File) => {
  ensureBlob(file, { maxSize: "1MB", types: ["image"] });
  await blob.put(userId, file, { addRandomSuffix: false, prefix: PREFIX });
  await useStorage("cache").removeItem(
    `nitro:functions:${PREFIX}:${userId}.json`,
  );
  return `${useRuntimeConfig().public.baseUrl}/${PREFIX}/${userId}?v=${Date.now()}`;
};

export const getProfilePicture = defineCachedFunction(
  async (userId: string) => {
    const file = await blob.get(`${PREFIX}/${userId}`);
    if (!file) return null;
    return {
      type: file.type,
      data: Array.from(new Uint8Array(await file.arrayBuffer())),
    };
  },
  { name: PREFIX, getKey: (userId) => userId, maxAge: 60 * 60 * 24 * 365 },
);
