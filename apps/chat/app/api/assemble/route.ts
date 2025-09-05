import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { assemblePrompt } from '@ontomind/prompt/assemble';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const intentKey = body.intentKey as string;
  const targetIds = (body.targetIds as string[]) || [];
  const contextIds = (body.contextIds as string[]) || [];

  try {
    const bundle = assemblePrompt(
      { intentKey, targetIds, contextIds, maxEvidence: 8 },
      {
        promptSummaryPath: path.join(process.cwd(), 'data', 'generated', 'prompt-summary.json'),
        intentsSchemaPath: path.join(process.cwd(), 'data', 'generated', 'intents.schema.json'),
        instancesDir: path.join(process.cwd(), 'data', 'instances')
      }
    );
    return NextResponse.json(bundle);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 400 });
  }
}