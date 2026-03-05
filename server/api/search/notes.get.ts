import z from "zod";

export default defineAuthenticatedEventHandler(async (event) => {
  const { q } = await getValidatedQuery(
    event,
    z.object({ q: z.string().max(100).trim() }).parse,
  );
  const db = useDrizzle();
  try {
    const results = await db.all<{
      id: string;
      title: string;
      score: number;
      snippet: string;
    }>(sql`
      WITH fts_results AS (
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
        LIMIT 10
      ),
      fallback AS (
        SELECT
          n.id,
          n.title,
          9999 AS score,
          substr(note_fts.content, 1, 200) || '...' AS snippet
        FROM notes n
        JOIN note_fts ON note_fts.note_id = n.id
        WHERE n.user_id = ${event.context.user.id}
          AND n.id NOT IN (SELECT id FROM fts_results)
        ORDER BY n.updated_at DESC
        LIMIT (10 - (SELECT COUNT(*) FROM fts_results))
      )
      SELECT * FROM fts_results
      UNION ALL
      SELECT * FROM fallback
      LIMIT 10;
    `);
    return results;
  } catch (e) {
    console.error({ e });
    return [];
  }
});
