import { HEADERS } from "@/lib/sync/constants";
import type { Identity } from "./env";

export const withIdentity = (request: Request, identity: Identity) => {
  const headers = new Headers(request.headers);
  headers.set(HEADERS.identity, encodeURIComponent(JSON.stringify(identity)));
  return new Request(request, { headers });
};

export const readIdentity = (request: Request): Identity =>
  JSON.parse(decodeURIComponent(request.headers.get(HEADERS.identity)!));
