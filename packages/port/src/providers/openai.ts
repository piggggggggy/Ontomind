import type { OpenAIChatRequest } from './openai-types'

export interface OpenAIConfig {
  apiKey: string
  baseURL?: string // 기본: https://api.openai.com/v1
  model: string
}

export async function openaiChat(req: OpenAIChatRequest, cfg: OpenAIConfig) {
  const base = cfg.baseURL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cfg.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req)
  })
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`)
  return res
}