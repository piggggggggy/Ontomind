import type {
    OMIR, OMClass, OMProperty, OMRelationType, OMIntent, OMIdentifier
} from '@ontomind/core/types';
import { idToString } from '@ontomind/core/id';
  
  type JSONSchema = Record<string, any>;
  
  function typeRefToJSONSchema(t: OMProperty['type']): JSONSchema {
    if (typeof t === 'string') {
      switch (t) {
        case 'string': return { type: 'string' };
        case 'number': return { type: 'number' };
        case 'boolean': return { type: 'boolean' };
        case 'date': return { type: 'string', format: 'date' };
        case 'datetime': return { type: 'string', format: 'date-time' };
        case 'url': return { type: 'string', format: 'uri' };
        case 'markdown': return { type: 'string' };
        case 'id': return { type: 'string' };
        case 'json': return {};
        default: return {};
      }
    } else if ('enum' in t) {
      return { type: 'string', enum: t.enum };
    } else if ('ref' in t) {
      // ref는 해당 클래스의 id를 가리키는 식별자 문자열로 단순 모델링
      return { type: 'string', description: `ref:${idToString(t.ref)}` };
    }
    return {};
  }
  
  function classToJSONSchema(c: OMClass): JSONSchema {
    const required: string[] = [];
    const properties: Record<string, any> = {};
    for (const p of c.properties ?? []) {
      properties[p.id.slug] = {
        ...typeRefToJSONSchema(p.type),
        description: p.description ?? p.label,
        default: p.default,
        pattern: p.pattern,
        minimum: p.min,
        maximum: p.max,
      };
      if (p.required) required.push(p.id.slug);
    }
    return {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: `#/classes/${c.id.ns}:${c.id.slug}${c.id.version ? '@'+c.id.version : ''}`,
      title: c.label,
      type: 'object',
      additionalProperties: true,
      properties,
      required,
    };
  }
  
  function relationToJSONSchema(r: OMRelationType): JSONSchema {
    return {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: `#/relations/${idToString(r.id)}`,
      title: r.label,
      type: 'object',
      required: ['type', 'from', 'to'],
      properties: {
        type: {
          type: 'object',
          required: ['ns','slug'],
          properties: {
            ns: { type: 'string' },
            slug: { type: 'string' },
            version: { type: 'string' }
          }
        },
        from: { type: 'string' },
        to:   { type: 'string' },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        sources: { type: 'array', items: { type: 'string' } },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }
  
  function intentIOSchema(name: 'input'|'output', spec: Record<string,string>): JSONSchema {
    const properties: Record<string, any> = {};
    const required: string[] = [];
    for (const [k, hint] of Object.entries(spec)) {
      // 아주 라이트한 힌트 해석
      let sch: any = { type: 'string' };
      if (hint === 'json') sch = {};
      else if (hint === 'markdown') sch = { type: 'string' };
      else if (hint.startsWith('id:')) sch = { type: 'string', description: `ref type: ${hint.slice(3)}` };
      properties[k] = sch;
      required.push(k);
    }
    return {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: `intent.${name}`,
      type: 'object',
      properties,
      required
    };
  }
  
  function intentToJSONSchema(i: OMIntent): { input: JSONSchema; output: JSONSchema } {
    return {
      input: intentIOSchema('input', i.input),
      output: intentIOSchema('output', i.output),
    };
  }
  
  export function buildJSONSchemas(ir: OMIR) {
    const classes: Record<string, JSONSchema> = {};
    for (const c of ir.classes) {
      classes[idToString(c.id)] = classToJSONSchema(c);
    }
    const relations: Record<string, JSONSchema> = {};
    for (const r of ir.relationTypes) {
      relations[idToString(r.id)] = relationToJSONSchema(r);
    }
    const intents: Record<string, {input: JSONSchema; output: JSONSchema}> = {};
    for (const i of ir.intents) {
      intents[idToString(i.id)] = intentToJSONSchema(i);
    }
    return { classes, relations, intents };
  }