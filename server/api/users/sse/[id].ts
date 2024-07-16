const {
  serverSentEvents: { interval },
} = useRuntimeConfig();
export default defineAuthenticatedEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Invalid or missing id",
    });
  }
  if (id !== event.context.user!.id) {
    throw createError({
      statusCode: 403,
      message: "You are not authorized to access this resource",
    });
  }
  let previousId = "";
  const eventStream = createEventStream(event);
  const t0 = setInterval(async () => {
    const { chanaged, newId } = await checkForChanges(id, previousId);
    if (chanaged) {
      previousId = newId;
      eventStream.push(`refetch: ${previousId}`);
    }
  }, parseInt(interval));
  eventStream.onClosed(async () => {
    clearInterval(t0);
    await eventStream.close();
  });
  return eventStream.send();
});
