import fs from 'node:fs';
import path from 'node:path';
import { parseOML } from '@ontomind/dsl';
import { buildJSONSchemas } from '@ontomind/codegen';
import { buildPromptSummary } from '@ontomind/codegen';
import { buildTypeDeclarations } from '@ontomind/codegen';

const outDir = path.join(process.cwd(), 'data', 'generated');
fs.mkdirSync(outDir, { recursive: true });

// 1) IR (메모리 로딩)
const ir = parseOML();

// 2) JSON Schema 묶음
const js = buildJSONSchemas(ir);
fs.writeFileSync(path.join(outDir, 'classes.schema.json'), JSON.stringify(js.classes, null, 2));
fs.writeFileSync(path.join(outDir, 'relations.schema.json'), JSON.stringify(js.relations, null, 2));
fs.writeFileSync(path.join(outDir, 'intents.schema.json'), JSON.stringify(js.intents, null, 2));

// 3) Prompt Summary (LLM 토큰 절약용 요약)
const ps = buildPromptSummary(ir);
fs.writeFileSync(path.join(outDir, 'prompt-summary.json'), JSON.stringify(ps, null, 2));

// 4) types.d.ts
const dts = buildTypeDeclarations(ir);
fs.writeFileSync(path.join(outDir, 'types.d.ts'), dts, 'utf8');

console.log('[OntoMind] codegen done:');
console.log(' - generated/classes.schema.json');
console.log(' - generated/relations.schema.json');
console.log(' - generated/intents.schema.json');
console.log(' - generated/prompt-summary.json');
console.log(' - generated/types.d.ts');