import { createHooks } from "hookable";

export interface ServerSentEvent {
  [event: `sse:event:${string}`]: (data: any) => any | void;
}

export const sseHooks = createHooks<ServerSentEvent>();

export const requestClientRefresh = async (userId: string) => {
  await sseHooks.callHook(`sse:event:${userId}`, new Date().toISOString());
};
