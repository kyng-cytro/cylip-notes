import { generateId } from "lucia";
import { generateName } from "@/lib/name-generator";
import { magicLinkLoginSchema } from "@/schemas/user";

export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(event, magicLinkLoginSchema.parse);
  const db = useDrizzle();
  try {
    const user = await db.query.user.findFirst({
      where: eq(tables.user.email, email),
    });
    if (user) {
      await sendMagicLink(user);
      return setResponseStatus(event, 200);
    }
    const id = generateId(15);
    const name = generateName(id);
    const [newUser] = await db
      .insert(tables.user)
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
    return setResponseStatus(event, 200);
  } catch (e) {
    console.error({ e });
    throw createError({
      status: 400,
      message: "Something went wrong, please try again",
    });
  }
});
