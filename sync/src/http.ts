import { AppError } from "./app";
import type { Env } from "./env";

export const corsHeaders = (env: Env) => ({
  "Access-Control-Allow-Origin": new URL(env.APP_URL).origin,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Max-Age": "86400",
});

export const withCors = (env: Env, response: Response) => {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(env)))
    headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
};

export const status = (code: number) => new Response(null, { status: code });

export const errorResponse = (error: unknown) =>
  status(error instanceof AppError ? error.status : 500);

export const bearerToken = (request: Request) =>
  request.headers.get("authorization")?.replace(/^Bearer /i, "") ?? null;
