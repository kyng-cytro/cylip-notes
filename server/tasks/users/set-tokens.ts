export default defineTask({
  meta: {
    name: "users:set-tokens",
    description: "Sets users tokens monthly based on account type",
  },
  async run() {
    const db = useDrizzle();
    await Promise.all([
      db
        .update(tables.user)
        .set({ tokens: 100 })
        .where(eq(tables.user.accountType, "free")),
      db
        .update(tables.user)
        .set({ tokens: 1000 })
        .where(eq(tables.user.accountType, "premium")),
    ]);
    return { result: `Ran successfully` };
  },
});
