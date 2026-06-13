import { useState, useRef, useEffect } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  navy:"#1E3A5F", navyLight:"#2A5080", sky:"#4A90D9",
  yellow:"#FFD23F", yellowDark:"#E6B800",
  green:"#2ECC71", greenDark:"#27AE60",
  coral:"#FF6B6B", coralDark:"#E05555",
  purple:"#9B59B6", purpleDark:"#8E44AD",
  teal:"#1ABC9C", tealDark:"#17A589",
  orange:"#F39C12",
  white:"#FFFFFF", offWhite:"#F7F9FC",
  gray100:"#EEF1F5", gray300:"#BFC8D6", gray500:"#7A8A9E", gray800:"#2D3748",
};

// ─── Ollama Config ─────────────────────────────────────────────────────────────
// Cambia esto si tu Ollama corre en otro puerto o host
const OLLAMA_URL = "http://localhost:11434";
const OLLAMA_MODEL = "llama3.2"; // Cambia al modelo que tengas: llama3.2, mistral, gemma2, etc.

// ─── Ollama API helpers ────────────────────────────────────────────────────────
async function ollamaChat(messages, onChunk) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: true,
      options: { temperature: 0.7, num_predict: 1200 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.message?.content) { full += json.message.content; onChunk?.(full); }
      } catch {}
    }
  }
  return full;
}

async function ollamaGenerate(prompt, onChunk) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: true,
      options: { temperature: 0.8, num_predict: 2000 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.response) { full += json.response; onChunk?.(full); }
      } catch {}
    }
  }
  return full;
}

// ─── Parse JSON from LLM output ───────────────────────────────────────────────
function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!match) return null;
  try { return JSON.parse(match[1].trim()); } catch { return null; }
}

// ─── Levels & Topics ──────────────────────────────────────────────────────────
const LEVELS = [
  { id:"primaria",   label:"Primaria",    emoji:"🌱", grades:"1° – 6° Grado",   color:T.green,  dark:T.greenDark,  bg:"#E8F8EF" },
  { id:"secundaria", label:"Secundaria",  emoji:"🚀", grades:"7° – 9° Grado",   color:T.sky,    dark:"#357ABD",    bg:"#E8F4FD" },
  { id:"highschool", label:"High School", emoji:"🎓", grades:"10° – 12° Grado", color:T.purple, dark:T.purpleDark, bg:"#F3EBF9" },
];

const TOPICS = {
  primaria: [
    { id:"suma",        title:"Suma y Resta",          icon:"➕", desc:"Operaciones básicas y problemas cotidianos",         xp:50  },
    { id:"multi",       title:"Multiplicación y División", icon:"✖️", desc:"Tablas, trucos mentales y reparto",              xp:75  },
    { id:"fracciones",  title:"Fracciones",             icon:"🍕", desc:"Partes de un entero, suma y comparación",           xp:100 },
    { id:"decimales",   title:"Números Decimales",      icon:"🔢", desc:"Décimas, centésimas y operaciones",                 xp:80  },
    { id:"geometria",   title:"Geometría Básica",       icon:"🔷", desc:"Perímetros, áreas y figuras",                      xp:60  },
    { id:"medidas",     title:"Medidas y Conversiones", icon:"📏", desc:"Longitud, masa, capacidad y tiempo",                xp:70  },
  ],
  secundaria: [
    { id:"algebra",     title:"Álgebra",                icon:"📐", desc:"Ecuaciones, variables y expresiones",              xp:100 },
    { id:"geometria2",  title:"Geometría Avanzada",     icon:"📐", desc:"Áreas, volúmenes y Teorema de Pitágoras",          xp:120 },
    { id:"estadistica", title:"Estadística",            icon:"📊", desc:"Media, moda, mediana y dispersión",                xp:90  },
    { id:"porcentajes", title:"Porcentajes",            icon:"💯", desc:"Descuentos, IVA y variaciones",                    xp:80  },
    { id:"razones",     title:"Razones y Proporciones", icon:"⚖️", desc:"Regla de tres directa e inversa",                  xp:90  },
    { id:"numeros",     title:"Números y Potencias",    icon:"🔣", desc:"Enteros, racionales, potencias y raíces",          xp:85  },
  ],
  highschool: [
    { id:"funciones",   title:"Funciones",              icon:"📈", desc:"Dominio, rango, composición y gráficas",           xp:150 },
    { id:"trigono",     title:"Trigonometría",          icon:"🔺", desc:"Razones trigonométricas e identidades",            xp:180 },
    { id:"calculo",     title:"Pre-Cálculo",            icon:"∞",  desc:"Límites, derivadas y aplicaciones",                xp:200 },
    { id:"probabilidad",title:"Probabilidad",           icon:"🎲", desc:"Eventos, permutaciones y combinaciones",           xp:160 },
    { id:"matrices",    title:"Matrices y Sistemas",    icon:"⬛", desc:"Determinantes, operaciones y sistemas lineales",   xp:180 },
    { id:"analitica",   title:"Geometría Analítica",    icon:"📉", desc:"Rectas, cónicas y coordenadas en el plano",        xp:170 },
  ],
};

// ─── System prompts para el agente ────────────────────────────────────────────
function getTutorSystemPrompt(level, topic) {
  const levelName = { primaria:"primaria (6-12 años)", secundaria:"secundaria (12-15 años)", highschool:"high school (15-18 años)" }[level];
  return `Eres MathBot, un tutor de matemáticas amigable, paciente y motivador para estudiantes de ${levelName}.
Tu especialidad actual es: ${topic}.

REGLAS DE COMPORTAMIENTO:
- Usa lenguaje sencillo y ejemplos de la vida real
- Sé positivo y alentador, nunca frustrantes
- Cuando expliques, usa pasos numerados y claros
- Usa emojis con moderación para hacer el texto más amigable
- Si el alumno se equivoca, guíalo sin dar la respuesta directa
- Responde SIEMPRE en español
- Máximo 3 párrafos por respuesta (breve pero completo)
- Puedes usar fórmulas matemáticas en texto plano (ej: a^2 + b^2 = c^2)

NUNCA digas que eres una IA o menciones tu modelo. Eres MathBot.`;
}

function getExerciseGeneratorPrompt(level, topic, difficulty, count = 3) {
  const levelDesc = {
    primaria: "estudiantes de primaria (6-12 años), operaciones básicas, problemas simples con objetos cotidianos",
    secundaria: "estudiantes de secundaria (12-15 años), operaciones algebraicas básicas, geometría y estadística",
    highschool: "estudiantes de high school (15-18 años), cálculo, trigonometría, álgebra avanzada",
  }[level];

  const diffDesc = { facil:"fácil (conceptos básicos)", medio:"medio (aplicación directa)", dificil:"difícil (razonamiento y aplicación)" }[difficulty];

  return `Eres un generador experto de ejercicios de matemáticas para ${levelDesc}.
Tema: ${topic}
Dificultad: ${diffDesc}

Genera exactamente ${count} ejercicios de opción múltiple en español.
Cada ejercicio DEBE tener:
- Una pregunta clara y contextualizada en situaciones reales
- 4 opciones de respuesta (solo una correcta)
- Pista breve (máx 15 palabras)
- Explicación paso a paso (3-5 pasos)
- Fórmula o concepto clave aplicado

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin texto antes ni después):
\`\`\`json
{
  "exercises": [
    {
      "q": "enunciado del ejercicio",
      "opts": ["opción A", "opción B", "opción C", "opción D"],
      "ans": 0,
      "hint": "pista breve",
      "explanation": {
        "steps": ["paso 1", "paso 2", "paso 3"],
        "formula": "fórmula o concepto clave"
      }
    }
  ]
}
\`\`\`
El campo "ans" es el índice (0-3) de la respuesta correcta en el array "opts".`;
}

// ══════════════════════════════════════════════════════════════════════════════
// OLLAMA STATUS CHECK
// ══════════════════════════════════════════════════════════════════════════════
function useOllamaStatus() {
  const [status, setStatus] = useState("checking"); // checking | online | offline
  const [models, setModels] = useState([]);

  useEffect(() => {
    fetch(`${OLLAMA_URL}/api/tags`)
      .then(r => r.json())
      .then(d => {
        setModels(d.models?.map(m => m.name) || []);
        setStatus("online");
      })
      .catch(() => setStatus("offline"));
  }, []);

  return { status, models };
}

// ══════════════════════════════════════════════════════════════════════════════
// AI EXERCISE GENERATOR VIEW
// ══════════════════════════════════════════════════════════════════════════════
function AIExerciseGenerator({ level, topic, color, onStartQuiz, onBack }) {
  const [difficulty, setDifficulty] = useState("medio");
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [exercises, setExercises] = useState(null);
  const [error, setError] = useState(null);

  async function generate() {
    setGenerating(true);
    setStreamText("");
    setExercises(null);
    setError(null);
    try {
      const prompt = getExerciseGeneratorPrompt(level.id, topic.title, difficulty, count);
      let accumulated = "";
      await ollamaGenerate(prompt, (text) => {
        accumulated = text;
        setStreamText(text);
      });
      const parsed = extractJSON(accumulated);
      if (parsed?.exercises?.length) {
        setExercises(parsed.exercises);
      } else {
        setError("No se pudo parsear el JSON. Intenta de nuevo.");
      }
    } catch (e) {
      setError(`Error conectando con Ollama: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  }

  const diffOptions = [
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

      {/* Generating state — streaming */}
      {generating && (
        <div style={{ background:T.white, borderRadius:20, padding:"32px 24px", boxShadow:"0 4px 24px rgba(30,58,95,0.08)", marginBottom:20 }}>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:48, animation:"spin 2s linear infinite", display:"inline-block" }}>🤖</div>
            <h3 style={{ margin:"12px 0 4px", fontSize:18, fontWeight:800, color:T.navy }}>Generando ejercicios...</h3>
            <p style={{ margin:0, color:T.gray500, fontSize:13 }}>El modelo está creando {count} ejercicios de {topic.title}</p>
          </div>
          <div style={{ background:"#0D1117", borderRadius:12, padding:"16px", maxHeight:240, overflow:"auto" }}>
            <pre style={{ margin:0, fontSize:12, color:"#58A6FF", fontFamily:"monospace", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
              {streamText || "Conectando con Ollama..."}
            </pre>
          </div>
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
              <p style={{ margin:0, fontSize:13, color:T.gray600 }}>Dificultad: {diffOptions.find(d=>d.id===difficulty)?.label} · Tema: {topic.title}</p>
            </div>
          </div>

          {/* Preview */}
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
            {exercises.map((ex, i) => (
              <div key={i} style={{ background:T.white, borderRadius:14, padding:"16px 18px", boxShadow:"0 2px 12px rgba(30,58,95,0.06)", display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ width:28, height:28, borderRadius:"50%", background:color, color:T.white, fontSize:13, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
                <div style={{ flex:1 }}>
                  <p style={{ margin:"0 0 8px", fontSize:14, fontWeight:700, color:T.navy, lineHeight:1.4 }}>{ex.q}</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {ex.opts?.map((opt,j) => (
                      <span key={j} style={{ fontSize:12, padding:"3px 10px", borderRadius:20, background:j===ex.ans ? color+"20" : T.gray100, color:j===ex.ans ? color : T.gray500, fontWeight:j===ex.ans ? 700 : 400, border:j===ex.ans ? `1px solid ${color}` : "none" }}>
                        {String.fromCharCode(65+j)}) {opt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => { setExercises(null); setStreamText(""); }} style={ghostBtn}>
              🔄 Regenerar
            </button>
            <button onClick={() => onStartQuiz(exercises)} style={{ ...primaryBtn(color), flex:1 }}>
              ▶ Iniciar quiz con estos ejercicios
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TUTOR CHAT COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function TutorChat({ level, topic, color, currentQuestion, onClose }) {
  const [messages, setMessages] = useState([
    {
      role:"assistant",
      content:`¡Hola! Soy **MathBot** 🤖, tu tutor de matemáticas.\n\nEstoy aquí para ayudarte con **${topic.title}**. ¿Tienes alguna duda sobre el ejercicio actual o quieres que te explique algún concepto?\n\n¡No te preocupes, aprenderemos juntos! 😊`,
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const systemPrompt = getTutorSystemPrompt(level.id, topic.title);

  // Suggested questions
  const suggestions = currentQuestion
    ? [
        "No entiendo la pregunta",
        "¿Me das una pista?",
        "¿Cómo se resuelve paso a paso?",
        "Explícame el concepto",
      ]
    : [
        `¿Qué es ${topic.title}?`,
        "Dame un ejemplo fácil",
        "¿Para qué sirve en la vida real?",
        "Explícame la fórmula",
      ];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, streamingContent]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    // Add user message + context about current question
    let userContent = msg;
    if (currentQuestion) {
      userContent = `[Contexto: El alumno está viendo esta pregunta: "${currentQuestion.q}"]\n\nAlumno: ${msg}`;
    }

    const newMessages = [...messages, { role:"user", content:msg }];
    setMessages(newMessages);
    setLoading(true);
    setStreamingContent("");

    try {
      const apiMessages = [
        { role:"system", content:systemPrompt },
        ...newMessages.map(m => ({ role:m.role, content:m.content })),
      ];
      // replace last user message with context-enriched version
      apiMessages[apiMessages.length-1].content = userContent;

      let final = "";
      await ollamaChat(apiMessages, (text) => {
        final = text;
        setStreamingContent(text);
      });

      setMessages(prev => [...prev, { role:"assistant", content:final }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role:"assistant",
        content:`⚠️ No puedo conectarme con Ollama ahora mismo. Asegúrate de que esté corriendo con \`ollama serve\`.`,
      }]);
    } finally {
      setLoading(false);
      setStreamingContent("");
      inputRef.current?.focus();
    }
  }

  function formatMessage(text) {
    // Basic markdown: bold, code, line breaks
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code style="background:#EEF1F5;padding:2px 6px;border-radius:4px;font-size:12px">$1</code>')
      .replace(/\n/g, '<br/>');
  }

  return (
    <div style={{
      position:"fixed", bottom:20, right:20, width:380, height:560,
      background:T.white, borderRadius:24, boxShadow:"0 20px 60px rgba(30,58,95,0.2)",
      display:"flex", flexDirection:"column", zIndex:1000,
      border:`2px solid ${color}20`, overflow:"hidden",
    }}>
      {/* Header */}
      <div style={{ background:color, padding:"14px 18px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🤖</div>
        <div style={{ flex:1 }}>
          <p style={{ margin:0, fontWeight:800, color:T.white, fontSize:15 }}>MathBot Tutor</p>
          <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.8)" }}>{topic.title} · {level.label}</p>
        </div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:T.white, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflow:"auto", padding:"16px 14px", display:"flex", flexDirection:"column", gap:12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user" ? "flex-end" : "flex-start", gap:8, alignItems:"flex-end" }}>
            {m.role==="assistant" && (
              <div style={{ width:30, height:30, borderRadius:"50%", background:color+"20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🤖</div>
            )}
            <div style={{
              maxWidth:"78%", padding:"10px 14px", borderRadius:16,
              borderBottomLeftRadius:m.role==="assistant" ? 4 : 16,
              borderBottomRightRadius:m.role==="user" ? 4 : 16,
              background:m.role==="user" ? color : T.offWhite,
              color:m.role==="user" ? T.white : T.gray800,
              fontSize:14, lineHeight:1.55,
            }}
              dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }}
            />
          </div>
        ))}

        {/* Streaming */}
        {loading && (
          <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:color+"20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🤖</div>
            <div style={{ maxWidth:"78%", padding:"10px 14px", borderRadius:16, borderBottomLeftRadius:4, background:T.offWhite, fontSize:14, lineHeight:1.55, color:T.gray800 }}>
              {streamingContent
                ? <span dangerouslySetInnerHTML={{ __html: formatMessage(streamingContent) }}/>
                : <span style={{ display:"flex", gap:4, alignItems:"center" }}>
                    {[0,1,2].map(i => (
                      <span key={i} style={{ width:6, height:6, borderRadius:"50%", background:color, animation:`bounce 1s ${i*0.15}s infinite`, display:"inline-block" }}/>
                    ))}
                  </span>
              }
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && !loading && (
        <div style={{ padding:"0 14px 10px", display:"flex", flexWrap:"wrap", gap:6 }}>
          {suggestions.map((s,i) => (
            <button key={i} onClick={() => sendMessage(s)} style={{
              fontSize:12, padding:"5px 12px", borderRadius:20, border:`1px solid ${color}40`,
              background:color+"10", color:color, cursor:"pointer", fontFamily:"inherit", fontWeight:600,
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding:"12px 14px", borderTop:`1px solid ${T.gray100}`, display:"flex", gap:8, flexShrink:0 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendMessage()}
          placeholder="Escribe tu pregunta..."
          disabled={loading}
          style={{ flex:1, border:`1.5px solid ${T.gray100}`, borderRadius:12, padding:"10px 14px", fontSize:14, fontFamily:"inherit", outline:"none", background:loading ? T.gray100 : T.white, color:T.gray800 }}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
          width:40, height:40, borderRadius:12, background:input.trim() && !loading ? color : T.gray300,
          border:"none", cursor:input.trim() && !loading ? "pointer" : "default",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, transition:"background 0.2s",
        }}>➤</button>
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPLANATION PANEL
// ══════════════════════════════════════════════════════════════════════════════
function ExplanationPanel({ question, color, isCorrect }) {
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

// ══════════════════════════════════════════════════════════════════════════════
// QUIZ VIEW
// ══════════════════════════════════════════════════════════════════════════════
function QuizView({ topic, level, color, questions, onBack, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [mood, setMood] = useState("idle");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [done, setDone] = useState(false);

  const q = questions[idx];

  function pick(i) {
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

  const bots = { idle:"😊", correct:"🥳", wrong:"😅", celebrate:"🎉" };

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
            {bots[mood]}
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
          let bg=T.white, border=T.gray300, tc=T.gray800;
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
          level={LEVELS.find(l => l.id === level.id) || LEVELS[0]}
          topic={topic}
          color={color}
          currentQuestion={selected === null ? q : null}
          onClose={() => setShowTutor(false)}
        />
      )}

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TOPIC DETAIL — choose mode
// ══════════════════════════════════════════════════════════════════════════════
function TopicDetail({ topic, level, color, bg, completed, onStartPreset, onStartAI, onBack }) {
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

// ══════════════════════════════════════════════════════════════════════════════
// STATIC QUESTIONS BANK (compact)
// ══════════════════════════════════════════════════════════════════════════════
const STATIC_Q = {
  suma:[
    {q:"¿Cuánto es 47 + 38?",opts:["75","85","95","65"],ans:1,hint:"Suma unidades: 7+8=15, lleva 1",explanation:{steps:["Unidades: 7+8=15 → escribe 5, lleva 1","Decenas: 4+3+1=8","Resultado: 85 ✓"],formula:"Suma columna por columna de derecha a izquierda"}},
    {q:"María tenía 63 manzanas y regaló 29. ¿Cuántas le quedan?",opts:["34","44","24","54"],ans:0,hint:"63 − 29: pide prestado en las unidades",explanation:{steps:["Unidades: 3−9 no se puede → pide prestado","13−9=4","Decenas: 6−1−2=3","Resultado: 34 ✓"],formula:"Cuando dígito arriba < abajo, pide 1 decena prestada"}},
    {q:"¿Cuánto es 125 + 347?",opts:["462","472","482","452"],ans:1,hint:"Suma columna por columna",explanation:{steps:["Unidades: 5+7=12→escribe 2, lleva 1","Decenas: 2+4+1=7","Centenas: 1+3=4","Resultado: 472 ✓"],formula:"Suma con acarreo de derecha a izquierda"}},
    {q:"¿Cuánto es 200 − 87?",opts:["113","123","103","133"],ans:0,hint:"87 + ? = 200 (complemento)",explanation:{steps:["87+13=100","100+100=200","13+100=113 ✓"],formula:"Complemento: 200−87=(200−100)+(100−87)"}},
    {q:"Un libro cuesta $45 y un cuaderno $23. ¿Total?",opts:["$68","$78","$58","$88"],ans:0,hint:"Suma los dos precios",explanation:{steps:["45+23","Unidades: 5+3=8","Decenas: 4+2=6","Total: $68 ✓"],formula:"Precio total = precio A + precio B"}},
  ],
  multi:[
    {q:"¿Cuánto es 7 × 8?",opts:["54","56","58","52"],ans:1,hint:"7×7=49, más 7 = ?",explanation:{steps:["7×8: puedes pensar 7×7=49","49+7=56 ✓"],formula:"a×b = sumar 'a' exactamente 'b' veces"}},
    {q:"¿Cuánto es 9 × 9?",opts:["72","81","90","63"],ans:1,hint:"9×10=90, menos 9",explanation:{steps:["9×10=90","90−9=81 ✓","Verificación: 8+1=9 (truco tabla del 9)"],formula:"n×9 = n×10 − n"}},
    {q:"¿Cuánto es 15 × 4?",opts:["50","55","60","65"],ans:2,hint:"Descompón: 15=10+5",explanation:{steps:["(10+5)×4","10×4=40","5×4=20","40+20=60 ✓"],formula:"Propiedad distributiva: (a+b)×c = a×c + b×c"}},
    {q:"¿Cuánto es 12 × 5?",opts:["55","65","60","50"],ans:2,hint:"×5 = ÷2 y ×10",explanation:{steps:["12÷2=6","6×10=60 ✓"],formula:"n×5 = (n÷2)×10"}},
    {q:"3 amigos compran 4 libretas cada uno. ¿Total?",opts:["10","11","12","13"],ans:2,hint:"3 × 4",explanation:{steps:["3 grupos × 4 unidades","3×4=12 ✓"],formula:"Grupos × elementos = total"}},
  ],
  fracciones:[
    {q:"¿Qué fracción son 3 porciones de una pizza en 8?",opts:["3/5","3/8","5/8","8/3"],ans:1,hint:"Partes tomadas / partes totales",explanation:{steps:["Pizza dividida en 8","Tomamos 3","Fracción = 3/8 ✓"],formula:"Fracción = numerador/denominador"}},
    {q:"¿Cuánto es 1/2 + 1/4?",opts:["2/6","3/4","2/4","1/3"],ans:1,hint:"Convierte 1/2 = 2/4",explanation:{steps:["1/2=2/4","2/4+1/4=3/4 ✓"],formula:"Para sumar: busca denominador común"}},
    {q:"¿Cuánto es 3/4 de 20?",opts:["12","15","10","18"],ans:1,hint:"20÷4×3",explanation:{steps:["20÷4=5 (una parte)","5×3=15 (tres partes) ✓"],formula:"Fracción de número = (n÷denominador)×numerador"}},
    {q:"Simplifica 6/9",opts:["3/4","2/3","1/2","4/6"],ans:1,hint:"MCD(6,9)=3",explanation:{steps:["MCD(6,9)=3","6÷3=2, 9÷3=3","2/3 ✓"],formula:"Simplificar = dividir entre MCD"}},
    {q:"¿Cuál es mayor: 2/3 o 3/4?",opts:["2/3","3/4","Iguales","No se puede"],ans:1,hint:"Convierte a /12",explanation:{steps:["2/3=8/12","3/4=9/12","9/12>8/12 → 3/4 ✓"],formula:"Para comparar: denominador común"}},
  ],
  algebra:[
    {q:"Si 3x + 7 = 22, ¿cuánto vale x?",opts:["3","5","4","6"],ans:1,hint:"Resta 7, luego divide entre 3",explanation:{steps:["3x=22−7=15","x=15÷3=5 ✓","Verificación: 3(5)+7=22"],formula:"Despejar: deshacer operaciones en orden inverso"}},
    {q:"Resuelve: 2x − 5 = x + 3",opts:["x=6","x=7","x=8","x=9"],ans:2,hint:"Lleva x al mismo lado",explanation:{steps:["2x−x=3+5","x=8 ✓","Verificación: 16−5=11=8+3"],formula:"Transponer: al cruzar el igual, cambia signo"}},
    {q:"Factoriza: x² − 9",opts:["(x−3)(x+3)","(x−9)(x+1)","(x−3)²","(x+9)(x−1)"],ans:0,hint:"Diferencia de cuadrados",explanation:{steps:["x²−9=x²−3²","a²−b²=(a−b)(a+b)","(x−3)(x+3) ✓"],formula:"Diferencia de cuadrados: a²−b²=(a−b)(a+b)"}},
    {q:"Simplifica: 3x + 2y − x + 4y",opts:["2x+6y","4x+6y","2x+2y","4x+2y"],ans:0,hint:"Agrupa términos semejantes",explanation:{steps:["x: 3x−x=2x","y: 2y+4y=6y","2x+6y ✓"],formula:"Solo se suman términos con la misma variable y exponente"}},
    {q:"¿Cuánto es 2(x+3) cuando x=4?",opts:["11","14","10","8"],ans:1,hint:"Paréntesis primero",explanation:{steps:["2(4+3)","2×7=14 ✓"],formula:"PEMDAS: Paréntesis antes de multiplicación"}},
  ],
  geometria:[
    {q:"Área de triángulo: base=8, altura=5",opts:["20","40","13","16"],ans:0,hint:"A = (base×altura)/2",explanation:{steps:["A=(8×5)/2","=40/2=20 cm² ✓"],formula:"Área triángulo = (base × altura) / 2"}},
    {q:"Catetos 3 y 4. ¿Hipotenusa?",opts:["6","7","5","8"],ans:2,hint:"a²+b²=c²",explanation:{steps:["c²=3²+4²=9+16=25","c=√25=5 ✓","Triángulo 3-4-5"],formula:"Teorema de Pitágoras: c² = a² + b²"}},
    {q:"Área del círculo radio=7 (π≈3.14)",opts:["43.96","153.86","21.98","87.92"],ans:1,hint:"A = π × r²",explanation:{steps:["A=3.14×7²","=3.14×49","=153.86 cm² ✓"],formula:"Área círculo = π × r²"}},
    {q:"¿Cuánto suman los ángulos de un triángulo?",opts:["90°","270°","360°","180°"],ans:3,hint:"Propiedad fundamental",explanation:{steps:["Todo triángulo: suma ángulos interiores","60+60+60=180° (equilátero)","Siempre 180° ✓"],formula:"α + β + γ = 180°"}},
    {q:"Volumen cubo arista=4",opts:["16","48","64","32"],ans:2,hint:"V = arista³",explanation:{steps:["V=4³","=4×4×4=64 cm³ ✓"],formula:"Volumen cubo = a³"}},
  ],
  estadistica:[
    {q:"Notas: 7,8,6,9,5. ¿Media?",opts:["6.5","7","7.5","8"],ans:1,hint:"Suma todos y divide entre 5",explanation:{steps:["7+8+6+9+5=35","35÷5=7 ✓"],formula:"Media = Σx / n"}},
    {q:"Conjunto {3,7,7,9,2,7}. ¿Moda?",opts:["9","3","7","2"],ans:2,hint:"El que más se repite",explanation:{steps:["7 aparece 3 veces","Es la moda ✓"],formula:"Moda = valor con mayor frecuencia"}},
    {q:"Ordena 4,1,7,3,9. ¿Mediana?",opts:["3","4","7","5"],ans:1,hint:"Ordena y encuentra el central",explanation:{steps:["1,3,4,7,9","5 valores, el 3° es 4","Mediana=4 ✓"],formula:"Mediana: valor central del conjunto ordenado"}},
    {q:"Rango de: 15,22,8,30,12",opts:["14","22","15","30"],ans:1,hint:"Máximo − Mínimo",explanation:{steps:["Máx=30, Mín=8","30−8=22 ✓"],formula:"Rango = máximo − mínimo"}},
    {q:"5 libros: $12,$15,$10,$18,$20. Precio promedio",opts:["$14","$15","$16","$17"],ans:1,hint:"Suma y divide entre 5",explanation:{steps:["12+15+10+18+20=75","75÷5=15 ✓"],formula:"Promedio = suma / cantidad"}},
  ],
  funciones:[
    {q:"f(x)=3x²−2. ¿f(2)?",opts:["8","10","14","6"],ans:1,hint:"Sustituye x=2",explanation:{steps:["f(2)=3(2)²−2","=3×4−2=12−2=10 ✓"],formula:"Evaluar: sustituir x por el valor dado"}},
    {q:"Dominio de f(x)=√x",opts:["Todos los reales","x>0","x≥0","x≠0"],ans:2,hint:"√x no existe para x negativo",explanation:{steps:["√0=0 ✓ (definida)","√(-1): no real ✗","Dominio: x≥0 ✓"],formula:"Dominio = valores de x donde f(x) está definida"}},
    {q:"¿Dónde corta y=2x+5 al eje Y?",opts:["(2,0)","(0,5)","(5,0)","(0,2)"],ans:1,hint:"x=0 en el eje Y",explanation:{steps:["x=0: y=2(0)+5=5","Punto: (0,5) ✓"],formula:"En y=mx+b, el intercepto en Y es 'b'"}},
    {q:"Pendiente por (1,3) y (3,7)",opts:["1","2","3","4"],ans:1,hint:"m=(y₂−y₁)/(x₂−x₁)",explanation:{steps:["m=(7−3)/(3−1)","=4/2=2 ✓"],formula:"Pendiente = Δy/Δx"}},
    {q:"g(x)=x², h(x)=x+1. (g∘h)(2)=?",opts:["5","9","7","4"],ans:1,hint:"Primero h(2), luego g de ese resultado",explanation:{steps:["h(2)=3","g(3)=9 ✓"],formula:"(f∘g)(x) = f(g(x))"}},
  ],
  trigono:[
    {q:"sen(30°) =",opts:["√3/2","1/2","√2/2","1"],ans:1,hint:"Ángulos especiales: memoriza 30°,45°,60°",explanation:{steps:["sen(30°)=1/2 (valor exacto)","Triángulo 30-60-90: hipotenusa=2, opuesto=1","1/2 ✓"],formula:"Triángulo 30-60-90: lados 1:√3:2"}},
    {q:"cos(60°) =",opts:["1/2","√3/2","√2/2","0"],ans:0,hint:"cos(60°)=sen(30°)",explanation:{steps:["cos(60°)=1/2 ✓","Identidad: cos(θ)=sen(90°−θ)"],formula:"sen(θ)=cos(90°−θ)"}},
    {q:"sen(θ)=0.6, cos(θ)=0.8. tan(θ)=?",opts:["0.8","0.75","1.33","0.48"],ans:1,hint:"tan=sen/cos",explanation:{steps:["tan=0.6/0.8=0.75 ✓","Triángulo 3-4-5: tan=3/4"],formula:"tan(θ) = sen(θ)/cos(θ)"}},
    {q:"sen²(θ) + cos²(θ) =",opts:["0","2","1","tan²"],ans:2,hint:"Identidad pitagórica fundamental",explanation:{steps:["Viene del Teorema de Pitágoras","a²/c²+b²/c²=1","sen²+cos²=1 ✓"],formula:"sen²(θ) + cos²(θ) = 1 (siempre)"}},
    {q:"Período de y=sen(x)",opts:["π","2π","π/2","4π"],ans:1,hint:"Un ciclo completo de la función seno",explanation:{steps:["Seno: sube, baja, vuelve en 2π","Período=2π≈6.28 ✓"],formula:"y=A·sen(Bx+C) → período = 2π/|B|"}},
  ],
  calculo:[
    {q:"lím(x→1) (x²−1)/(x−1)",opts:["1","0","2","∞"],ans:2,hint:"Factoriza el numerador",explanation:{steps:["0/0 → factorizar","x²−1=(x−1)(x+1)","Cancela (x−1): x+1","lím→1: 1+1=2 ✓"],formula:"Si 0/0: factoriza y cancela el factor común"}},
    {q:"Derivada de f(x)=x³",opts:["x²","3x","3x²","x³/3"],ans:2,hint:"Regla de la potencia",explanation:{steps:["d/dx(xⁿ)=n·xⁿ⁻¹","n=3: 3x² ✓"],formula:"d/dx(xⁿ) = n·xⁿ⁻¹"}},
    {q:"lím(x→∞) 1/x",opts:["1","∞","0","−1"],ans:2,hint:"¿Qué pasa a 1/x cuando x crece?",explanation:{steps:["x=100: 1/100=0.01","x=∞: 1/∞→0 ✓"],formula:"lím(x→∞) k/xⁿ = 0 (para n>0)"}},
    {q:"Derivada de f(x)=5x²+3x−2",opts:["5x+3","10x+3","10x−2","5x+3x"],ans:1,hint:"Deriva término por término",explanation:{steps:["5x²→10x","3x→3","−2→0","f'(x)=10x+3 ✓"],formula:"d/dx(axⁿ)=a·n·xⁿ⁻¹ | d/dx(c)=0"}},
    {q:"Si f'(x)>0, la función es:",opts:["Decreciente","Constante","Creciente","Negativa"],ans:2,hint:"Pendiente positiva = ?",explanation:{steps:["f'>0 → pendiente positiva","Función va hacia arriba","f' creciente ✓"],formula:"f'>0 → creciente | f'<0 → decreciente | f'=0 → crítico"}},
  ],
  probabilidad:[
    {q:"P(sacar 6 en un dado)",opts:["1/3","1/4","1/6","1/2"],ans:2,hint:"1 favorable / 6 posibles",explanation:{steps:["Dados: 6 caras","Favorables: {6}=1","P=1/6 ✓"],formula:"P(evento) = casos favorables / casos totales"}},
    {q:"Bolsa: 3 rojas, 7 azules. P(roja)",opts:["3/10","7/10","3/7","7/3"],ans:0,hint:"Total = 3+7",explanation:{steps:["Total=10","P(roja)=3/10 ✓","P(azul)=7/10→suma=1"],formula:"P(A)+P(Aᶜ)=1"}},
    {q:"Formas de ordenar 3 libros",opts:["3","6","9","12"],ans:1,hint:"3! = 3×2×1",explanation:{steps:["1°: 3 opciones","2°: 2 opciones","3°: 1 opción","3!=6 ✓"],formula:"Permutaciones de n objetos = n!"}},
    {q:"P(A)=0.4, P(B)=0.3, independientes. P(A∩B)",opts:["0.7","0.12","0.1","0.5"],ans:1,hint:"Independientes: multiplica",explanation:{steps:["P(A∩B)=P(A)×P(B)","=0.4×0.3=0.12 ✓"],formula:"Eventos independientes: P(A∩B)=P(A)·P(B)"}},
    {q:"Combinaciones C(5,2)",opts:["10","20","5","15"],ans:0,hint:"5!/(2!×3!)",explanation:{steps:["C(5,2)=5!/(2!×3!)","=120/(2×6)=10 ✓"],formula:"C(n,r) = n! / (r!(n−r)!)"}},
  ],
};

function getStaticQuestions(levelId, topicId) {
  return STATIC_Q[topicId] || STATIC_Q.suma;
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED BUTTON STYLES
// ══════════════════════════════════════════════════════════════════════════════
const ghostBtn = { background:T.white, color:T.gray800, border:`1.5px solid ${T.gray300}`, borderRadius:10, padding:"8px 16px", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" };
function primaryBtn(color) { return { background:color, color:T.white, border:"none", borderRadius:12, padding:"12px 24px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }; }

// ══════════════════════════════════════════════════════════════════════════════
// PROGRESS RING
// ══════════════════════════════════════════════════════════════════════════════
function ProgressRing({ percent, color, size=56 }) {
  const r=(size-8)/2, circ=2*Math.PI*r, offset=circ-(percent/100)*circ;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.gray100} strokeWidth={6}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeDasharray={circ} strokeDashoffset={offset} style={{ transition:"stroke-dashoffset 0.6s ease" }}/>
    </svg>
  );
}

function XPBar({ xp, maxXp=1500 }) {
  const pct = Math.min((xp/maxXp)*100, 100);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, maxWidth:260 }}>
      <span style={{ fontSize:13, color:T.yellow, fontWeight:800, whiteSpace:"nowrap" }}>⭐ {xp} XP</span>
      <div style={{ flex:1, height:10, background:"rgba(255,255,255,0.15)", borderRadius:5, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${T.yellow},${T.orange})`, borderRadius:5, transition:"width 0.8s ease" }}/>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// OLLAMA STATUS BADGE
// ══════════════════════════════════════════════════════════════════════════════
function OllamaBadge({ status, models }) {
  const cfg = {
    checking: { color:"#94A3B8", label:"Verificando Ollama..." },
    online:   { color:T.green,   label:`Ollama online · ${OLLAMA_MODEL}` },
    offline:  { color:T.coral,   label:"Ollama offline" },
  }[status];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:20, background:"rgba(255,255,255,0.1)", fontSize:12, color:T.white }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:cfg.color, display:"inline-block", boxShadow:status==="online"?`0 0 6px ${cfg.color}`:undefined }}/>
      {cfg.label}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen]           = useState("home");      // home | level | topicDetail | aiGen | quiz
  const [activeLevel, setActiveLevel] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [xp, setXp]                   = useState(120);
  const [completed, setCompleted]     = useState(new Set());
  const [streak]                      = useState(3);
  const { status: ollamaStatus, models } = useOllamaStatus();

  const level   = LEVELS.find(l => l.id === activeLevel);
  const topics  = activeLevel ? TOPICS[activeLevel] : [];

  function goToLevel(levelId)  { setActiveLevel(levelId); setScreen("level"); }
  function goToTopic(topic)    { setActiveTopic(topic);   setScreen("topicDetail"); }
  function goToAIGen()         { setScreen("aiGen"); }
  function goToPreset()        { setActiveQuestions(getStaticQuestions(activeLevel, activeTopic.id)); setScreen("quiz"); }
  function goToAIQuiz(qs)      { setActiveQuestions(qs); setScreen("quiz"); }

  function handleComplete(earned) {
    setXp(x => x+earned);
    setCompleted(s => new Set([...s, `${activeLevel}:${activeTopic.id}`]));
    setScreen("topicDetail");
  }

  const headerStyle = {
    background:T.navy, color:T.white, padding:"0 20px",
    display:"flex", alignItems:"center", justifyContent:"space-between",
    height:60, position:"sticky", top:0, zIndex:100,
    boxShadow:"0 2px 16px rgba(0,0,0,0.15)", gap:16, flexShrink:0,
  };

  const appStyle = { fontFamily:"'Nunito','Segoe UI',sans-serif", minHeight:"100vh", background:T.offWhite };

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  if (screen === "quiz") return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <span style={{ fontWeight:900, fontSize:18, flexShrink:0 }}>🧮 MathKids</span>
        <XPBar xp={xp}/>
        <OllamaBadge status={ollamaStatus} models={models}/>
      </header>
      <QuizView
        topic={activeTopic} level={level} color={level.color}
        questions={activeQuestions}
        onBack={() => setScreen("topicDetail")}
        onComplete={handleComplete}
      />
    </div>
  );

  // ── AI GENERATOR ───────────────────────────────────────────────────────────
  if (screen === "aiGen") return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <span style={{ fontWeight:900, fontSize:18, flexShrink:0 }}>🧮 MathKids</span>
        <XPBar xp={xp}/>
        <OllamaBadge status={ollamaStatus} models={models}/>
      </header>
      <AIExerciseGenerator
        level={level} topic={activeTopic} color={level.color}
        onStartQuiz={goToAIQuiz}
        onBack={() => setScreen("topicDetail")}
      />
    </div>
  );

  // ── TOPIC DETAIL ───────────────────────────────────────────────────────────
  if (screen === "topicDetail") return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => setScreen("level")} style={{ background:"none", border:"none", color:T.white, cursor:"pointer", fontSize:22, padding:0 }}>←</button>
          <span style={{ fontWeight:900, fontSize:18 }}>🧮 MathKids</span>
        </div>
        <XPBar xp={xp}/>
        <OllamaBadge status={ollamaStatus} models={models}/>
      </header>
      <TopicDetail
        topic={activeTopic} level={level} color={level.color} bg={level.bg}
        completed={completed.has(`${activeLevel}:${activeTopic.id}`)}
        onStartPreset={goToPreset}
        onStartAI={goToAIGen}
        onBack={() => setScreen("level")}
      />
    </div>
  );

  // ── LEVEL ──────────────────────────────────────────────────────────────────
  if (screen === "level") {
    const lvlDone = topics.filter(t => completed.has(`${activeLevel}:${t.id}`)).length;
    return (
      <div style={appStyle}>
        <header style={headerStyle}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={() => setScreen("home")} style={{ background:"none", border:"none", color:T.white, cursor:"pointer", fontSize:22, padding:0 }}>←</button>
            <span style={{ fontWeight:900, fontSize:18 }}>🧮 MathKids</span>
          </div>
          <XPBar xp={xp}/>
          <OllamaBadge status={ollamaStatus} models={models}/>
        </header>

        <div style={{ background:level.color, color:T.white, padding:"40px 24px 48px", textAlign:"center" }}>
          <div style={{ fontSize:54, marginBottom:8 }}>{level.emoji}</div>
          <h1 style={{ margin:"0 0 4px", fontSize:28, fontWeight:900 }}>{level.label}</h1>
          <p style={{ margin:"0 0 20px", opacity:0.85, fontSize:15 }}>{level.grades}</p>
          <div style={{ display:"inline-flex", gap:24, background:"rgba(255,255,255,0.15)", borderRadius:16, padding:"12px 28px" }}>
            <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:800 }}>{lvlDone}/{topics.length}</div><div style={{ fontSize:11, opacity:0.8 }}>Completados</div></div>
            <div style={{ width:1, background:"rgba(255,255,255,0.3)" }}/>
            <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:800 }}>{topics.reduce((s,t)=>s+t.xp,0)}</div><div style={{ fontSize:11, opacity:0.8 }}>XP disponibles</div></div>
          </div>
        </div>

        <div style={{ background:T.white, padding:"16px 24px", borderBottom:`1px solid ${T.gray100}` }}>
          <div style={{ height:8, background:T.gray100, borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${(lvlDone/topics.length)*100}%`, background:level.color, borderRadius:4, transition:"width 0.6s" }}/>
          </div>
          <p style={{ margin:"6px 0 0", fontSize:12, color:T.gray500 }}>Progreso: {lvlDone} de {topics.length} temas</p>
        </div>

        <div style={{ maxWidth:960, margin:"0 auto", padding:"32px 24px" }}>
          <h2 style={{ margin:"0 0 20px", fontSize:20, fontWeight:800, color:T.navy }}>Temas disponibles</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:20 }}>
            {topics.map(topic => {
              const done = completed.has(`${activeLevel}:${topic.id}`);
              return (
                <div key={topic.id} onClick={() => goToTopic(topic)}
                  style={{ background:T.white, borderRadius:20, padding:"22px", cursor:"pointer", border:`2px solid ${done?level.color:T.gray100}`, boxShadow:"0 2px 16px rgba(30,58,95,0.07)", transition:"all 0.2s", position:"relative" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(30,58,95,0.13)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 16px rgba(30,58,95,0.07)";}}>
                  {done && <div style={{ position:"absolute", top:12, right:12, background:level.color, color:T.white, borderRadius:20, fontSize:11, fontWeight:700, padding:"3px 10px" }}>✓</div>}
                  <div style={{ fontSize:38, marginBottom:10 }}>{topic.icon}</div>
                  <h3 style={{ margin:"0 0 5px", fontSize:16, fontWeight:800, color:T.navy }}>{topic.title}</h3>
                  <p style={{ margin:"0 0 14px", fontSize:13, color:T.gray500, lineHeight:1.5 }}>{topic.desc}</p>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:12, color:level.color, fontWeight:700, background:level.bg, padding:"4px 10px", borderRadius:20 }}>⭐ {topic.xp} XP</span>
                    <span style={{ fontSize:11, color:T.gray300, background:T.gray100, padding:"3px 9px", borderRadius:20, fontWeight:600 }}>✨ IA disponible</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── HOME ───────────────────────────────────────────────────────────────────
  const totalTopics = Object.values(TOPICS).flat().length;
  return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:26 }}>🧮</span>
          <span style={{ fontWeight:900, fontSize:20, letterSpacing:"-0.5px" }}>MathKids</span>
        </div>
        <XPBar xp={xp}/>
        <OllamaBadge status={ollamaStatus} models={models}/>
      </header>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${T.navy} 0%,${T.navyLight} 60%,#1a6fa8 100%)`, color:T.white, padding:"56px 24px 64px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        {[...Array(6)].map((_,i)=>(
          <div key={i} style={{ position:"absolute", width:[120,80,60,100,70,90][i], height:[120,80,60,100,70,90][i], borderRadius:"50%", background:"rgba(255,255,255,0.04)", top:["10%","60%","30%","80%","15%","70%"][i], left:["5%","15%","80%","75%","55%","45%"][i] }}/>
        ))}
        <div style={{ position:"relative" }}>
          <div style={{ fontSize:70, marginBottom:14 }}>🧮</div>
          <h1 style={{ margin:"0 0 12px", fontSize:38, fontWeight:900, lineHeight:1.1 }}>
            Aprende Matemáticas<br/><span style={{ color:T.yellow }}>con IA como tu tutor</span>
          </h1>
          <p style={{ margin:"0 0 24px", fontSize:16, opacity:0.82, maxWidth:520, marginLeft:"auto", marginRight:"auto", lineHeight:1.6 }}>
            Ejercicios generados por IA, explicaciones paso a paso y un tutor inteligente disponible en todo momento.
          </p>

          {/* Ollama banner */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.12)", borderRadius:12, padding:"10px 20px", marginBottom:28, border:"1px solid rgba(255,255,255,0.2)" }}>
            <span style={{ fontSize:22 }}>🤖</span>
            <div style={{ textAlign:"left" }}>
              <p style={{ margin:0, fontWeight:800, fontSize:14 }}>Potenciado por Ollama</p>
              <p style={{ margin:0, fontSize:12, opacity:0.8 }}>Modelo: {OLLAMA_MODEL} · Funciona 100% local</p>
            </div>
            <span style={{ width:8, height:8, borderRadius:"50%", background:ollamaStatus==="online"?T.green:T.coral, display:"inline-block", boxShadow:ollamaStatus==="online"?`0 0 8px ${T.green}`:undefined }}/>
          </div>

          <div style={{ display:"flex", justifyContent:"center" }}>
            <div style={{ display:"inline-flex", background:"rgba(255,255,255,0.1)", backdropFilter:"blur(10px)", borderRadius:16, overflow:"hidden" }}>
              {[{v:`${completed.size}/${totalTopics}`,l:"Temas"},{v:`${xp} XP`,l:"Puntos"},{v:`${streak} 🔥`,l:"Días"}].map((s,i)=>(
                <div key={i} style={{ padding:"14px 22px", borderRight:i<2?"1px solid rgba(255,255,255,0.15)":"none", textAlign:"center" }}>
                  <div style={{ fontSize:20, fontWeight:800, color:T.yellow }}>{s.v}</div>
                  <div style={{ fontSize:11, opacity:0.75 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Offline warning */}
      {ollamaStatus === "offline" && (
        <div style={{ background:"#FEF3C7", borderBottom:"2px solid #F59E0B", padding:"14px 24px", display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:24 }}>⚠️</span>
          <div>
            <p style={{ margin:"0 0 2px", fontWeight:700, color:"#92400E", fontSize:14 }}>Ollama no detectado — los ejercicios de IA y el tutor no estarán disponibles</p>
            <p style={{ margin:0, fontSize:12, color:"#78350F" }}>
              Ejecuta: <code style={{ background:"#FDE68A", padding:"1px 6px", borderRadius:4 }}>ollama serve</code> y luego <code style={{ background:"#FDE68A", padding:"1px 6px", borderRadius:4 }}>ollama pull {OLLAMA_MODEL}</code>
            </p>
          </div>
        </div>
      )}

      {/* Level cards */}
      <div style={{ maxWidth:960, margin:"0 auto", padding:"48px 24px" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <h2 style={{ margin:"0 0 8px", fontSize:26, fontWeight:900, color:T.navy }}>Elige tu nivel</h2>
          <p style={{ margin:0, color:T.gray500 }}>Todos los temas incluyen ejercicios de IA personalizados y tutor inteligente</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:24 }}>
          {LEVELS.map(lvl => {
            const lvlTopics=TOPICS[lvl.id];
            const lvlDone=lvlTopics.filter(t=>completed.has(`${lvl.id}:${t.id}`)).length;
            const pct=Math.round((lvlDone/lvlTopics.length)*100);
            return (
              <div key={lvl.id} onClick={() => goToLevel(lvl.id)}
                style={{ background:T.white, borderRadius:24, overflow:"hidden", cursor:"pointer", boxShadow:"0 4px 24px rgba(30,58,95,0.08)", border:"2px solid transparent", transition:"all 0.25s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.border=`2px solid ${lvl.color}`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.border="2px solid transparent";}}>
                <div style={{ background:lvl.color, padding:"28px 24px", color:T.white, position:"relative" }}>
                  <div style={{ position:"absolute", right:16, top:16 }}>
                    <ProgressRing percent={pct} color="rgba(255,255,255,0.9)"/>
                    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800 }}>{pct}%</div>
                  </div>
                  <div style={{ fontSize:46, marginBottom:8 }}>{lvl.emoji}</div>
                  <h3 style={{ margin:"0 0 4px", fontSize:22, fontWeight:900 }}>{lvl.label}</h3>
                  <p style={{ margin:0, opacity:0.85, fontSize:14 }}>{lvl.grades}</p>
                </div>
                <div style={{ padding:"18px 22px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <span style={{ fontSize:13, color:T.gray500 }}>{lvlDone} / {lvlTopics.length} temas</span>
                    <span style={{ fontSize:13, fontWeight:700, color:lvl.color }}>{lvlTopics.reduce((s,t)=>s+t.xp,0)} XP</span>
                  </div>
                  <div style={{ height:6, background:T.gray100, borderRadius:3, overflow:"hidden", marginBottom:14 }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:lvl.color, borderRadius:3, transition:"width 0.6s" }}/>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {lvlTopics.map(t=>(
                      <span key={t.id} style={{ fontSize:11, padding:"3px 8px", borderRadius:20, background:completed.has(`${lvl.id}:${t.id}`)?lvl.bg:T.gray100, color:completed.has(`${lvl.id}:${t.id}`)?lvl.dark:T.gray500, fontWeight:600 }}>
                        {t.icon} {t.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features */}
      <div style={{ background:T.navy, color:T.white, padding:"52px 24px" }}>
        <div style={{ maxWidth:860, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ margin:"0 0 8px", fontSize:24, fontWeight:900 }}>Tecnología al servicio del aprendizaje</h2>
          <p style={{ margin:"0 0 36px", opacity:0.7 }}>100% local, privado y sin conexión a internet requerida</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:20 }}>
            {[
              {icon:"🤖",t:"IA Generativa",d:"Ollama crea ejercicios únicos y personalizados en cada sesión"},
              {icon:"🧑‍🏫",t:"Tutor Inteligente",d:"Resuelve tus dudas en tiempo real con explicaciones adaptadas"},
              {icon:"📡",t:"100% Local",d:"Sin datos en la nube. Tu aprendizaje es privado y siempre disponible"},
              {icon:"🎯",t:"Dificultad Adaptada",d:"Elige entre fácil, medio y difícil según tu nivel actual"},
            ].map((s,i)=>(
              <div key={i} style={{ background:"rgba(255,255,255,0.06)", borderRadius:16, padding:"22px 18px" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>{s.icon}</div>
                <h4 style={{ margin:"0 0 6px", fontSize:15, fontWeight:800, color:T.yellow }}>{s.t}</h4>
                <p style={{ margin:0, fontSize:12, opacity:0.75, lineHeight:1.5 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:"#15304F", color:"rgba(255,255,255,0.45)", padding:"18px 24px", textAlign:"center", fontSize:12 }}>
        🧮 MathKids · Potenciado por Ollama ({OLLAMA_MODEL}) · Educación con IA local
      </div>
    </div>
  );
}
