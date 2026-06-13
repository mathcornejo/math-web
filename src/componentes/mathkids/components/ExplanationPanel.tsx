import { T } from "../theme";
import type { Exercise } from "../types";

interface ExplanationPanelProps {
  question: Exercise;
  color: string;
  isCorrect: boolean;
}

export function ExplanationPanel({ question, color, isCorrect }: ExplanationPanelProps) {
  const { explanation } = question;
  if (!explanation) return null;
  return (
    <div style={{ background:isCorrect ? "#F0FBF4" : "#FEF9EC", border:`2px solid ${isCorrect ? T.green : T.yellow}`, borderRadius:16, padding:"20px 22px", marginTop:16, animation:"fadeIn 0.4s ease" }}>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        <span style={{ fontSize:28, flexShrink:0 }}>🧑‍🏫</span>
        <div style={{ flex:1 }}>
          <p style={{ margin:"0 0 12px", fontWeight:800, fontSize:15, color:T.navy }}>
            {isCorrect ? "¡Correcto! Así se resuelve:" : "Así se resuelve correctamente:"}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:explanation.formula ? 14 : 0 }}>
            {explanation.steps?.map((step, i) => (
              <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ width:24, height:24, borderRadius:"50%", background:color, color:T.white, fontSize:11, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{i+1}</span>
                <span style={{ fontSize:14, color:T.gray800, lineHeight:1.5 }}>{step}</span>
              </div>
            ))}
          </div>
          {explanation.formula && (
            <div style={{ marginTop:12, background:T.navy, borderRadius:10, padding:"10px 16px", display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ fontSize:18 }}>📌</span>
              <span style={{ fontSize:13, color:T.yellow, fontWeight:700, fontFamily:"monospace", lineHeight:1.5 }}>{explanation.formula}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
