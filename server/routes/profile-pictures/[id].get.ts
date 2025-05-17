const getCachedImage = defineCachedFunction(
  async (id: string) => {
    const blob = await hubBlob().get(`profile-pictures/${id}`);
    if (!blob) {
      return null;
    }
    const arrayBuffer = await blob.arrayBuffer();
    return {
      type: blob.type,
      size: blob.size,
      data: Array.from(new Uint8Array(arrayBuffer)),
    };
  },
  {
    getKey: (id) => id,
    name: "profile-picture-data",
    maxAge: 60 * 60 * 24 * 365 * 10,
  },
);

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    setResponseStatus(event, 404);
    return "Not Found";
  }
  const data = await getCachedImage(id);
  if (!data) {
    setResponseStatus(event, 404);
    return "Not Found";
  }
  const buffer = Buffer.from(data.data);
  setHeader(event, "Content-Type", data.type);
  setHeader(event, "Content-Length", data.size);
  setHeader(event, "Cache-Control", "public, max-age=31536000");
  setHeader(event, "Content-Security-Policy", "default-src 'none';");
  return buffer;
});
