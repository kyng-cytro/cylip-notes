import type { Identity } from "./env";

const HEADER = "x-sync-identity";

export const withIdentity = (request: Request, identity: Identity) => {
  const headers = new Headers(request.headers);
  headers.set(HEADER, encodeURIComponent(JSON.stringify(identity)));
  return new Request(request, { headers });
};

export const readIdentity = (request: Request): Identity =>
  JSON.parse(decodeURIComponent(request.headers.get(HEADER)!));
