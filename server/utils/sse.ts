import { createHooks } from "hookable";

export interface ServerSentEvent {
  [event: `sse:event:${string}`]: <T, R>(data: T) => R | void;
}

export const sseHooks = createHooks<ServerSentEvent>();

export const requestClientRefresh = async (userId: string) => {
  await sseHooks.callHook(`sse:event:${userId}`, new Date().toISOString());
};
