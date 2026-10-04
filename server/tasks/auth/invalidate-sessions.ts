export default defineTask({
  meta: {
    name: "auth:invalidate-sessions",
    description: "Invalidate expired or selected sessions",
  },
  async run(event) {
    const db = useDrizzle();
    const { sessionId, userId } = (event.payload ?? {}) as {
      sessionId?: string;
      userId?: string;
    };
    if (sessionId) {
      await db.delete(tables.session).where(eq(tables.session.id, sessionId));
      return { result: `Invalidated session ${sessionId}` };
    }
    if (userId) {
      await db.delete(tables.session).where(eq(tables.session.userId, userId));
      return { result: `Invalidated user ${userId} sessions` };
    }
    const expired = await db
      .delete(tables.session)
      .where(lt(tables.session.expiresAt, new Date()))
      .returning({ id: tables.session.id });
    return { result: `Invalidated ${expired.length} expired sessions` };
  },
});
