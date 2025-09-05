import type { OpenAIChatRequest } from './openai-types';

function sampleBySchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return null;

  if (schema.type === 'string') {
    if (schema.format === 'markdown') return '### 요약\n- 항목 1\n- 항목 2';
    return 'sample';
  }
  if (schema.type === 'number') return 0;
  if (schema.type === 'boolean') return false;
  if (schema.type === 'array') {
    const item = sampleBySchema(schema.items || { type: 'string' });
    return [item, item];
  }
  if (schema.type === 'object' || schema.properties) {
    const props = schema.properties || {};
    const out: any = {};
    for (const k of Object.keys(props)) out[k] = sampleBySchema(props[k]);
    return out;
  }
  // Fallback
  return {};
}

export async function mockChat(req: OpenAIChatRequest) {
  // req.response_format?.json_schema?.schema 에 의도 출력 스키마가 들어있음
  const schema = (req.response_format as any)?.json_schema?.schema;
  const content = schema ? sampleBySchema(schema) : { text: 'hello (mock)' };
  // 실제 OpenAI 응답과 비슷한 형태로 래핑
  return {
    ok: true,
    json: async () => ({
      choices: [{ message: { content: JSON.stringify(content) } }]
    })
  } as Response & { json: () => Promise<any> };
}