import { IMAGE_CLEANUP_GRACE_DAYS } from "@/constants";
import { subDays } from "date-fns";

export default defineTask({
  meta: {
    name: "notes:clear-images",
    description: "Deletes note images that no note uses anymore",
  },
  async run() {
    const cutoff = subDays(new Date(), IMAGE_CLEANUP_GRACE_DAYS);
    const [images, used] = await Promise.all([
      listNoteImages(),
      findUsedNoteImages(),
    ]);
    const unused = images
      .filter((image) => new Date(image.uploadedAt) < cutoff)
      .map((image) => image.pathname)
      .filter((pathname) => !used.has(pathname));
    if (unused.length) await deleteNoteImages(unused);
    return { result: `Deleted ${unused.length} unused note images` };
  },
});
