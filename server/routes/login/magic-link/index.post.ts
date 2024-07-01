import { generateId } from "lucia";
import { generateName } from "@/lib/name-generator";
import { magicLinkLoginSchema } from "@/schemas/user";

export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(event, magicLinkLoginSchema.parse);
  const db = useDrizzle();
  try {
    const user = await db.query.userTable.findFirst({
      where: eq(tables.userTable.email, email),
    });
    if (user) {
      await sendMagicLink(user);
      return event.node.res.writeHead(200).end();
    }
    const id = generateId(15);
    const name = generateName(id);
    const [newUser] = await db
      .insert(tables.userTable)
      .values({
        id,
        email,
        name,
        joinedVia: "email",
      })
      .returning();
    if (!newUser) {
      throw createError({
        status: 400,
        message: "Could not create user",
      });
    }
    await sendMagicLink(newUser);
    return event.node.res.writeHead(200).end();
  } catch (e) {
    console.error({ e });
    throw createError({
      status: 400,
      message: "Something went wrong, please try again",
    });
  }
});
