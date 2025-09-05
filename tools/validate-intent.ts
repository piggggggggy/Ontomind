import path from 'node:path';
import fs from 'node:fs';
import { parseOML } from '@ontomind/dsl';
import { validateIntentIO } from '@ontomind/validator';

const intentKey = process.argv[2]; // 예: intent:diagnose@1.0.0
const which = (process.argv[3] as 'input'|'output') || 'output';
const payloadPath = process.argv[4];
console.log('[OntoMind] intentKey', intentKey);
console.log('[OntoMind] which', which);
console.log('[OntoMind] payloadPath', payloadPath);
if (!intentKey || !payloadPath) {
  console.error('Usage: tsx tools/validate-intent.ts <intentKey> <input|output> <payload.json>');
  process.exit(1);
}

const intentsSchema = path.join(process.cwd(), 'data', 'generated', 'intents.schema.json');
console.log('[OntoMind] intentsSchema', intentsSchema);
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
const res = validateIntentIO(intentKey, payload, which, intentsSchema);
console.log('[OntoMind] res', res);
if (res.ok) console.log('OK'); else { console.error(res.errors?.join('\n')); process.exit(1); }