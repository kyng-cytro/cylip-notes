export default defineTask({
  meta: {
    name: "auth:invalidate-sessions",
    description: "Invalidate in active or selected sessions",
  },
  async run(event) {
    const lucia = initializeLucia();
    const { sessionId, userId } = event.payload as {
      sessionId: string;
      userId: string;
    };
    if (sessionId) {
      await lucia.invalidateSession(sessionId);
      return { result: `Invalidated session ${sessionId}` };
    }
    if (userId) {
      await lucia.invalidateUserSessions(userId);
      return { result: `Invalidated user ${userId} sessions` };
    }
    const db = useDrizzle();
    const sessions = await db.query.session.findMany({
      where: gt(tables.session.expiresAt, new Date().getTime()),
    });
    for (const session of sessions) {
      await lucia.invalidateSession(session.id);
    }
    return { result: `Invalidated ${sessions.length} expired sessions` };
  },
});
