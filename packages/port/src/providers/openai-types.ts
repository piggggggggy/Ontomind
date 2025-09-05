export interface OpenAIChatMessage { role: 'system'|'user'|'assistant'|'tool'; content: string }
export interface OpenAIChatRequest {
  model: string
  messages: OpenAIChatMessage[]
  temperature?: number
  response_format?: { type: 'json_schema', json_schema: any } | { type: 'text' }
  stream?: boolean
}

export interface OpenAIChatChunkChoiceDelta { role?: string; content?: string }
export interface OpenAIChatChunkChoice { delta?: OpenAIChatChunkChoiceDelta; finish_reason?: string }
export interface OpenAIStreamChunk { choices?: OpenAIChatChunkChoice[] }
