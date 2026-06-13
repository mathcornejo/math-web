import { OLLAMA_MODEL } from "../config";
import { T } from "../theme";
import type { OllamaStatus } from "../types";

interface OllamaBadgeProps {
  status: OllamaStatus;
}

export function OllamaBadge({ status }: OllamaBadgeProps) {
  const cfg: Record<OllamaStatus, { color: string; label: string }> = {
    checking: { color:"#94A3B8", label:"Verificando Ollama..." },
    online:   { color:T.green,   label:`Ollama online · ${OLLAMA_MODEL}` },
    offline:  { color:T.coral,   label:"Ollama offline" },
  };
  const { color, label } = cfg[status];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:20, background:"rgba(255,255,255,0.1)", fontSize:12, color:T.white }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:color, display:"inline-block", boxShadow:status==="online"?`0 0 6px ${color}`:undefined }}/>
      {label}
    </div>
  );
}
