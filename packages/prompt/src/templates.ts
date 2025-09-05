import type { PromptSummary } from './types';

export function renderSystem(summary: PromptSummary, intentLabel: string, ctxLabels: string[]) {
  const core = `You are OntoMind assistant. Follow ontology strictly.
` +
    `- Use the provided schema vocabulary.
` +
    `- Return JSON exactly matching the tool schema when asked.
` +
    `- Cite entity ids when relevant.
`;
  const classes = summary.classes.map(c => `• ${c.label} (${c.id}) → { ${c.props.map(p => p.key+':'+p.type).join(', ')} }`).join('\n');
  const rels = summary.relations.map(r => `• ${r.label} : ${r.domain} → ${r.range} [${r.card || ''}]`).join('\n');
  const ctx = ctxLabels.length ? `Active contexts: ${ctxLabels.join(', ')}` : '';
  return [core, `# Classes
${classes}`, `# Relations
${rels}`, ctx, `# Active Intent
${intentLabel}`].filter(Boolean).join('\n');
}

export function renderUser(intentLabel: string, targetIds: string[], evidence: any[]) {
  const head = `Intent: ${intentLabel}`;
  const targets = targetIds.length ? `Targets: ${targetIds.join(', ')}` : '';
  const ev = evidence.length ? `Evidence:
${evidence.map(e => `- ${e.id} ${JSON.stringify(e.data)}`).join('\n')}` : 'Evidence: (none)';
  return [head, targets, ev].filter(Boolean).join('\n');
}