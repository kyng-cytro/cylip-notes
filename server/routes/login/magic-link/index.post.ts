import { generateId } from "lucia";
import { generateName } from "@/lib/name-generator";
import { magicLinkLoginSchema } from "@/schemas/user";

export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(event, magicLinkLoginSchema.parse);
  const db = useDrizzle();
  try {
    const user = await db
      .select()
      .from(tables.userTable)
      .where(eq(tables.userTable.email, email));
    if (!user.length || !user[0]) {
      const id = generateId(15);
      const name = generateName(id);
      const user = await db
        .insert(tables.userTable)
        .values({
          id,
          email,
          name,
          joinedVia: "email",
        })
        .returning();
      if (!user.length || !user[0]) {
        throw createError({
          status: 500,
        });
      }
      await registerSubscriber(user[0]);
      sendMagicLink(id);
      return event.node.res.writeHead(200).end();
    }
    sendMagicLink(user[0].id);
    return event.node.res.writeHead(200).end();
  } catch (e) {
    console.error({ e });
    throw createError({
      status: 500,
      message: "Something went wrong",
    });
  }
});
