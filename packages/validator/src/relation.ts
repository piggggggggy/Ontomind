import type { OMIR, OMRelationType } from '@ontomind/core/types';
import { ValidateResult } from './entity';

export function validateRelationRecord(ir: OMIR, rel: any): ValidateResult {
  const errors: string[] = [];
  for (const k of ['type','from','to']) if (!(k in rel)) errors.push(`missing key: ${k}`);
  if (errors.length) return { ok: false, errors };

  const typeKey = rel.type.version ? `${rel.type.ns}:${rel.type.slug}@${rel.type.version}` : `${rel.type.ns}:${rel.type.slug}`;
  const relByFull = new Map<string, OMRelationType>(ir.relationTypes.map<[string, OMRelationType]>(r => [`${r.id.ns}:${r.id.slug}${r.id.version ? '@'+r.id.version : ''}`, r] as const));
  const relByBase = new Map<string, OMRelationType>(ir.relationTypes.map<[string, OMRelationType]>(r => [`${r.id.ns}:${r.id.slug}`, r] as const));
  const rSpec = relByFull.get(typeKey) ?? relByBase.get(`${rel.type.ns}:${rel.type.slug}`);
  if (!rSpec) return { ok: false, errors: [`relationType not found: ${typeKey}`] };

  // 카디널리티 체크는 전체 그래프 단위에서 수행(여기선 단건 구조만 체크)
  if (typeof rel.from !== 'string' || typeof rel.to !== 'string') errors.push('from/to must be id strings');

  return errors.length ? { ok: false, errors } : { ok: true };
}
