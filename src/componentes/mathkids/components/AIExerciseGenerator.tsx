import { useState } from "react";
import { OLLAMA_MODEL } from "../config";
import { getExerciseGeneratorPrompt } from "../prompts";
import { extractJSON, ollamaGenerate } from "../services/ollama";
import { ghostBtn, KEYFRAMES, primaryBtn } from "../styles";
import { T } from "../theme";
import type { Difficulty, Exercise, Level, Topic } from "../types";

/**
 * Normaliza un valor para comparación: quita espacios, $, marcas ✓, unidades
 * frecuentes y símbolos finales. "  $72 ✓ " → "72", "153.86 cm²" → "153.86".
 */
function normalizeValue(s: string): string {
  return s
    .replace(/[✓✅]/g, "")
    .replace(/\((?:opci|respuesta|correct)[^)]*\)/gi, "") // quita notas "(opción b)"
    .trim()
    .replace(/\s+/g, "")
    .replace(/\$/g, "")
    .replace(/[°%]/g, "")
    .replace(/(cm³|cm²|m³|m²|cm|mm|km|kg|ml|min|m|g|l)$/i, "")
    .replace(/^[a-z]=/i, "") // quita prefijo de variable "x=", "y=", "n="…
    .toLowerCase();
}

/** Compara dos valores ya normalizados: numéricamente si ambos son números, si no por igualdad exacta. */
function valuesMatch(a: string, b: string): boolean {
  const isNum = (x: string) => /^-?\d*\.?\d+$/.test(x);
  if (isNum(a) && isNum(b)) return Math.abs(parseFloat(a) - parseFloat(b)) < 0.001;
  return a === b;
}

/** Limpia delimitadores LaTeX y signos de dólar que el modelo a veces inserta. */
function cleanText(s: string): string {
  return String(s ?? "")
    .replace(/\\[()[\]]/g, "")  // \( \) \[ \]
    .replace(/\$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normaliza un ejercicio recién parseado: limpia textos y quita prefijos "a. " de las opciones. */
function sanitizeExercise(ex: Exercise): Exercise {
  return {
    ...ex,
    q: cleanText(ex.q),
    opts: (ex.opts ?? []).map(o => cleanText(o).replace(/^[a-dA-D][.)]\s*/, "")),
    hint: cleanText(ex.hint),
    explanation: ex.explanation
      ? {
          steps: (ex.explanation.steps ?? []).map(cleanText),
          formula: ex.explanation.formula ? cleanText(ex.explanation.formula) : undefined,
        }
      : undefined,
  };
}

/**
 * Extrae el valor de respuesta del último paso "real" de la explicación.
 * Ignora líneas de verificación/comprobación y toma el valor tras el último "=".
 * Devuelve null si no encuentra un resultado claro (el ejercicio se descartará).
 */
function extractAnswerFromExplanation(steps: string[]): string | null {
  for (const raw of [...steps].reverse()) {
    const step = raw.trim();
    // Las líneas de verificación re-derivan el enunciado y darían un valor equivocado
    if (/verif|comprob|comprueb/i.test(step)) continue;

    const eqMatches = [...step.matchAll(/=\s*([^=]+?)(?:[✓✅]|$)/g)];
    if (eqMatches.length > 0) {
      const candidate = eqMatches[eqMatches.length - 1][1]
        .replace(/[✓✅]/g, "")
        .replace(/\((?:opci|respuesta|correct)[^)]*\)/gi, "") // nota "(opción b)"
        .trim();
      if (candidate.length > 0 && candidate.length < 30) return candidate;
    }
    const res = step.match(/resultado[:\s]+([^\n]+)/i);
    if (res) {
      const candidate = res[1].replace(/[✓✅]/g, "").trim();
      if (candidate.length > 0 && candidate.length < 30) return candidate;
    }
  }
  return null;
}

/**
 * Verifica de forma INDEPENDIENTE que toda operación aritmética escrita en los
 * pasos sea correcta (ej: detecta "5 + 3 = 7" como falso). Si la explicación
 * contiene aritmética errónea, el ejercicio no es confiable.
 */
function explanationArithmeticIsValid(steps: string[]): boolean {
  const re = /(\d+(?:\.\d+)?)\s*([+\-−×x*/÷·])\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)/gi;
  for (const step of steps) {
    // Saltar pasos algebraicos (con variables): "5x-10+3=18" no es una afirmación
    // aritmética sobre números, y validarla daría un falso negativo.
    if (/\d[a-zA-Z]|[a-zA-Z]\s*[=(]|[a-zA-Z]\d/.test(step)) continue;
    for (const m of step.matchAll(re)) {
      const a = parseFloat(m[1]);
      const b = parseFloat(m[3]);
      const stated = parseFloat(m[4]);
      let result: number | null = null;
      switch (m[2]) {
        case "+": result = a + b; break;
        case "-": case "−": result = a - b; break;
        case "×": case "x": case "*": case "·": result = a * b; break;
        case "/": case "÷": result = b !== 0 ? a / b : null; break;
      }
      if (result === null) continue;
      if (Math.abs(result - stated) > 0.05) return false;
    }
  }
  return true;
}

/**
 * Verificación CONSERVADORA para una plataforma de cero tolerancia a errores.
 * Un ejercicio sólo se acepta si:
 *  1. La aritmética de su explicación es correcta.
 *  2. Se puede extraer el resultado final de la explicación.
 *  3. Ese resultado coincide EXACTAMENTE con una (y sólo una) de las opciones.
 * En cualquier otro caso se DESCARTA (nunca se muestra sin verificar).
 * `ans` se reescribe siempre al índice verificado, ignorando el del modelo.
 */
function verifyAndFixAns(exercises: Exercise[]): { fixed: Exercise[]; discarded: number } {
  const fixed: Exercise[] = [];
  let discarded = 0;

  for (const ex of exercises) {
    const steps = ex.explanation?.steps ?? [];

    if (!explanationArithmeticIsValid(steps)) { discarded++; continue; }

    const expected = extractAnswerFromExplanation(steps);
    if (!expected) { discarded++; continue; }

    const normExpected = normalizeValue(expected);
    const matchingIdx = ex.opts
      .map((opt, i) => ({ i, match: valuesMatch(normalizeValue(opt), normExpected) }))
      .filter(x => x.match)
      .map(x => x.i);

    // Debe coincidir con exactamente una opción: ni cero (no está) ni varias (ambiguo)
    if (matchingIdx.length !== 1) { discarded++; continue; }

    fixed.push({ ...ex, ans: matchingIdx[0] });
  }

  return { fixed, discarded };
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
    setGenPhase("thinking");
    setDetectedCount(0);
    setExercises(null);
    setError(null);
    try {
      const prompt = getExerciseGeneratorPrompt(level.id, topic.title, difficulty, count);
      const responseText = await ollamaGenerate(
        prompt,
        (chunk) => {
          if (chunk.startsWith("🤔")) {
            setGenPhase("thinking");
          } else {
            setGenPhase("building");
            setDetectedCount((chunk.match(/"q"\s*:/g) ?? []).length);
          }
        },
        {
          think: false,       // Desactiva el razonamiento interno — no necesario para generar JSON
          temperature: 0.4,   // Baja temperatura = JSON más consistente y predecible
          num_predict: 2048,  // 5 ejercicios en JSON ≈ 800-1200 tokens; 2048 es suficiente
        },
      );
      const parsed = extractJSON<{ exercises?: Exercise[] }>(responseText);
      const raw = (parsed?.exercises ?? []).map(sanitizeExercise);

      // 1. Validación estructural
      const structural = raw.filter(ex =>
        typeof ex.q === "string" && ex.q.trim().length > 0 &&
        Array.isArray(ex.opts) && ex.opts.length === 4 &&
        Number.isInteger(ex.ans) && ex.ans >= 0 && ex.ans <= 3 &&
        new Set(ex.opts).size === 4,
      );

      // 2. Verificar que opts[ans] coincide con la explicación — corregir si es posible
      const { fixed, discarded } = verifyAndFixAns(structural);

      if (fixed.length > 0) {
        setExercises(fixed);
        if (discarded > 0) {
          // Informar al profesor/desarrollador sin bloquear al estudiante
          console.warn(`[AI] ${discarded} ejercicio(s) descartados por inconsistencia entre ans y explicación.`);
        }
      } else if (structural.length > 0) {
        setError(`El modelo generó ${raw.length} ejercicio(s) pero las respuestas no coincidían con las explicaciones. Intenta de nuevo.`);
      } else if (raw.length > 0) {
        setError(`El modelo generó ${raw.length} ejercicio(s) pero ninguno pasó la validación de estructura. Intenta de nuevo.`);
      } else {
        setError("No se pudo parsear el JSON. Intenta de nuevo.");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(`Error conectando con Ollama: ${message}`);
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
              <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:800, color:T.navy }}>Analizando el tema...</h3>
              <p style={{ margin:"0 0 24px", color:T.gray500, fontSize:14 }}>
                El modelo está preparando ejercicios de <strong>{topic.title}</strong>
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
              <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:800, color:T.navy }}>Creando ejercicios...</h3>
              <p style={{ margin:"0 0 20px", color:T.gray500, fontSize:14 }}>
                {detectedCount > 0
                  ? `${detectedCount} de ${count} ejercicios listos`
                  : "Escribiendo preguntas y opciones..."}
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
          <p style={{ margin:"0 0 12px", color:T.gray500, fontSize:13 }}>
            Asegúrate de que Ollama está corriendo: <code style={{ background:"#FEE2E2", padding:"2px 6px", borderRadius:4 }}>ollama serve</code><br/>
            Y que el modelo está instalado: <code style={{ background:"#FEE2E2", padding:"2px 6px", borderRadius:4 }}>ollama pull {OLLAMA_MODEL}</code>
          </p>
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
