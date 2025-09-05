import type { OMIR, OMClass, OMProperty } from '@ontomind/core/types';
import { createAjv, formatErrors } from './ajv';
import fs from 'node:fs';
import path from 'node:path';

export interface ValidateResult { ok: boolean; errors?: string[] }

function propertyIndex(c: OMClass) {
  const m = new Map<string, OMProperty>();
  for (const p of c.properties ?? []) m.set(p.id.slug, p);
  return m;
}

export function validateEntityRecord(ir: OMIR, entity: any): ValidateResult {
  const errors: string[] = [];
  // 필수 상단 키 체크
  for (const k of ['id','class','data']) if (!(k in entity)) errors.push(`missing key: ${k}`);
  if (errors.length) return { ok: false, errors };

  // 클래스 찾기(ns:slug[@ver] 혹은 ns:slug)
  const clsKey = entity.class.version ? `${entity.class.ns}:${entity.class.slug}@${entity.class.version}` : `${entity.class.ns}:${entity.class.slug}`;
  const classesByFull = new Map<string, OMClass>(ir.classes.map<[string, OMClass]>(c => [`${c.id.ns}:${c.id.slug}${c.id.version ? '@'+c.id.version : ''}`, c] as const));
  const classesByBase = new Map<string, OMClass>(ir.classes.map<[string, OMClass]>(c => [`${c.id.ns}:${c.id.slug}`, c] as const));
  const cls = classesByFull.get(clsKey) ?? classesByBase.get(`${entity.class.ns}:${entity.class.slug}`);
  if (!cls) return { ok: false, errors: [`class not found: ${clsKey}`] };

  const pIndex = propertyIndex(cls);
  const data = entity.data ?? {};

  // required 속성 체크
  for (const p of cls.properties ?? []) {
    if (p.required && !(p.id.slug in data)) errors.push(`required property missing: ${p.id.slug}`);
  }

  // 타입/enum 기초 검증 (라이트, Ajv는 generated schema에서 2차 검증)
  for (const [k, v] of Object.entries(data)) {
    const spec = pIndex.get(k);
    if (!spec) continue; // 추가 속성 허용
    if (typeof spec.type === 'string') {
      if (spec.type === 'number' && typeof v !== 'number') errors.push(`property ${k}: expected number`);
      if (spec.type === 'string' && typeof v !== 'string') errors.push(`property ${k}: expected string`);
      if (spec.type === 'boolean' && typeof v !== 'boolean') errors.push(`property ${k}: expected boolean`);
    } else if ('enum' in spec.type) {
      if (typeof v !== 'string' || !spec.type.enum.includes(v)) errors.push(`property ${k}: not in enum`);
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}

export function validateEntityWithSchema(entity: any, classesSchemaPath: string): ValidateResult {
  // 선택적: codegen 산출물(JSON Schema)을 사용한 2차 검증
  const ajv = createAjv();
  const bundle = JSON.parse(fs.readFileSync(classesSchemaPath, 'utf8')) as Record<string, any>;
  const classSlug = entity.class?.slug as string;
  const key = Object.keys(bundle).find(k => k.startsWith(`${entity.class.ns}:${classSlug}`));
  if (!key) return { ok: false, errors: [`schema for class not found: ${entity.class.ns}:${classSlug}`] };
  const schema = bundle[key];
  const validate = ajv.compile(schema);
  const ok = validate(entity.data ?? {});
  return ok ? { ok: true } : { ok: false, errors: [formatErrors(validate.errors || [])] };
}
