// tools/chat-call.ts
import path from "node:path";
import { assemblePrompt } from "@ontomind/prompt";
import { callLLM } from "@ontomind/port";

const intentKey = process.argv[2] || "intent:diagnose@1.0.0";
const targets = (process.argv[3]?.split(",") || []).filter(Boolean);
const stream = process.argv.includes("--stream");

const providerFlag = process.argv.find(a => a.startsWith('--provider=')) || '';
const provider = (providerFlag.split('=')[1] as 'openai'|'mock') || 'openai';

const modelFlag = process.argv.find(a => a.startsWith('--model=')) || '';
const model = modelFlag.split('=')[1]; // 선택

(async () => {
  const bundle = assemblePrompt(
    { intentKey, targetIds: targets, maxEvidence: 8 },
    {
      promptSummaryPath: path.join(process.cwd(), "data", "generated", "prompt-summary.json"),
      intentsSchemaPath: path.join(process.cwd(), "data", "generated", "intents.schema.json"),
      instancesDir: path.join(process.cwd(), "data", "instances"),
    }
  );

  const res = await callLLM(bundle, {
    provider,
    model,
    stream,
    intentKey, // 검증에 사용
  });

  if (stream && res.stream) {
    // 단순 스트림 중계 (stdout에 그대로 토해주기)
    const reader = (res.stream as ReadableStream).getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      process.stdout.write(decoder.decode(value));
    }
    process.stdout.write("\n");
    return;
  }

  // 논-스트리밍
  if (!res.ok) {
    console.error("[FAIL]", res.error, res.details || "");
    process.exit(1);
  }
  console.log("[OK]");
  console.log(JSON.stringify(res.output, null, 2));
})();