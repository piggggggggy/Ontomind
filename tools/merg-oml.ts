import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import { parseOML } from '@ontomind/dsl';

const rootDir = process.cwd();
const schemasDir = path.join(rootDir, 'data', 'schemas');
const outFile = path.join(schemasDir, 'ontomind.merged.oml.yml');

// parseOML 내부에서 병합하지만, 사람이 보게끔 병합 결과를 저장하고 싶을 때 사용
const irDoc: any = (() => {
  // parseOML은 IR을 반환하므로, 병합 원문이 궁금하면 별도 merge 로직을 두거나
  // 아래처럼 간단히 루트+조각을 다시 병합해서 저장할 수 있습니다.
  const root = yaml.parse(fs.readFileSync(path.join(schemasDir, 'ontomind.oml.yml'), 'utf8'));
  const tboxDir = path.join(schemasDir, 'tbox');
  const files = fs.existsSync(tboxDir)
    ? fs.readdirSync(tboxDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml')).sort()
    : [];
  const mergeDeep = (a: any, b: any) => {
    const out: any = { ...a };
    for (const k of Object.keys(b)) {
      const A = a?.[k]; const B = b[k];
      if (Array.isArray(A) && Array.isArray(B)) out[k] = [...A, ...B];
      else if (A && typeof A === 'object' && B && typeof B === 'object') out[k] = mergeDeep(A, B);
      else out[k] = B;
    }
    return out;
  };
  return files.reduce((acc, f) => mergeDeep(acc, yaml.parse(fs.readFileSync(path.join(tboxDir, f), 'utf8'))), root);
})();

fs.writeFileSync(outFile, yaml.stringify(irDoc), 'utf8');
console.log(`Merged OML written to ${outFile}`);