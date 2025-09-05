import type { OMIR } from '@ontomind/core/types';

export interface AssembleOptions {
  intentKey: string;           // 예: "intent:diagnose@1.0.0"
  targetIds?: string[];        // 예: ["project:Project/ontomind-core"]
  contextIds?: string[];       // 예: ["core:Context/workspace-admin"]
  maxEvidence?: number;        // 기본 10
}

export interface PromptBundle {
  system: string;
  user: string;
  toolSchema?: Record<string, any>; // 선택: Intent Output schema
  evidence?: any[];                 // 선택: 첨부 데이터 (ABox 서브셋)
}

export interface DataSources {
  promptSummaryPath: string;         // data/generated/prompt-summary.json
  intentsSchemaPath: string;         // data/generated/intents.schema.json
  instancesDir?: string;             // data/instances (선택)
}

export interface PromptSummary {
  version: number;
  namespaces: string[];
  classes: Array<{ id: string; label: string; props: Array<{ key: string; type: string }> }>;
  relations: Array<{ id: string; label: string; domain: string; range: string; card?: string }>;
  intents: Array<{ id: string; label: string; input: Record<string,string>; output: Record<string,string> }>;
  policies: Array<{ id: string; label: string }>;
  contexts: Array<{ id: string; label: string; role?: string }>;
}
