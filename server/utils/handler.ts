import type {
  EventHandler,
  EventHandlerRequest,
  H3Event,
  H3EventContext,
} from "h3";
interface AuthenticatedEventContext {
  user: AuthUser;
  session: AuthSession;
}

type AuthenticatedEvent<T extends EventHandlerRequest = EventHandlerRequest> =
  H3Event<T> & {
    context: H3EventContext & AuthenticatedEventContext;
  };

export const defineAuthenticatedEventHandler = <
  T extends EventHandlerRequest,
  D,
>(
  handler: (event: AuthenticatedEvent<T>) => D | Promise<D>,
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
    return handler(event as AuthenticatedEvent<T>);
  });

export const definePremiumEventHandler = <T extends EventHandlerRequest, D>(
  handler: (event: AuthenticatedEvent<T>) => D | Promise<D>,
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
    return handler(event as AuthenticatedEvent<T>);
  });

export const defineTaskEventHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    const apiKey = getRequestHeader(event, "x-api-key");
    if (!apiKey) {
      throw createError({
        statusCode: 401,
        message: "Missing API token.",
      });
    }
    if (apiKey.toString() !== useRuntimeConfig().task.apiKey.toString()) {
      throw createError({
        statusCode: 401,
        message: "Invalid API token.",
      });
    }
    return handler(event);
  });

export const defineSyncEventHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    requireSyncSecret(event);
    return handler(event);
  });
