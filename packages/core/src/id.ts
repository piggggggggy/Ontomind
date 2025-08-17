import type { OMIdentifier } from './types';

export function idToString(id: OMIdentifier): string {
  const v = id.version ? `@${id.version}` : '';
  return `${id.ns}:${id.slug}${v}`;
}

export function sameId(a: OMIdentifier, b: OMIdentifier): boolean {
  return a.ns === b.ns && a.slug === b.slug && a.version === b.version;
}

export function keyById<T extends { id: OMIdentifier }>(arr: T[]): Map<string, T> {
  const m = new Map<string, T>();
  for (const it of arr) {
    const k = idToString(it.id);
    if (m.has(k)) throw new Error(`Duplicate id: ${k}`);
    m.set(k, it);
  }
  return m;
}