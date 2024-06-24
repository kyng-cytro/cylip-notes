export default defineEventHandler(async (event) => {
  try {
    const users = await useDrizzle().select().from(tables.userTable);
    return { users };
  } catch (e: any) {
    console.log(e);
    return { error: e.message };
  }
});
