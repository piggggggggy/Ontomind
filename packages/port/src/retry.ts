// packages/port/src/retry.ts
export interface RetryOptions {
    retries?: number;       // 기본 3
    minDelayMs?: number;    // 기본 500
    maxDelayMs?: number;    // 기본 4000
  }
  
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  
  export async function withRetry<T>(
    fn: () => Promise<T>,
    isRetryable: (e: any) => { retry: boolean; waitMs?: number },
    opt: RetryOptions = {}
  ): Promise<T> {
    const { retries = 3, minDelayMs = 500, maxDelayMs = 4000 } = opt;
    let attempt = 0;
    let lastErr: any;
  
    while (attempt <= retries) {
      try {
        return await fn();
      } catch (e: any) {
        lastErr = e;
        const { retry, waitMs } = isRetryable(e);
        if (!retry || attempt === retries) break;
  
        const base = waitMs ?? Math.min(maxDelayMs, minDelayMs * 2 ** attempt);
        const jitter = Math.floor(Math.random() * (base / 2));
        await sleep(base + jitter);
        attempt++;
      }
    }
    throw lastErr;
  }