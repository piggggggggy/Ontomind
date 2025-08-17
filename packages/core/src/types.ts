export type NS = string;

export interface OMIdentifier {
  ns: NS;
  slug: string;
  version?: string; // semver-ish, optional for "latest"
}

export type OMStatus = 'draft' | 'active' | 'deprecated';
export type OMCardinality = '1-1' | '1-N' | 'N-N';

export type OMPrimitive =
  | 'string' | 'number' | 'boolean' | 'date' | 'datetime'
  | 'url' | 'markdown' | 'id' | 'json';

export interface OMAnnotation {
  label: string;
  description?: string;
  aliases?: string[];
  tags?: string[];
}

export type OMTypeRef = OMPrimitive | { enum: string[] } | { ref: OMIdentifier };

export interface OMProperty extends OMAnnotation {
  id: OMIdentifier;
  type: OMTypeRef;
  required?: boolean;
  default?: any;
  pattern?: string;
  min?: number;
  max?: number;
  unique?: boolean;
}

export interface OMClass extends OMAnnotation {
  id: OMIdentifier;
  extends?: OMIdentifier[];
  properties: OMProperty[];
  status?: OMStatus;
}

export interface OMRelationType extends OMAnnotation {
  id: OMIdentifier;
  domain: OMIdentifier; // Class id
  range: OMIdentifier;  // Class id
  cardinality?: OMCardinality;
  inverseOf?: OMIdentifier;
  symmetric?: boolean;
  transitive?: boolean;
  status?: OMStatus;
}

export interface OMIntent extends OMAnnotation {
  id: OMIdentifier;
  input: Record<string, string>;  // light schema hints
  output: Record<string, string>; // JSON schema will be generated later
}

export type OMContextRole = 'me' | 'lead' | 'coach' | 'analyst';

export interface OMContext extends OMAnnotation {
  id: OMIdentifier;
  role?: OMContextRole;
  filters?: Record<string, any>;
}

export interface OMPolicy extends OMAnnotation {
  id: OMIdentifier;
  forbid?: string[];
  prefer?: string[];
  when?: Record<string, any>;
}

export interface OMIR {
  version: number; // OML version
  namespaces: string[];
  classes: OMClass[];
  relationTypes: OMRelationType[];
  intents: OMIntent[];
  contexts: OMContext[];
  policies: OMPolicy[];
}
