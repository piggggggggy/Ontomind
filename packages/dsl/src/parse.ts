import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import type { OMIR } from '@ontomind/core/types';
import { toIR, RawOML } from './normalize';

function readY(file: string) { return yaml.parse(fs.readFileSync(file, 'utf8')); }

function mergeDeep<T extends Record<string, any>>(base: T, extra: T): T {
  const out: any = { ...base };
  for (const k of Object.keys(extra)) {
    const a = (base as any)[k];
    const b = (extra as any)[k];
    if (Array.isArray(a) && Array.isArray(b)) out[k] = [...a, ...b];
    else if (a && typeof a === 'object' && b && typeof b === 'object') out[k] = mergeDeep(a, b);
    else out[k] = b;
  }
  return out;
}

export interface ParseOptions {
  rootDir?: string; // default: process.cwd()
  schemasDir?: string; // default: data/schemas
  tboxDirName?: string; // default: tbox
}

export function parseOML(opts: ParseOptions = {}): OMIR {
  const rootDir = opts.rootDir ?? process.cwd();
  const schemasDir = opts.schemasDir ?? path.join(rootDir, 'data', 'schemas');
  const tboxDir = path.join(schemasDir, opts.tboxDirName ?? 'tbox');

  const rootFile = path.join(schemasDir, 'ontomind.oml.yml');
  if (!fs.existsSync(rootFile)) throw new Error(`Not found: ${rootFile}`);


  let merged: RawOML = readY(rootFile);
  if (fs.existsSync(tboxDir)) {
    const parts = fs.readdirSync(tboxDir)
      .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
      .map(f => path.join(tboxDir, f))
      .sort(); // deterministic merge
    for (const f of parts) {
      const doc = readY(f);
      merged = mergeDeep(merged, doc);
    }
  }

  // 기본 정규화 & 의미론 검증 → IR
  const ir = toIR(merged);
  return ir;
}