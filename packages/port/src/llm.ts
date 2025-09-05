import type { PromptBundle } from '@ontomind/prompt'
import { openaiChat, type OpenAIConfig } from './providers/openai'
import type { OpenAIChatRequest } from './providers/openai-types'
import { validateIntentOutput } from './validate'
import dotenv from 'dotenv'; dotenv.config();
import { mockChat } from './providers/mock';


export interface CallOptions {
  provider: 'openai' | 'mock'
  apiKey?: string
  baseURL?: string
  model?: string
  temperature?: number
  stream?: boolean
  intentKey: string
}

export async function callLLM(bundle: PromptBundle, opts: CallOptions) {
  const { system, user, toolSchema } = bundle

  const mockReq: OpenAIChatRequest = {
    model: opts.model || 'mock',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: opts.temperature ?? 0.2,
    response_format: toolSchema
      ? { type: 'json_schema', json_schema: { name: 'intent_output', schema: toolSchema, strict: true } }
      : { type: 'text' },
    stream: false
  };

  if (opts.provider === 'mock') {
    const res: any = await mockChat(mockReq);
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    const check = validateIntentOutput(opts.intentKey, parsed);
    if (!check.ok) return { ok: false, error: 'schema_validation_failed', details: check.errors };
    return { ok: true, output: parsed, raw: data };
  }


  if (opts.provider !== 'openai') throw new Error('Only openai provider is wired for now')
  const cfg: OpenAIConfig = {
    apiKey: opts.apiKey || process.env.OPENAI_API_KEY || '',
    baseURL: opts.baseURL || process.env.OPENAI_BASE_URL || undefined,
    model: opts.model || process.env.OPENAI_MODEL || 'gpt-4o-mini'
  }

  if (!cfg.apiKey) throw new Error('OPENAI_API_KEY missing')

  const openaiReq: OpenAIChatRequest = {
    model: cfg.model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: opts.temperature ?? 0.2,
    response_format: toolSchema
      ? { type: 'json_schema', json_schema: { name: 'intent_output', schema: toolSchema, strict: true } }
      : { type: 'text' },
    stream: !!opts.stream
  }

  const res = await openaiChat(openaiReq, cfg)

  // 스트리밍이 아닌 경우: JSON 파싱 → 검증 후 반환
  if (!opts.stream) {
    const data = await res.json() as any
    const content = data?.choices?.[0]?.message?.content
    let parsed: any
    try { parsed = typeof content === 'string' ? JSON.parse(content) : content } catch { parsed = content }
    const check = validateIntentOutput(opts.intentKey, parsed)
    if (!check.ok) return { ok: false, error: 'schema_validation_failed', details: check.errors }
    return { ok: true, output: parsed, raw: data }
  }

  // 스트리밍인 경우: caller에게 Response 그대로 반환(Next API에서 중계)
  return { ok: true, stream: res.body }
}