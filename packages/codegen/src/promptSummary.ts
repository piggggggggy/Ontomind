import type { OMIR } from '@ontomind/core/types';
import { idToString } from '@ontomind/core/id';

export interface PromptSummary {
  version: number;
  namespaces: string[];
  classes: Array<{
    id: string;
    label: string;
    props: Array<{ key: string; type: string }>;
  }>;
  relations: Array<{
    id: string;
    label: string;
    domain: string;
    range: string;
    card?: string;
  }>;
  intents: Array<{
    id: string;
    label: string;
    input: Record<string,string>;
    output: Record<string,string>;
  }>;
  policies: Array<{ id: string; label: string }>;
  contexts: Array<{ id: string; label: string; role?: string }>;
}

export function buildPromptSummary(ir: OMIR): PromptSummary {
  return {
    version: ir.version,
    namespaces: ir.namespaces,
    classes: ir.classes.map(c => ({
      id: idToString(c.id),
      label: c.label,
      props: (c.properties ?? []).map(p => ({
        key: p.id.slug,
        type: typeof p.type === 'string' ? p.type :
              ('enum' in p.type ? `enum(${p.type.enum.join('|')})` :
               ('ref' in p.type ? `ref(${idToString(p.type.ref)})` : 'json'))
      }))
    })),
    relations: ir.relationTypes.map(r => ({
      id: idToString(r.id),
      label: r.label,
      domain: idToString(r.domain),
      range: idToString(r.range),
      card: r.cardinality
    })),
    intents: ir.intents.map(i => ({
      id: idToString(i.id),
      label: i.label,
      input: i.input,
      output: i.output
    })),
    policies: ir.policies.map(p => ({ id: idToString(p.id), label: p.label })),
    contexts: ir.contexts.map(c => ({ id: idToString(c.id), label: c.label, role: c.role }))
  };
}