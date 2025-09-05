import path from 'node:path'
import { validateIntentIO } from '@ontomind/validator'

export function validateIntentOutput(intentKey: string, payload: any): { ok: boolean; errors?: string[] } {
  const intentsSchemaPath = path.join(process.cwd(), 'data', 'generated', 'intents.schema.json')
  return validateIntentIO(intentKey, payload, 'output', intentsSchemaPath)
}