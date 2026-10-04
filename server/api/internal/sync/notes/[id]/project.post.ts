import { fromBase64 } from "@/lib/sync/protocol";
import { slugify } from "@/utils/helpers";
import * as Y from "yjs";
import { z } from "zod";

const bodySchema = z.object({ state: z.string().min(1) });

const decodeNoteDoc = (state: string) => {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, fromBase64(state));
  return readNoteDoc(doc);
};

const getAudience = async (noteId: string, ownerId: string) => {
  const members = await useDrizzle().query.noteMember.findMany({
    columns: { userId: true },
    where: eq(tables.noteMember.noteId, noteId),
  });
  return [ownerId, ...members.map((member) => member.userId)];
};

export default defineSyncEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const { state } = await readValidatedBody(event, bodySchema.parse);
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
    .returning({ userId: tables.note.userId });
  if (!note) throw createError({ statusCode: 404 });
  return { audience: await getAudience(id, note.userId) };
});
