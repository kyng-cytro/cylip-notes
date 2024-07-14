export default defineEventHandler(async (event) => {
  const { userId } = getQuery(event);
  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "Invalid or missing userId",
    });
  }
  setHeader(event, "cache-control", "no-cache");
  setHeader(event, "connection", "keep-alive");
  setHeader(event, "content-type", "text/event-stream");
  setResponseStatus(event, 200);
  let counter = 0;
  const sendEvent = (data: any) => {
    event.node.res.write(`id: ${++counter}\n`);
    event.node.res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  sendEvent({ type: "connected" });
  sseHooks.hook(`sse:event:${userId}`, sendEvent);
  event._handled = true;
});
