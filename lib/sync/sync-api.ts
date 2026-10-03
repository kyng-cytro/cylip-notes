import { CLIENT_ROUTES, SYNC_TIMING } from "./constants";
import type {
  PullRequest,
  PullResponse,
  PushRequest,
  PushResponse,
} from "./protocol";

export class SyncApi {
  constructor(
    private baseUrl: string,
    private getToken: () => Promise<string>,
  ) {}

  pull(request: PullRequest) {
    return this.post<PullResponse>(CLIENT_ROUTES.pull, request);
  }

  push(request: PushRequest) {
    return this.post<PushResponse>(CLIENT_ROUTES.push, request);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), {
      method: "POST",
      headers: {
        authorization: `Bearer ${await this.getToken()}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(SYNC_TIMING.requestTimeout),
    });
    if (!response.ok)
      throw new Error(`Sync request failed: ${response.status}`);
    return response.json();
  }
}
