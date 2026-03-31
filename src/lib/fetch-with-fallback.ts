export type FetchAttemptError = {
  url: string;
  error: unknown;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mergeHeaders(
  base: HeadersInit | undefined,
  extra: HeadersInit | undefined
): HeadersInit | undefined {
  if (!base && !extra) return undefined;
  const h = new Headers(base ?? undefined);
  new Headers(extra ?? undefined).forEach((value, key) => h.set(key, value));
  return h;
}

export async function fetchWithFallback(
  urls: string[],
  init: RequestInit & { next?: any } = {},
  options: {
    timeoutMs?: number;
    retriesPerUrl?: number;
    retryDelayMs?: number;
    headers?: HeadersInit;
  } = {}
): Promise<{ response: Response; url: string } | { response: null; errors: FetchAttemptError[] }> {
  const timeoutMs = options.timeoutMs ?? 15000;
  const retriesPerUrl = options.retriesPerUrl ?? 1;
  const retryDelayMs = options.retryDelayMs ?? 350;

  const errors: FetchAttemptError[] = [];
  const mergedHeaders = mergeHeaders(init.headers, options.headers);

  for (const url of urls) {
    for (let attempt = 0; attempt <= retriesPerUrl; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...init,
          headers: mergedHeaders,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          return { response, url };
        }

        errors.push({ url, error: new Error(`HTTP ${response.status} ${response.statusText}`) });
      } catch (error) {
        clearTimeout(timeout);
        errors.push({ url, error });
      }

      if (attempt < retriesPerUrl) {
        await sleep(retryDelayMs * (attempt + 1));
      }
    }
  }

  return { response: null, errors };
}

