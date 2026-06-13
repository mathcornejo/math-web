import { useState } from "react";
import { getRewordPrompt } from "../prompts";
import { extractJSON, ollamaGenerate } from "../services/ollama";
import { generateExercises, type GenExercise } from "../services/exerciseEngine";
import { ghostBtn, KEYFRAMES, primaryBtn } from "../styles";
import { T } from "../theme";
import type { Difficulty, Exercise, Level, LevelId, Topic } from "../types";

/** Limpia delimitadores LaTeX y signos de dólar que el modelo pueda insertar. */
function cleanText(s: string): string {
  return String(s ?? "")
    .replace(/\\[()[\]]/g, "")  // \( \) \[ \]
    .replace(/\$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Reescritura OPCIONAL de enunciados con IA. Solo afecta al texto de la pregunta
 * (`q`) de los ejercicios marcados como `rewordable`; nunca toca opciones,
 * respuesta ni explicación (las calcula el motor determinista y son siempre
 * correctas). Cada reescritura se acepta SOLO si conserva todos los números del
 * enunciado original; si no, se conserva el texto determinista.
 */
async function rewordWithAI(exs: GenExercise[], level: LevelId): Promise<GenExercise[]> {
  const items = exs
    .map((e, i) => ({ i, q: e.q, rewordable: e.rewordable }))
    .filter(t => t.rewordable)
    .map(t => ({ i: t.i, q: t.q }));
  if (items.length === 0) return exs;

  const prompt = getRewordPrompt(level, items);
  const resp = await ollamaGenerate(prompt, undefined, { think: false, temperature: 0.5, num_predict: 1200 });
  const parsed = extractJSON<{ items?: { i: number; q: string }[] }>(resp);
  const map = new Map<number, string>();
  for (const it of parsed?.items ?? []) {
    if (typeof it.i === "number" && typeof it.q === "string") map.set(it.i, it.q);
  }

  return exs.map((e, idx) => {
    if (!e.rewordable) return e;
    const reworded = map.get(idx);
    if (!reworded) return e;
    const cleaned = cleanText(reworded);
    // VERIFICACIÓN: todos los números deben seguir presentes y longitud razonable.
    const numbersOk = e.mustContain.every(tok => cleaned.includes(tok));
    if (numbersOk && cleaned.length >= 10 && cleaned.length <= 200) return { ...e, q: cleaned };
    return e; // reescritura no fiable → conservar enunciado determinista
  });
}

interface AIExerciseGeneratorProps {
  level: Level;
  topic: Topic;
  color: string;
  onStartQuiz: (exercises: Exercise[]) => void;
  onBack: () => void;
}

interface DifficultyOption {
  id: Difficulty;
  label: string;
  emoji: string;
  desc: string;
}

export function AIExerciseGenerator({ level, topic, color, onStartQuiz, onBack }: AIExerciseGeneratorProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medio");
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState<"thinking" | "building">("thinking");
  const [detectedCount, setDetectedCount] = useState(0);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setGenerating(true);
    setGenPhase("building");
    setDetectedCount(0);
    setExercises(null);
    setError(null);
    try {
      // 1) Generación DETERMINISTA: el motor calcula respuesta, opciones y
      //    explicación. La matemática es siempre correcta y siempre hay set completo.
      let gen = generateExercises(topic.id, difficulty, count);
      setDetectedCount(gen.length);

      // 2) Reescritura OPCIONAL con IA (solo enunciados tipo problema), verificada.
      //    Si Ollama no está disponible o la reescritura altera los números, se
      //    conserva el enunciado determinista. La matemática NUNCA cambia.
      if (gen.some(g => g.rewordable)) {
        setGenPhase("thinking");
        try {
          gen = await rewordWithAI(gen, level.id);
        } catch {
          /* sin conexión o error → se conservan los enunciados deterministas */
        }
      }

      // 3) Quitar campos internos antes de entregar al quiz
      const clean: Exercise[] = gen.map(({ mustContain: _m, rewordable: _r, ...e }) => e);
      if (clean.length === 0) {
        setError("No se pudieron preparar ejercicios para este tema. Intenta de nuevo.");
      } else {
        setExercises(clean);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(`No se pudieron generar los ejercicios: ${message}`);
    } finally {
      setGenerating(false);
    }
  }

  const diffOptions: DifficultyOption[] = [
    { id:"facil",   label:"Fácil",   emoji:"🟢", desc:"Conceptos básicos" },
    { id:"medio",   label:"Medio",   emoji:"🟡", desc:"Aplicación directa" },
    { id:"dificil", label:"Difícil", emoji:"🔴", desc:"Razonamiento avanzado" },
  ];

  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:"28px 20px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <button onClick={onBack} style={ghostBtn}>← Volver</button>
        <div style={{ flex:1 }}>
          <h2 style={{ margin:0, fontSize:20, fontWeight:900, color:T.navy }}>
            🤖 Generador de Ejercicios con IA
          </h2>
          <p style={{ margin:"2px 0 0", fontSize:13, color:T.gray500 }}>
            {topic.icon} {topic.title} · {level.label}
          </p>
        </div>
      </div>

      {/* Config panel */}
      {!exercises && !generating && (
        <div style={{ background:T.white, borderRadius:20, padding:"28px 24px", boxShadow:"0 4px 24px rgba(30,58,95,0.08)", marginBottom:20 }}>
          <h3 style={{ margin:"0 0 20px", fontSize:16, fontWeight:800, color:T.navy }}>Configurar ejercicios</h3>

          {/* Difficulty */}
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:13, fontWeight:700, color:T.gray800, display:"block", marginBottom:10 }}>Dificultad</label>
            <div style={{ display:"flex", gap:10 }}>
              {diffOptions.map(d => (
                <button key={d.id} onClick={() => setDifficulty(d.id)} style={{
                  flex:1, padding:"12px 8px", borderRadius:12, border:`2px solid ${difficulty===d.id ? color : T.gray100}`,
                  background:difficulty===d.id ? color+"15" : T.white, cursor:"pointer", fontFamily:"inherit",
                  textAlign:"center", transition:"all 0.2s",
                }}>
                  <div style={{ fontSize:20 }}>{d.emoji}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:difficulty===d.id ? color : T.gray800 }}>{d.label}</div>
                  <div style={{ fontSize:11, color:T.gray500 }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:13, fontWeight:700, color:T.gray800, display:"block", marginBottom:10 }}>
              Cantidad de ejercicios: <span style={{ color }}>{count}</span>
            </label>
            <div style={{ display:"flex", gap:8 }}>
              {[3,5,8,10].map(n => (
                <button key={n} onClick={() => setCount(n)} style={{
                  padding:"8px 18px", borderRadius:10, border:`2px solid ${count===n ? color : T.gray100}`,
                  background:count===n ? color : T.white, color:count===n ? T.white : T.gray800,
                  fontWeight:700, cursor:"pointer", fontFamily:"inherit", fontSize:14, transition:"all 0.2s",
                }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} style={{
            ...primaryBtn(color), width:"100%", fontSize:16, padding:"14px",
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          }}>
            <span style={{ fontSize:20 }}>✨</span>
            Generar {count} ejercicios con IA
          </button>
        </div>
      )}

      {/* Generating state — sin exponer JSON ni respuestas */}
      {generating && (
        <div style={{ background:T.white, borderRadius:20, padding:"40px 24px", boxShadow:"0 4px 24px rgba(30,58,95,0.08)", marginBottom:20, textAlign:"center" }}>
          <div style={{ fontSize:56, animation:"spin 2s linear infinite", display:"inline-block", marginBottom:16 }}>🤖</div>

          {genPhase === "thinking" ? (
            <>
              <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:800, color:T.navy }}>Dándole un toque con IA ✨</h3>
              <p style={{ margin:"0 0 24px", color:T.gray500, fontSize:14 }}>
                Redactando los enunciados de <strong>{topic.title}</strong> · la matemática ya está lista y verificada
              </p>
              {/* Puntos animados */}
              <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:color, opacity:0.4,
                    animation:`pulse 1.2s ease-in-out ${i*0.4}s infinite` }}/>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:800, color:T.navy }}>Preparando ejercicios...</h3>
              <p style={{ margin:"0 0 20px", color:T.gray500, fontSize:14 }}>
                {detectedCount > 0
                  ? `${detectedCount} de ${count} ejercicios listos`
                  : "Calculando preguntas y opciones..."}
              </p>
              {/* Barra de progreso */}
              <div style={{ background:T.gray100, borderRadius:8, height:8, maxWidth:280, margin:"0 auto" }}>
                <div style={{ height:"100%", borderRadius:8, background:color, transition:"width 0.4s",
                  width: detectedCount > 0 ? `${Math.min((detectedCount/count)*100, 95)}%` : "15%" }}/>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background:"#FEF2F2", border:`2px solid ${T.coral}`, borderRadius:16, padding:"20px 22px", marginBottom:20 }}>
          <p style={{ margin:"0 0 8px", fontWeight:700, color:T.coralDark }}>❌ Error</p>
          <p style={{ margin:"0 0 16px", color:T.gray800, fontSize:14 }}>{error}</p>
          <button onClick={generate} style={primaryBtn(T.coral)}>Reintentar</button>
        </div>
      )}

      {/* Results */}
      {exercises && (
        <div>
          <div style={{ background:"#E8F8EF", border:`2px solid ${T.green}`, borderRadius:16, padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:28 }}>✅</span>
            <div>
              <p style={{ margin:0, fontWeight:800, color:T.greenDark }}>¡{exercises.length} ejercicios generados!</p>
              <p style={{ margin:0, fontSize:13, color:T.gray500 }}>Dificultad: {diffOptions.find(d=>d.id===difficulty)?.label} · Tema: {topic.title}</p>
            </div>
          </div>

          {/* Preview — solo preguntas, sin revelar respuestas */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {exercises.map((ex, i) => (
              <div key={i} style={{ background:T.white, borderRadius:14, padding:"14px 18px", boxShadow:"0 2px 12px rgba(30,58,95,0.06)", display:"flex", gap:12, alignItems:"center" }}>
                <span style={{ width:28, height:28, borderRadius:"50%", background:color, color:T.white, fontSize:13, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {i+1}
                </span>
                <p style={{ margin:0, fontSize:14, fontWeight:600, color:T.navy, lineHeight:1.4, flex:1 }}>
                  {ex.q}
                </p>
                <span style={{ fontSize:11, color:T.gray500, flexShrink:0, whiteSpace:"nowrap" }}>
                  {ex.opts.length} opciones
                </span>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => { setExercises(null); setError(null); }} style={ghostBtn}>
              🔄 Regenerar
            </button>
            <button onClick={() => onStartQuiz(exercises)} style={{ ...primaryBtn(color), flex:1 }}>
              ▶ Iniciar quiz con estos ejercicios
            </button>
          </div>
        </div>
      )}

      <style>{KEYFRAMES}</style>
    </div>
  );
}
