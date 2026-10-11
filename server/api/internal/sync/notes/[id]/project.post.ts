import { fromBase64 } from "@/lib/sync/protocol";
import { slugify } from "@/utils/helpers";
import * as Y from "yjs";
import { z } from "zod";

const bodySchema = z.object({
  state: z.string().min(1),
  editors: z.array(z.string()).default([]),
});

const decodeNoteDoc = (state: string) => {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, fromBase64(state));
  return readNoteDoc(doc);
};

export default defineSyncEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const { state, editors } = await readValidatedBody(event, bodySchema.parse);
  const { meta, content } = decodeNoteDoc(state);
  const [note] = await useDrizzle()
    .update(tables.note)
    .set({
      title: meta.title || null,
      slug: meta.title ? slugify(meta.title) : null,
      content,
      trashed: meta.trashed,
      trashedAt: meta.trashedAt ? new Date(meta.trashedAt) : null,
      options: sql`json_set(coalesce(${tables.note.options}, '{}'), '$.public.enabled', json(${JSON.stringify(meta.public)}), '$.background', json(${JSON.stringify(meta.background)}))`,
    })
    .where(eq(tables.note.id, id))
    .returning({ id: tables.note.id });
  if (!note) throw createError({ statusCode: 404 });
  await recordNoteVersion(id, { title: meta.title || null, content }, editors);
  const audience = await getNoteAudience(id);
  const lock = await getNoteLock(id);
  if (lock) {
    await publishNoteLock(id, audience, {
      lockedAt: lock.lockedAt.getTime(),
      meta,
    });
  }
  return { audience };
});
