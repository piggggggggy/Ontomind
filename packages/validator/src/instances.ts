import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';
import type { OMIR } from '@ontomind/core/types';
import { validateEntityRecord } from './entity';
import { validateRelationRecord } from './relation';

export interface FileReport { file: string; ok: boolean; count: number; errors: Array<{ line: number; message: string }>; }

export async function validateJsonlFile(ir: OMIR, filePath: string): Promise<FileReport> {
  const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
  let lineNo = 0; let okCount = 0; const errors: FileReport['errors'] = [];
  for await (const line of rl) {
    lineNo++;
    const t = line.trim();
    if (!t) continue;
    let obj: any;
    try { obj = JSON.parse(t); } catch (e) { errors.push({ line: lineNo, message: 'invalid JSON' }); continue; }
    const kind = obj.type ? 'relation' : 'entity'; // 단순 판별: relation은 {type, from, to}
    const res = kind === 'relation' ? validateRelationRecord(ir, obj) : validateEntityRecord(ir, obj);
    if (!res.ok) errors.push({ line: lineNo, message: (res.errors || []).join('; ') }); else okCount++;
  }
  return { file: filePath, ok: errors.length === 0, count: okCount, errors };
}

export async function validateInstancesDir(ir: OMIR, dir: string): Promise<FileReport[]> {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsonl'));
  const out: FileReport[] = [];
  for (const f of files) out.push(await validateJsonlFile(ir, path.join(dir, f)));
  return out;
}