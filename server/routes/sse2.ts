export default defineEventHandler(async (event) => {
  const eventStream = createEventStream(event);

  const sendEvent = (data: any) => {
    eventStream.push(JSON.stringify(data));
  };

  eventStream.onClosed(async () => {
    await eventStream.close();
  });

  sseHooks.hook(`sse:event:1`, sendEvent);

  return eventStream.send();
});
