import type {
  PullRequest,
  PullResponse,
  PushRequest,
  PushResponse,
} from "./protocol";

const REQUEST_TIMEOUT = 20_000;

export class SyncApi {
  constructor(
    private baseUrl: string,
    private getToken: () => Promise<string>,
  ) {}

  pull(request: PullRequest) {
    return this.post<PullResponse>("/sync/pull", request);
  }

  push(request: PushRequest) {
    return this.post<PushResponse>("/sync/push", request);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), {
      method: "POST",
      headers: {
        authorization: `Bearer ${await this.getToken()}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
    if (!response.ok)
      throw new Error(`Sync request failed: ${response.status}`);
    return response.json();
  }
}
