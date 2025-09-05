import Ajv2020, { ErrorObject } from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

export function createAjv() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv;
}

export function formatErrors(errors: ErrorObject[] = []) {
  return errors.map(e => `${e.instancePath || '/'} ${e.message}`).join('\n');
}