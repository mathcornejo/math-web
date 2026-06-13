import { OLLAMA_MODEL, OLLAMA_URL } from "../config";
import type { ChatMessage } from "../types";

/** Recibe el texto acumulado en cada chunk del stream */
export type StreamHandler = (accumulated: string) => void;

// ─── Chunk shapes ─────────────────────────────────────────────────────────────
// Los modelos razonadores (qwen3, deepseek-r1, …) emiten sus tokens de thinking
// en campos separados: "thinking" en /api/generate, "message.thinking" en /api/chat.
// El campo "response" / "message.content" llega vacío durante ese período.
interface OllamaChatChunk {
  message?: { content?: string; thinking?: string };
}

interface OllamaGenerateChunk {
  response?: string;
  thinking?: string;
}

function parseLine<TChunk>(line: string): TChunk | null {
  try { return JSON.parse(line) as TChunk; } catch { return null; }
}

// ─── Opciones de inferencia ───────────────────────────────────────────────────
export interface InferenceOptions {
  temperature?: number;
  num_predict?: number;
  /** false = desactiva el razonamiento interno de deepseek-r1/qwen3 (mucho más rápido
   *  para tareas estructuradas como generación de JSON). true = reasoning completo. */
  think?: boolean;
}

// ─── /api/generate ────────────────────────────────────────────────────────────
export async function ollamaGenerate(
  prompt: string,
  onChunk?: StreamHandler,
  opts: InferenceOptions = {},
): Promise<string> {
  const { temperature = 0.8, num_predict = 4096, think } = opts;
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: true,
      // "think" en el body (no en options) controla el reasoning mode de deepseek-r1/qwen3
      ...(think !== undefined && { think }),
      options: { temperature, num_predict },
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  if (!res.body) throw new Error("Ollama error: respuesta sin cuerpo");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let thinking = "";
  let response = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split("\n").filter(Boolean);
    for (const line of lines) {
      const chunk = parseLine<OllamaGenerateChunk>(line);
      if (!chunk) continue;

      if (chunk.thinking) {
        // Mostrar razonamiento en el stream del UI para que el usuario vea progreso.
        // El prefijo "🤔 " lo diferencia visualmente del JSON final.
        thinking += chunk.thinking;
        onChunk?.("🤔 Razonando...\n\n" + thinking);
      }
      if (chunk.response) {
        response += chunk.response;
        // En cuanto llegan tokens de respuesta, mostrar solo esos
        // (sobreescribiendo el thinking en la UI).
        onChunk?.(response);
      }
    }
  }
  return response;
}

// ─── /api/chat ────────────────────────────────────────────────────────────────
// El tutor usa think:true (default) — el razonamiento interno mejora la calidad
// pedagógica. num_predict reducido a 1024: suficiente para respuestas educativas.
export async function ollamaChat(
  messages: ChatMessage[],
  onChunk?: StreamHandler,
  opts: InferenceOptions = {},
): Promise<string> {
  const { temperature = 0.7, num_predict = 1024, think } = opts;
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: true,
      // "think" en el body controla el reasoning mode de deepseek-r1/qwen3
      ...(think !== undefined && { think }),
      options: { temperature, num_predict },
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  if (!res.body) throw new Error("Ollama error: respuesta sin cuerpo");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split("\n").filter(Boolean);
    for (const line of lines) {
      const content = parseLine<OllamaChatChunk>(line)?.message?.content;
      if (content) { full += content; onChunk?.(full); }
    }
  }
  return full;
}

// ─── Parse JSON from LLM output ───────────────────────────────────────────────
export function extractJSON<T>(text: string): T | null {
  // Quitar bloque <think>…</think> que algunos modelos incluyen en el campo response
  const stripped = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  // Buscar bloque ```json … ``` o, como fallback, el primer objeto JSON {...}
  const match = stripped.match(/```(?:json)?\s*([\s\S]*?)```/) ?? stripped.match(/(\{[\s\S]*\})/);
  if (!match) return null;
  const raw = match[1].trim();
  try { return JSON.parse(raw) as T; } catch { /* intento de reparación abajo */ }
  // El modelo a veces emite LaTeX (\( , \frac, \sqrt…) dentro de strings JSON.
  // Esos backslashes no son escapes JSON válidos y rompen JSON.parse, perdiendo
  // TODO el lote. Escapamos los backslashes que no formen un escape válido.
  try {
    const repaired = raw.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
    return JSON.parse(repaired) as T;
  } catch {
    return null;
  }
}
