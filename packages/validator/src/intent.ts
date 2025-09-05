import fs from 'node:fs';
import path from 'node:path';
import { createAjv, formatErrors } from './ajv';
import { ValidateResult } from './entity';

export function validateIntentIO(intentKey: string, payload: any, which: 'input'|'output', intentsSchemaPath: string): ValidateResult {
  const bundle = JSON.parse(fs.readFileSync(intentsSchemaPath, 'utf8')) as Record<string, any>;
  const schemaPair = bundle[intentKey];
  if (!schemaPair) return { ok: false, errors: [`intent schema not found: ${intentKey}`] };
  const schema = schemaPair[which] ?? schemaPair; // 구조에 따라 input/output 또는 단일
  const ajv = createAjv();
  const validate = ajv.compile(schema);
  const ok = validate(payload);
  return ok ? { ok: true } : { ok: false, errors: [formatErrors(validate.errors || [])] };
}