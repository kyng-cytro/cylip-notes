import { generateId } from "lucia";
import { magicLinkLoginSchema } from "@/schemas/user";

export default defineEventHandler(async (event) => {
  const { email, name } = await readValidatedBody(
    event,
    magicLinkLoginSchema.parse,
  );
  const db = useDrizzle();
  try {
    const user = await db
      .select()
      .from(tables.userTable)
      .where(eq(tables.userTable.email, email));
    if (!user.length || !user[0]) {
      const id = generateId(15);
      await db.insert(tables.userTable).values({
        id,
        email,
        name: name ?? email,
      });
      sendMagicLink(id, email);
      return event.node.res.writeHead(200).end();
    }
    sendMagicLink(user[0].id, email);
    return event.node.res.writeHead(200).end();
  } catch (e) {
    console.error({ e });
    throw createError({
      status: 400,
      message: "Something went wrong",
    });
  }
});
