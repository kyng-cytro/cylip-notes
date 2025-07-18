export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }
  const db = useDrizzle();
  const ua = getHeader(event, "user-agent") || "";
  try {
    const note = await db.query.note.findFirst({
      where: and(
        eq(tables.note.id, id),
        sql`json_extract(options, '$.public.enabled') = true`,
      ),
    });
    if (!note) {
      throw createError({
        statusCode: 404,
        statusMessage: "Note not found.",
      });
    }
    if (!/bot|crawl|spider|preview/i.test(ua)) {
      await db
        .update(tables.note)
        .set({
          options: sql`json_set(options, '$.public.vists', COALESCE(json_extract(options, '$.public.vists'), 0) + 1)`,
        })
        .where(eq(tables.note.id, id));
    }
    return {
      title: note.title,
      content: note.content,
      updatedAt: note.updatedAt,
      createdAt: note.createdAt,
      vists: note.options?.public.vists,
      background: note.options?.background,
    };
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error.",
    });
  }
});
