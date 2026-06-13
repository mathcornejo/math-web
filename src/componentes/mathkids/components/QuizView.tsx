import { useState } from "react";
import { ghostBtn, KEYFRAMES, primaryBtn } from "../styles";
import { T } from "../theme";
import type { BotMood, Exercise, Level, Topic } from "../types";
import { ExplanationPanel } from "./ExplanationPanel";
import { TutorChat } from "./TutorChat";

interface QuizViewProps {
  topic: Topic;
  level: Level;
  color: string;
  questions: Exercise[];
  onBack: () => void;
  onComplete: (earnedXp: number) => void;
}

const BOTS: Record<BotMood, string> = { idle:"😊", correct:"🥳", wrong:"😅", celebrate:"🎉" };

export function QuizView({ topic, level, color, questions, onBack, onComplete }: QuizViewProps) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [mood, setMood] = useState<BotMood>("idle");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [done, setDone] = useState(false);

  const q = questions[idx];

  // Guarda defensiva: nunca renderizar sin una pregunta válida (evita pantalla en blanco)
  if (!q) {
    return (
      <div style={{ textAlign:"center", padding:"52px 24px", maxWidth:520, margin:"0 auto" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
        <h2 style={{ fontSize:20, color:T.navy, margin:"0 0 8px" }}>No hay ejercicios disponibles</h2>
        <p style={{ color:T.gray500, marginBottom:24 }}>Vuelve e inténtalo de nuevo.</p>
        <button onClick={onBack} style={primaryBtn(color)}>← Volver</button>
      </div>
    );
  }

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === q.ans;
    setMood(correct ? "correct" : "wrong");
    if (correct) setScore(s => s+1);
  }

  function next() {
    if (idx+1 < questions.length) {
      setIdx(n => n+1); setSelected(null); setMood("idle"); setShowHint(false);
    } else {
      setDone(true); setMood("celebrate");
    }
  }

  if (done) {
    const pct = Math.round((score/questions.length)*100);
    const earned = Math.round((score/questions.length)*topic.xp);
    return (
      <div style={{ textAlign:"center", padding:"52px 24px", maxWidth:560, margin:"0 auto" }}>
        <div style={{ fontSize:64, marginBottom:8 }}>{pct>=80?"🏆":pct>=50?"🎯":"📖"}</div>
        <h2 style={{ fontSize:26, color:T.navy, margin:"0 0 8px" }}>¡Ejercicio completado!</h2>
        <p style={{ color:T.gray500, marginBottom:28 }}>Respondiste {score} de {questions.length} correctamente</p>
        <div style={{ display:"inline-flex", background:T.offWhite, borderRadius:20, overflow:"hidden", marginBottom:32, border:`1px solid ${T.gray100}` }}>
          {[{v:`${score}/${questions.length}`,l:"Correctas",c:color},{v:`+${earned}`,l:"XP ganados",c:T.yellow},{v:`${pct}%`,l:"Precisión",c:pct>=80?T.green:pct>=50?T.orange:T.coral}].map((s,i)=>(
            <div key={i} style={{ textAlign:"center", padding:"20px 28px", borderRight:i<2?`1px solid ${T.gray100}`:"none" }}>
              <div style={{ fontSize:30, fontWeight:900, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:12, color:T.gray500, marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={onBack} style={ghostBtn}>← Volver</button>
          <button onClick={() => onComplete(earned)} style={primaryBtn(color)}>Guardar progreso ✓</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:660, margin:"0 auto", padding:"24px 16px", position:"relative" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <button onClick={onBack} style={ghostBtn}>← Salir</button>
        <span style={{ fontSize:13, color:T.gray500, fontWeight:600 }}>{idx+1} / {questions.length}</span>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:13, fontWeight:700, color:T.green }}>✓ {score}</span>
          <button onClick={() => setShowTutor(v => !v)} style={{
            background:showTutor ? color : T.white, color:showTutor ? T.white : color,
            border:`2px solid ${color}`, borderRadius:20, padding:"5px 12px",
            fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5,
          }}>
            🤖 {showTutor ? "Cerrar tutor" : "Pedir ayuda"}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height:6, background:T.gray100, borderRadius:3, marginBottom:24, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${(idx/questions.length)*100}%`, background:color, borderRadius:3, transition:"width 0.4s" }}/>
      </div>

      {/* Question card */}
      <div style={{ background:T.white, borderRadius:20, padding:"24px 22px", boxShadow:"0 4px 24px rgba(30,58,95,0.08)", marginBottom:16 }}>
        <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
          <div style={{ fontSize:50, transition:"transform 0.3s", transform:mood==="correct"?"scale(1.3) rotate(-8deg)":mood==="wrong"?"scale(0.88)":"scale(1)" }}>
            {BOTS[mood]}
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:17, fontWeight:700, color:T.navy, lineHeight:1.55, margin:0 }}>{q.q}</p>
            {showHint && (
              <div style={{ marginTop:12, padding:"10px 14px", background:"#FFF8E1", borderRadius:10, borderLeft:`3px solid ${T.yellow}`, fontSize:13, color:T.gray800, lineHeight:1.5 }}>
                💡 <strong>Pista:</strong> {q.hint}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Options */}
      <div style={{ display:"grid", gap:10, marginBottom:16 }}>
        {q.opts?.map((opt,i) => {
          let bg:string = T.white, border:string = T.gray300, tc:string = T.gray800;
          if (selected !== null) {
            if (i===q.ans) { bg="#E8F8EF"; border=T.green; tc=T.greenDark; }
            else if (i===selected) { bg="#FEEAEA"; border=T.coral; tc=T.coralDark; }
          }
          return (
            <button key={i} onClick={() => pick(i)} style={{ background:bg, border:`2px solid ${border}`, borderRadius:12, padding:"13px 18px", textAlign:"left", cursor:selected!==null?"default":"pointer", color:tc, fontWeight:600, fontSize:15, fontFamily:"inherit", transition:"all 0.2s", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ width:28, height:28, borderRadius:"50%", background:border+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:border, flexShrink:0 }}>{String.fromCharCode(65+i)}</span>
              <span style={{ flex:1 }}>{opt}</span>
              {selected!==null && i===q.ans && <span>✅</span>}
              {selected!==null && i===selected && i!==q.ans && <span>❌</span>}
            </button>
          );
        })}
      </div>

      {!showHint && selected===null && (
        <button onClick={() => setShowHint(true)} style={{ background:"none", border:`1px solid ${T.yellow}`, color:T.yellowDark, borderRadius:8, padding:"8px 16px", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit" }}>
          💡 Ver pista
        </button>
      )}

      {selected !== null && <ExplanationPanel question={q} color={color} isCorrect={selected===q.ans}/>}

      {selected !== null && (
        <div style={{ marginTop:16, textAlign:"right" }}>
          <button onClick={next} style={primaryBtn(color)}>
            {idx+1 < questions.length ? "Siguiente →" : "Ver resultados 🎉"}
          </button>
        </div>
      )}

      {/* Tutor chat */}
      {showTutor && (
        <TutorChat
          level={level}
          topic={topic}
          color={color}
          currentQuestion={selected === null ? q : null}
          onClose={() => setShowTutor(false)}
        />
      )}

      <style>{KEYFRAMES}</style>
    </div>
  );
}
