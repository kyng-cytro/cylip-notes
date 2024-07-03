import type { EventHandler, EventHandlerRequest } from "h3";

export const defineAuthenticatedEventHandler = <
  T extends EventHandlerRequest,
  D,
>(
  handler: EventHandler<T, D>,
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 401,
        message:
          "User is not logged in. Please log in to access this resource.",
      });
    }
    if (!["free", "premium"].includes(user.accountType)) {
      throw createError({
        statusCode: 403,
        message: "You do not have permission to access this reasource.",
      });
    }
    return handler(event);
  });

export const definePremiumEventHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 401,
        message:
          "User is not logged in. Please log in to access this resource.",
      });
    }
    if (user.accountType !== "premium") {
      throw createError({
        statusCode: 403,
        message: "You do not have permission to access this reasource.",
      });
    }
    return handler(event);
  });
