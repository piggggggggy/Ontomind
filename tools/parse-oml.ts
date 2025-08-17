import fs from 'node:fs';
import path from 'node:path';
import { parseOML } from '@ontomind/dsl';

const ir = parseOML();
const out = path.join(process.cwd(), 'data', 'generated', 'ir.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(ir, null, 2), 'utf8');
console.log(`[OntoMind] IR saved: ${out}`);
console.log(`- classes: ${ir.classes.length}`);
console.log(`- relationTypes: ${ir.relationTypes.length}`);
console.log(`- intents: ${ir.intents.length}`);
console.log(`- contexts: ${ir.contexts.length}`);
console.log(`- policies: ${ir.policies.length}`);