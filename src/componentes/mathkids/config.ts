// ─── Ollama Config ─────────────────────────────────────────────────────────────
// Cambia esto si tu Ollama corre en otro puerto o host
export const OLLAMA_URL = "http://localhost:11434";
// Modelos compatibles confirmados: llama3.2, mistral, gemma2, qwen3:4b, qwen3:8b
// qwen3 es un modelo razonador: produce más tokens internos pero la plataforma
// lo soporta con extractJSON que elimina el bloque <think>…</think>.
export const OLLAMA_MODEL = "deepseek-r1";
