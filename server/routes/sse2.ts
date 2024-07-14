export default defineEventHandler(async (event) => {
  const eventStream = createEventStream(event);

  const interval = setInterval(async () => {
    await eventStream.push(`Message @ ${new Date().toLocaleTimeString()}`);
  }, 10000);

  const sendEvent = async () => {
    console.log(`Sending event`);
    await eventStream.push(`Message @ ${new Date().toISOString()}`);
  };

  sseHooks.hook(`sse:event:1`, sendEvent);

  eventStream.onClosed(async () => {
    clearInterval(interval);
    await eventStream.close();
  });

  return eventStream.send();
});
