import z from "zod";

export default defineAuthenticatedEventHandler(async (event) => {
  const { q } = await getValidatedQuery(
    event,
    z.object({ q: z.string().max(100).trim() }).parse,
  );
  const db = useDrizzle();
  try {
    const { results } = (await db.run(sql`
      SELECT
        n.id,
        n.title,
        bm25(note_fts) AS score,
        snippet(note_fts, 3, '<mark>', '</mark>', '...', 20) AS snippet
      FROM note_fts
      JOIN notes AS n ON n.id = note_fts.note_id
      WHERE note_fts MATCH ${q}
        AND note_fts.user_id = ${event.context.user.id}
      ORDER BY score ASC
      LIMIT 10;
    `)) as {
      results: { id: string; title: string; score: number; snippet: string }[];
    };
    return results;
  } catch (e) {
    console.error({ e });
    return [];
  }
});
