import { useEffect, useState } from "react";
import { OLLAMA_MODEL, OLLAMA_URL } from "../config";
import type { OllamaStatus } from "../types";

interface OllamaTagsResponse {
  models?: { name: string }[];
}

export function useOllamaStatus(): { status: OllamaStatus; models: string[] } {
  const [status, setStatus] = useState<OllamaStatus>("checking");
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${OLLAMA_URL}/api/tags`)
      .then(r => r.json() as Promise<OllamaTagsResponse>)
      .then(d => {
        setModels(d.models?.map(m => m.name) ?? []);
        setStatus("online");
        // Pre-calentar el modelo: cargarlo en memoria ahora para que la primera
        // generación de ejercicios no espere los ~12s de carga inicial.
        warmupModel();
      })
      .catch(() => setStatus("offline"));
  }, []);

  return { status, models };
}

function warmupModel() {
  fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: "ok",
      stream: false,
      think: false,
      options: { num_predict: 1 },
    }),
  }).catch(() => { /* silencioso — solo es un precalentamiento */ });
}
