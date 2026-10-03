import type { Env } from "./env";

export const corsHeaders = (env: Env) => ({
  "Access-Control-Allow-Origin": new URL(env.APP_URL).origin,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Max-Age": "86400",
});

export const json = (data: unknown) => Response.json(data);

export const status = (code: number) => new Response(null, { status: code });

export const bearerToken = (request: Request) =>
  request.headers.get("authorization")?.replace(/^Bearer /i, "") ?? null;
