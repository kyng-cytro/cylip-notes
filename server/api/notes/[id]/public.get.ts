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
  const note = await useDrizzle().query.note.findFirst({
    where: and(
      eq(tables.note.id, id),
      sql`json_extract(${tables.note.options}, '$.public.enabled') = true`,
    ),
  });
  if (!note) throw createError({ statusCode: 404, message: "Note not found." });
  if (!isBot(getHeader(event, "user-agent") ?? "")) await countVisit(id);
  return {
    title: note.title,
    content: note.content,
    updatedAt: note.updatedAt,
    visits: note.options?.public.vists ?? 0,
    background: note.options?.background,
  };
});
