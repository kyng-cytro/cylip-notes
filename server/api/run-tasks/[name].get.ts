export default defineTaskEventHandler(async (event) => {
  const { name } = getRouterParams(event);
  if (!name) {
    throw createError({ statusCode: 400, message: "Invalid or missing name." });
  }
  const payload = { ...getQuery(event) };
  const { result } = await runTask(name, { payload });
  return { result };
});
