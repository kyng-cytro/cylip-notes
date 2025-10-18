import { extensions } from "@/lib/tiptap";
import { noteWebsocketPutSchema } from "@/schemas/note";
import { renderToHTMLString } from "@tiptap/static-renderer";

export default defineWebsocketEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }

  const { content } = await readValidatedBody(
    event,
    noteWebsocketPutSchema.parse,
  );

  try {
    const db = useDrizzle();
    const data = {
      content,
    };

    const [note] = await db
      .update(tables.note)
      .set(data)
      .where(
        and(
          eq(tables.note.id, id),
          eq(tables.note.trashed, false),
          eq(tables.note.userId, event.context.user.id),
        ),
      )
      .returning();

    if (!note) {
      throw createError({
        statusCode: 404,
        message:
          "Failed to modify note. Note may not exist, or you don't have access to it.",
      });
    }

    // Update the fts table
    if (note.content) {
      const html = renderToHTMLString({ content: note.content, extensions });
      await db.run(sql`DELETE FROM note_fts WHERE note_id = ${note.id}`);
      await db.run(sql`
        INSERT INTO note_fts (note_id, user_id,title, content)
        VALUES (${note.id}, ${note.userId}, ${note.title}, ${html})
      `);
    }
    return setResponseStatus(event, 200);
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: `Failed to modify note. Note may not exist, or you don't have access to it.`,
    });
  }
});
