export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface RequestOptions {
  fetch?: FetchLike;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryable(error: unknown): boolean {
  if (error instanceof HttpError)
    return error.status === undefined || error.status >= 500 || error.status === 429;
  return true;
}

export async function getJson(
  url: string,
  init: RequestInit = {},
  {
    fetch: fetchImpl = fetch,
    timeoutMs = 10_000,
    retries = 2,
    retryDelayMs = 1_000,
  }: RequestOptions = {},
): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(retryDelayMs * attempt);
    try {
      const response = await fetchImpl(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) throw new HttpError(`${url} answered ${response.status}`, response.status);
      try {
        return await response.json();
      } catch {
        throw new HttpError(`${url} did not return valid JSON`, response.status);
      }
    } catch (error) {
      lastError = error;
      if (!isRetryable(error)) break;
    }
  }
  throw lastError instanceof Error ? lastError : new HttpError(`${url} failed`);
}
