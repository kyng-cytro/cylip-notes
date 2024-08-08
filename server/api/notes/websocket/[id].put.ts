import { noteWebsocketPutSchema } from "@/schemas/note";

export default defineWebsocketEventHandler(async (event) => {
  const { jsonContent, uint8Content } = await readValidatedBody(
    event,
    noteWebsocketPutSchema.parse,
  );
  console.log({ jsonContent, uint8Content });
  return { jsonContent, uint8Content };
});
