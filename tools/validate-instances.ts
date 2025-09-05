import path from 'node:path';
import fs from 'node:fs';
import { parseOML } from '@ontomind/dsl';
import { validateInstancesDir } from '@ontomind/validator';

const ir = parseOML();
console.log('[OntoMind] IR loaded', ir);
const dir = path.join(process.cwd(), 'data', 'instances');
console.log('[OntoMind] instances directory', dir);
(async () => {
  const reports = await validateInstancesDir(ir, dir);
  for (const r of reports) {
    console.log(`
[${r.ok ? 'OK' : 'FAIL'}] ${r.file} — records: ${r.count}`);
    for (const e of r.errors) console.log(`  line ${e.line}: ${e.message}`);
  }
  const allOk = reports.every(r => r.ok);
  if (!allOk) process.exit(1);
})();