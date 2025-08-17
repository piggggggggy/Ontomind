import type { OMClass, OMIR, OMIntent, OMPolicy, OMRelationType, OMContext, OMIdentifier } from '@ontomind/core/types';
import { ValidationError } from '@ontomind/core/errors';
import { idToString, keyById } from '@ontomind/core/id';

function baseKey(id: OMIdentifier): string {
  return `${id.ns}:${id.slug}`;
}

function indexClasses(classes: OMClass[]) {
  const byFull = keyById(classes); // ns:slug@version
  const byBase = new Map<string, OMClass>(); // ns:slug -> preferred version
  for (const c of classes) {
    const base = baseKey(c.id);
    if (!byBase.has(base)) byBase.set(base, c);
  }
  return { byFull, byBase };
}

function resolveClassId(
  id: OMIdentifier,
  idx: { byFull: Map<string, OMClass>, byBase: Map<string, OMClass> }
): OMClass|undefined {
  if (id.version) {
    return idx.byFull.get(idToString(id));
  }
  return idx.byBase.get(baseKey(id));
}

export interface RawOML {
  version: number;
  namespaces: string[];
  classes?: OMClass[];
  relationTypes?: OMRelationType[];
  intents?: OMIntent[];
  contexts?: OMContext[];
  policies?: OMPolicy[];
}

export function toIR(doc: RawOML): OMIR {
  if (!doc || typeof doc !== 'object') throw new ValidationError('OML root must be an object');
  if (typeof doc.version !== 'number') throw new ValidationError('OML.version must be a number');
  if (!Array.isArray(doc.namespaces)) throw new ValidationError('OML.namespaces must be an array');

  const classes = (doc.classes ?? []) as OMClass[];
  const relationTypes = (doc.relationTypes ?? []) as OMRelationType[];
  const intents = (doc.intents ?? []) as OMIntent[];
  const contexts = (doc.contexts ?? []) as OMContext[];
  const policies = (doc.policies ?? []) as OMPolicy[];

  const classIndex = indexClasses(classes);

  // 의미론 검증: relationType의 domain/range 존재 여부
  const issues: string[] = [];
  for (const rel of relationTypes) {
    const dClass = resolveClassId(rel.domain, classIndex);
    const rClass = resolveClassId(rel.range, classIndex);
    if (!dClass) {
      const dStr = rel.domain.version ? idToString(rel.domain) : baseKey(rel.domain);
      issues.push(`relationType ${idToString(rel.id)}: domain not found: ${dStr}`);
    }
    if (!rClass) {
      const rStr = rel.range.version ? idToString(rel.range) : baseKey(rel.range);
      issues.push(`relationType ${idToString(rel.id)}: range not found: ${rStr}`);
    }
  }
  if (issues.length) throw new ValidationError('Semantic validation failed', issues);

  return {
    version: doc.version,
    namespaces: doc.namespaces,
    classes,
    relationTypes,
    intents,
    contexts,
    policies,
  };
}
