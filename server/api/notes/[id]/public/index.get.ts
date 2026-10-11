const isBot = (userAgent: string) =>
  /bot|crawl|spider|preview/i.test(userAgent);

const countVisit = (noteId: string) =>
  useDrizzle()
    .update(tables.note)
    .set({
      options: sql`json_set(${tables.note.options}, '$.public.vists', coalesce(json_extract(${tables.note.options}, '$.public.vists'), 0) + 1)`,
    })
    .where(eq(tables.note.id, noteId));

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const note = await findPublicNote(id);
  const locked = !!(await getNoteLock(id));
  if (!isBot(getHeader(event, "user-agent") ?? "")) await countVisit(id);
  return {
    title: note.title,
    content: locked ? null : note.content,
    locked,
    updatedAt: note.updatedAt,
    visits: note.options?.public.vists ?? 0,
    background: note.options?.background,
  };
});
