import type { EventHandler, EventHandlerRequest, H3Event } from "h3";

type AuthenticatedEvent<T extends EventHandlerRequest> = H3Event<T> & {
  context: { user: AuthUser; session: AuthSession };
};

export const defineAuthenticatedEventHandler = <
  T extends EventHandlerRequest,
  D,
>(
  handler: (event: AuthenticatedEvent<T>) => D | Promise<D>,
): EventHandler<T, D> =>
  defineEventHandler<T>((event) => {
    if (!event.context.user) {
      throw createError({
        statusCode: 401,
        message: "Please log in to continue.",
      });
    }
    return handler(event as AuthenticatedEvent<T>);
  });

export const defineTaskEventHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
): EventHandler<T, D> =>
  defineEventHandler<T>((event) => {
    if (getHeader(event, "x-api-key") !== useRuntimeConfig().task.apiKey) {
      throw createError({ statusCode: 401, message: "Invalid API key." });
    }
    return handler(event);
  });

export const defineSyncEventHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
): EventHandler<T, D> =>
  defineEventHandler<T>((event) => {
    requireSyncSecret(event);
    return handler(event);
  });
