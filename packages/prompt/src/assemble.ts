import path from 'node:path';
import { loadIntentsSchema, loadPromptSummary, collectInstances, pickEvidence } from './filters';
import { renderSystem, renderUser } from './templates';
import type { AssembleOptions, DataSources, PromptBundle, PromptSummary } from './types';

export function assemblePrompt(opts: AssembleOptions, src: DataSources): PromptBundle {
  const summary = loadPromptSummary(src.promptSummaryPath) as PromptSummary;
  const intentsSchema = loadIntentsSchema(src.intentsSchemaPath);

  // intent 선택
  const intent = summary.intents.find(i => i.id === opts.intentKey);
  if (!intent) throw new Error(`intent not found: ${opts.intentKey}`);

  // 컨텍스트 라벨 모으기(선택)
  const ctxLabels = (opts.contextIds || [])
    .map(cid => summary.contexts.find(c => c.id === cid)?.label)
    .filter(Boolean) as string[];

  // 증거 수집 (선택: ABox 없으면 비어있음)
  const instances = collectInstances(src.instancesDir);
  const evidence = pickEvidence(opts.targetIds || [], instances, opts.maxEvidence ?? 10);

  // system/user
  const system = renderSystem(summary, intent.label, ctxLabels);
  const user = renderUser(intent.label, opts.targetIds || [], evidence);

  // toolSchema: intent output schema를 제공(있으면 검사 가능)
  const toolSchema = intentsSchema[opts.intentKey]?.output || intentsSchema[opts.intentKey];

  return { system, user, toolSchema, evidence };
}
