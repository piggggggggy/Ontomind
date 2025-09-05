// packages/port/src/providers/openai.ts
import type { OpenAIChatRequest } from './openai-types';
import { withRetry } from '../retry';

export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  model: string;
}

export async function openaiChat(req: OpenAIChatRequest, cfg: OpenAIConfig) {
  const base = cfg.baseURL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  const doFetch = async () => {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      // 본문을 읽어 오류 메시지 확보
      let detail = '';
      try {
        const body = await res.json();
        detail = (body as any)?.error?.message || JSON.stringify(body);
      } catch {
        // ignore
      }

      const err: any = new Error(`OpenAI HTTP ${res.status} ${res.statusText} — ${detail}`);
      err.status = res.status;
      err.retryAfter = parseInt(res.headers.get('retry-after') || '') || undefined;
      throw err;
    }
    return res;
  };

  return withRetry(
    doFetch,
    (e: any) => {
      if (!e || typeof e !== 'object') return { retry: false };
      // 429: 속도 제한 → 재시도
      if (e.status === 429) return { retry: true, waitMs: e.retryAfter ? e.retryAfter * 1000 : undefined };
      // 5xx: 일시 오류 → 재시도
      if (e.status >= 500 && e.status < 600) return { retry: true };
      return { retry: false };
    },
    { retries: 3, minDelayMs: 800, maxDelayMs: 6000 }
  );
}