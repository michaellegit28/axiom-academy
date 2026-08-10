// assets/js/webllm-engine.js
// Axiom AI inference engine — runs entirely in the browser via WebLLM + WebGPU.
// No backend, no API key, no data leaves the device. Falls back gracefully
// on unsupported browsers — callers should check isWebGPUSupported() first.

const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

let engine = null;
let loading = null;

export function isWebGPUSupported() {
  return typeof navigator !== "undefined" && !!navigator.gpu;
}

export async function loadEngine(onProgress) {
  if (engine) return engine;
  if (loading) return loading;

  loading = (async () => {
    const webllm = await import("https://esm.run/@mlc-ai/web-llm");
    const eng = new webllm.MLCEngine();
    eng.setInitProgressCallback((report) => {
      if (onProgress) onProgress(report);
    });
    await eng.reload(MODEL_ID);
    engine = eng;
    return eng;
  })();

  return loading;
}

export async function streamReply(messages, onDelta) {
  if (!engine) throw new Error("Engine not loaded yet.");
  const stream = await engine.chat.completions.create({
    messages,
    stream: true,
    temperature: 0.6,
    max_tokens: 400,
  });
  let full = "";
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content || "";
    full += delta;
    if (delta && onDelta) onDelta(full);
  }
  return full;
}
