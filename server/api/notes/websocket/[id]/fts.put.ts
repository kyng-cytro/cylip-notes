import { extensions } from "@/lib/tiptap";
import { renderToHTMLString } from "@tiptap/static-renderer";

export default defineWebsocketEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }
  const db = useDrizzle();
  try {
    const note = await db.query.note.findFirst({
      columns: { userId: true, title: true, content: true },
      where: eq(tables.note.id, id),
    });
    if (!note || !note.content) {
      throw createError({
        statusCode: 404,
        statusMessage: "Note not found.",
      });
    }
    const html = renderToHTMLString({ content: note.content, extensions });
    await db.run(sql`DELETE FROM note_fts WHERE note_id = ${id}`);
    await db.run(sql`
      INSERT INTO note_fts (note_id, user_id, title, content)
      VALUES (${id}, ${note.userId}, ${note.title}, ${html})
    `);
    return setResponseStatus(event, 200);
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error.",
    });
  }
});
