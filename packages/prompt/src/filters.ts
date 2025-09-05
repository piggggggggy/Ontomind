import fs from 'node:fs';
import path from 'node:path';

export function loadPromptSummary(p: string) {
  return JSON.parse(fs.readFileSync(p, 'utf8')) as any;
}

export function loadIntentsSchema(p: string) {
  return JSON.parse(fs.readFileSync(p, 'utf8')) as Record<string, any>;
}

// 아주 단순한 JSONL 로더 (빈 파일/없음 허용)
export function readJsonl(file: string): any[] {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split(/\n?/).map(s => s.trim()).filter(Boolean);
  const out: any[] = [];
  for (const l of lines) { try { out.push(JSON.parse(l)); } catch { /* skip */ } }
  return out;
}

export function collectInstances(instancesDir?: string) {
  if (!instancesDir || !fs.existsSync(instancesDir)) return { entities: [], relations: [] };
  const files = fs.readdirSync(instancesDir).filter(f => f.endsWith('.jsonl'));
  const entities: any[] = []; const relations: any[] = [];
  for (const f of files) {
    const arr = readJsonl(path.join(instancesDir, f));
    for (const obj of arr) {
      if (obj && typeof obj === 'object') {
        if ('type' in obj && 'from' in obj && 'to' in obj) relations.push(obj);
        else if ('class' in obj && 'data' in obj) entities.push(obj);
      }
    }
  }
  return { entities, relations };
}

// 타겟 ID로 주어진 엔티티 + 1-hop 이웃을 간단히 수집
export function pickEvidence(targetIds: string[] = [], instances: { entities: any[]; relations: any[] }, max = 10) {
  if (!instances.entities.length) return [];
  const set = new Set<string>(targetIds);
  const idToEntity = new Map(instances.entities.map((e: any) => [e.id, e] as const));
  const out: any[] = [];
  for (const id of targetIds) {
    const e = idToEntity.get(id);
    if (e) out.push(e);
  }
  // 1-hop 관계 따라 확장
  for (const rel of instances.relations) {
    if (out.length >= max) break;
    if (set.has(rel.from) && idToEntity.has(rel.to)) out.push(idToEntity.get(rel.to)!);
    else if (set.has(rel.to) && idToEntity.has(rel.from)) out.push(idToEntity.get(rel.from)!);
  }
  return out.slice(0, max);
}
