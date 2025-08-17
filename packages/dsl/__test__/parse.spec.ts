import { describe, it, expect } from 'vitest';
import { toIR } from '../src/normalize';

describe('toIR basic semantics', () => {
  it('fails when relation domain/range missing', () => {
    const doc: any = {
      version: 0.1,
      namespaces: ['core'],
      classes: [],
      relationTypes: [
        {
          id: { ns: 'core', slug: 'depends-on' },
          label: 'depends_on',
          domain: { ns: 'core', slug: 'thing' },
          range: { ns: 'core', slug: 'thing' }
        }
      ]
    };
    expect(() => toIR(doc)).toThrowError();
  });

  it('passes with valid class references', () => {
    const doc: any = {
      version: 0.1,
      namespaces: ['core'],
      classes: [
        { id: { ns: 'core', slug: 'thing' }, label: 'Thing', properties: [] }
      ],
      relationTypes: [
        {
          id: { ns: 'core', slug: 'depends-on' },
          label: 'depends_on',
          domain: { ns: 'core', slug: 'thing' },
          range: { ns: 'core', slug: 'thing' }
        }
      ]
    };
    const ir = toIR(doc);
    expect(ir.classes.length).toBe(1);
    expect(ir.relationTypes.length).toBe(1);
  });
});
