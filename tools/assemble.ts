import path from 'node:path';
import fs from 'node:fs';
import { assemblePrompt } from '@ontomind/prompt';

const intentKey = process.argv[2] || 'intent:diagnose@1.0.0';
const targets = (process.argv[3]?.split(',') || []).filter(Boolean);

const bundle = assemblePrompt(
  { intentKey, targetIds: targets, maxEvidence: 8 },
  {
    promptSummaryPath: path.join(process.cwd(), 'data', 'generated', 'prompt-summary.json'),
    intentsSchemaPath: path.join(process.cwd(), 'data', 'generated', 'intents.schema.json'),
    instancesDir: path.join(process.cwd(), 'data', 'instances')
  }
);

fs.mkdirSync(path.join(process.cwd(), 'tmp'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'tmp', 'prompt.system.txt'), bundle.system, 'utf8');
fs.writeFileSync(path.join(process.cwd(), 'tmp', 'prompt.user.txt'), bundle.user, 'utf8');
fs.writeFileSync(path.join(process.cwd(), 'tmp', 'tool.schema.json'), JSON.stringify(bundle.toolSchema ?? {}, null, 2));
console.log('[OntoMind] assemble done. See tmp/prompt.* & tmp/tool.schema.json');
