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
  let counter = 0;
  let previousId = "";
  const eventStream = createEventStream(event);

  // check for changes every interval
  const t0 = setInterval(async () => {
    const { chanaged, newId } = await checkForChanges(id, previousId);
    if (chanaged) {
      previousId = newId;
      eventStream.push({ id: `${counter++}`, event: "refresh", data: newId });
    } else {
      eventStream.push({
        id: `${counter++}`,
        event: "stall",
        data: "nothing changed",
      });
    }
  }, parseInt(interval));

  // listen for changes close
  eventStream.onClosed(async () => {
    clearInterval(t0);
    await eventStream.close();
  });

  eventStream.push({
    id: `${counter++}`,
    event: "connection",
    data: "connected",
  });

  return eventStream.send();
});
