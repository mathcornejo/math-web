import { ghostBtn } from "../styles";
import { T } from "../theme";
import type { Topic } from "../types";

interface TopicDetailProps {
  topic: Topic;
  color: string;
  completed: boolean;
  onStartPreset: () => void;
  onStartAI: () => void;
  onBack: () => void;
}

export function TopicDetail({ topic, color, completed, onStartPreset, onStartAI, onBack }: TopicDetailProps) {
  return (
    <div style={{ maxWidth:640, margin:"0 auto", padding:"32px 20px" }}>
      <button onClick={onBack} style={{ ...ghostBtn, marginBottom:20 }}>← Volver</button>

      <div style={{ background:color, borderRadius:20, padding:"28px 24px", color:T.white, marginBottom:24, display:"flex", gap:16, alignItems:"center" }}>
        <div style={{ fontSize:52 }}>{topic.icon}</div>
        <div>
          <h2 style={{ margin:"0 0 4px", fontSize:22, fontWeight:900 }}>{topic.title}</h2>
          <p style={{ margin:0, opacity:0.85, fontSize:14 }}>{topic.desc}</p>
          <div style={{ marginTop:8, display:"flex", gap:12 }}>
            <span style={{ fontSize:12, background:"rgba(255,255,255,0.2)", padding:"4px 12px", borderRadius:20, fontWeight:700 }}>⭐ {topic.xp} XP</span>
            {completed && <span style={{ fontSize:12, background:"rgba(255,255,255,0.2)", padding:"4px 12px", borderRadius:20, fontWeight:700 }}>✓ Completado</span>}
          </div>
        </div>
      </div>

      <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:800, color:T.navy }}>¿Cómo quieres practicar?</h3>

      <div style={{ display:"grid", gap:16 }}>
        {/* Static exercises */}
        <div onClick={onStartPreset} style={{ background:T.white, borderRadius:20, padding:"22px 24px", cursor:"pointer", border:`2px solid ${T.gray100}`, boxShadow:"0 2px 16px rgba(30,58,95,0.07)", transition:"all 0.2s" }}
          onMouseEnter={e=>{e.currentTarget.style.border=`2px solid ${color}`;e.currentTarget.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.currentTarget.style.border="2px solid "+T.gray100;e.currentTarget.style.transform="translateY(0)";}}>
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
            <span style={{ fontSize:40 }}>📚</span>
            <div style={{ flex:1 }}>
              <p style={{ margin:"0 0 4px", fontWeight:800, fontSize:16, color:T.navy }}>Ejercicios clásicos</p>
              <p style={{ margin:0, fontSize:13, color:T.gray500 }}>Ejercicios predefinidos con explicaciones paso a paso</p>
            </div>
            <span style={{ fontSize:20, color:T.gray300 }}>→</span>
          </div>
        </div>

        {/* AI generator */}
        <div onClick={onStartAI} style={{ background:`linear-gradient(135deg, ${color}10, ${color}20)`, borderRadius:20, padding:"22px 24px", cursor:"pointer", border:`2px solid ${color}40`, boxShadow:"0 2px 16px rgba(30,58,95,0.07)", transition:"all 0.2s", position:"relative", overflow:"hidden" }}
          onMouseEnter={e=>{e.currentTarget.style.border=`2px solid ${color}`;e.currentTarget.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.currentTarget.style.border=`2px solid ${color}40`;e.currentTarget.style.transform="translateY(0)";}}>
          <div style={{ position:"absolute", top:-10, right:-10, fontSize:80, opacity:0.07 }}>🤖</div>
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
            <span style={{ fontSize:40 }}>✨</span>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <p style={{ margin:0, fontWeight:800, fontSize:16, color:T.navy }}>Ejercicios con IA</p>
                <span style={{ fontSize:10, background:color, color:T.white, padding:"2px 8px", borderRadius:20, fontWeight:700 }}>NUEVO</span>
              </div>
              <p style={{ margin:0, fontSize:13, color:T.gray500 }}>Genera ejercicios únicos con Ollama · Dificultad personalizable</p>
            </div>
            <span style={{ fontSize:20, color:color }}>→</span>
          </div>
        </div>

        {/* Always-on tutor */}
        <div style={{ background:T.offWhite, borderRadius:16, padding:"16px 20px", border:`1px dashed ${T.gray300}`, display:"flex", gap:12, alignItems:"center" }}>
          <span style={{ fontSize:28 }}>🤖</span>
          <div>
            <p style={{ margin:"0 0 2px", fontWeight:700, fontSize:14, color:T.navy }}>MathBot siempre disponible</p>
            <p style={{ margin:0, fontSize:12, color:T.gray500 }}>Durante cualquier ejercicio puedes pedir ayuda al tutor de IA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
