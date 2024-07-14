export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Invalid or missing id",
    });
  }
  requestClientRefresh(id);
  return event.node.res.writeHead(200).end();
});
