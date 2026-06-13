import { useState, useEffect, useRef } from "react";

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  navy: "#1E3A5F",
  navyLight: "#2A5080",
  sky: "#4A90D9",
  yellow: "#FFD23F",
  yellowDark: "#E6B800",
  green: "#2ECC71",
  greenDark: "#27AE60",
  coral: "#FF6B6B",
  coralDark: "#E05555",
  purple: "#9B59B6",
  purpleDark: "#8E44AD",
  orange: "#F39C12",
  white: "#FFFFFF",
  offWhite: "#F7F9FC",
  gray100: "#EEF1F5",
  gray300: "#BFC8D6",
  gray500: "#7A8A9E",
  gray800: "#2D3748",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const LEVELS = [
  { id: "primaria", label: "Primaria", emoji: "🌱", grades: "1° – 6° Grado", color: T.green, dark: T.greenDark, bg: "#E8F8EF" },
  { id: "secundaria", label: "Secundaria", emoji: "🚀", grades: "7° – 9° Grado", color: T.sky, dark: "#357ABD", bg: "#E8F4FD" },
  { id: "highschool", label: "High School", emoji: "🎓", grades: "10° – 12° Grado", color: T.purple, dark: T.purpleDark, bg: "#F3EBF9" },
];

const TOPICS = {
  primaria: [
    { id: "suma", title: "Suma y Resta", icon: "➕", desc: "Aprende a sumar y restar con objetos y números", xp: 50, questions: generateArithmetic("suma") },
    { id: "multi", title: "Multiplicación", icon: "✖️", desc: "Tablas de multiplicar de forma divertida", xp: 75, questions: generateArithmetic("multi") },
    { id: "fracciones", title: "Fracciones", icon: "🍕", desc: "Divide pizzas y pasteles en partes iguales", xp: 100, questions: generateFractions() },
    { id: "figuras", title: "Figuras Geométricas", icon: "🔷", desc: "Conoce triángulos, cuadrados y más", xp: 60, questions: generateShapes() },
  ],
  secundaria: [
    { id: "algebra", title: "Álgebra Básica", icon: "📐", desc: "Resuelve ecuaciones con variables", xp: 100, questions: generateAlgebra() },
    { id: "geometria", title: "Geometría", icon: "📏", desc: "Áreas, perímetros y teorema de Pitágoras", xp: 120, questions: generateGeometry() },
    { id: "estadistica", title: "Estadística", icon: "📊", desc: "Media, moda y mediana de datos reales", xp: 90, questions: generateStats() },
    { id: "porcentajes", title: "Porcentajes", icon: "💯", desc: "Descuentos, impuestos y proporciones", xp: 80, questions: generatePercent() },
  ],
  highschool: [
    { id: "funciones", title: "Funciones", icon: "📈", desc: "Dominio, rango y graficación", xp: 150, questions: generateFunctions() },
    { id: "trigonometria", title: "Trigonometría", icon: "🔺", desc: "Seno, coseno, tangente y sus aplicaciones", xp: 180, questions: generateTrig() },
    { id: "calculo", title: "Pre-Cálculo", icon: "∞", desc: "Límites y fundamentos del cálculo", xp: 200, questions: generateCalculus() },
    { id: "probabilidad", title: "Probabilidad", icon: "🎲", desc: "Eventos, combinatoria y distribuciones", xp: 160, questions: generateProb() },
  ],
};

function generateArithmetic(type) {
  if (type === "suma") return [
    { q: "¿Cuánto es 47 + 38?", opts: ["75", "85", "95", "65"], ans: 1, hint: "Suma las unidades: 7+8=15, lleva 1" },
    { q: "María tenía 63 manzanas y regaló 29. ¿Cuántas le quedan?", opts: ["34", "44", "24", "54"], ans: 0, hint: "63 - 29: resta las unidades primero" },
    { q: "¿Cuánto es 125 + 347?", opts: ["462", "472", "482", "452"], ans: 1, hint: "Suma columna por columna de derecha a izquierda" },
    { q: "Un libro cuesta $45 y un cuaderno $23. ¿Cuánto pagás en total?", opts: ["$68", "$78", "$58", "$88"], ans: 0, hint: "Suma el precio de ambos artículos" },
    { q: "¿Cuánto es 200 - 87?", opts: ["113", "123", "103", "133"], ans: 0, hint: "200 - 87: usa complemento a 100" },
  ];
  return [
    { q: "¿Cuánto es 7 × 8?", opts: ["54", "56", "58", "52"], ans: 1, hint: "7×8 es lo mismo que 7+7+7+7+7+7+7+7" },
    { q: "Si hay 6 cajas con 9 huevos cada una, ¿cuántos huevos hay en total?", opts: ["54", "45", "63", "36"], ans: 0, hint: "6 × 9 = ?" },
    { q: "¿Cuánto es 12 × 5?", opts: ["55", "65", "60", "50"], ans: 2, hint: "Multiplicar por 5 es dividir por 2 y multiplicar por 10" },
    { q: "¿Cuánto es 9 × 9?", opts: ["72", "81", "90", "63"], ans: 1, hint: "9×9: el resultado siempre suma 9 sus dígitos" },
    { q: "Una caja tiene 8 filas de 7 chocolates. ¿Cuántos chocolates hay?", opts: ["56", "48", "64", "42"], ans: 0, hint: "8 × 7 = ?" },
  ];
}

function generateFractions() {
  return [
    { q: "¿Qué fracción representa 3 partes de una pizza dividida en 8?", opts: ["3/5", "3/8", "5/8", "8/3"], ans: 1, hint: "Numerador = partes tomadas, denominador = partes totales" },
    { q: "¿Cuánto es 1/2 + 1/4?", opts: ["2/6", "3/4", "2/4", "1/3"], ans: 1, hint: "Convierte 1/2 a 2/4, luego suma" },
    { q: "¿Cuál fracción es mayor: 2/3 o 3/4?", opts: ["2/3", "3/4", "Son iguales", "No se puede comparar"], ans: 1, hint: "Convierte a denominador común: 8/12 vs 9/12" },
    { q: "¿Qué es 3/4 de 20?", opts: ["12", "15", "10", "18"], ans: 1, hint: "Divide 20 entre 4, luego multiplica por 3" },
    { q: "Simplifica la fracción 6/9", opts: ["3/4", "2/3", "1/2", "4/6"], ans: 1, hint: "Divide numerador y denominador entre su MCD (3)" },
  ];
}

function generateShapes() {
  return [
    { q: "¿Cuántos lados tiene un hexágono?", opts: ["5", "7", "6", "8"], ans: 2, hint: "'Hexa' significa 6 en griego" },
    { q: "¿Cuál es el perímetro de un cuadrado con lado de 5 cm?", opts: ["20 cm", "25 cm", "15 cm", "10 cm"], ans: 0, hint: "Cuadrado: 4 lados iguales. P = 4 × lado" },
    { q: "¿Cuántos ángulos rectos tiene un rectángulo?", opts: ["2", "3", "4", "0"], ans: 2, hint: "Un ángulo recto mide exactamente 90°" },
    { q: "¿Qué figura tiene todos sus lados iguales y todos sus ángulos iguales?", opts: ["Rectángulo", "Rombo", "Cuadrado", "Trapecio"], ans: 2, hint: "Busca la figura más 'perfecta' y simétrica" },
    { q: "Un triángulo equilátero tiene todos sus lados de 4 cm. ¿Cuál es su perímetro?", opts: ["8 cm", "16 cm", "12 cm", "4 cm"], ans: 2, hint: "P = suma de todos los lados" },
  ];
}

function generateAlgebra() {
  return [
    { q: "Si 3x + 7 = 22, ¿cuánto vale x?", opts: ["3", "5", "4", "6"], ans: 1, hint: "Despeja x: 3x = 22 - 7 = 15, x = 15/3" },
    { q: "¿Cuánto es 2(x + 3) cuando x = 4?", opts: ["11", "14", "10", "8"], ans: 1, hint: "Sustituye x=4: 2(4+3) = 2×7" },
    { q: "Si y = 2x - 1 y x = 3, ¿cuánto vale y?", opts: ["4", "5", "6", "3"], ans: 1, hint: "Sustituye: y = 2(3) - 1 = 6 - 1" },
    { q: "¿Cuál es el valor de x en: x/4 = 6?", opts: ["10", "24", "2", "18"], ans: 1, hint: "Multiplica ambos lados por 4: x = 6×4" },
    { q: "Factoriza: x² - 9", opts: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "(x+3)²"], ans: 0, hint: "Diferencia de cuadrados: a²-b² = (a-b)(a+b)" },
  ];
}

function generateGeometry() {
  return [
    { q: "¿Cuál es el área de un triángulo con base 8 cm y altura 5 cm?", opts: ["20 cm²", "40 cm²", "13 cm²", "16 cm²"], ans: 0, hint: "A = (base × altura) / 2" },
    { q: "En un triángulo rectángulo, los catetos miden 3 y 4. ¿Cuánto mide la hipotenusa?", opts: ["6", "7", "5", "8"], ans: 2, hint: "Teorema de Pitágoras: c² = a² + b² = 9 + 16" },
    { q: "¿Cuál es el área de un círculo con radio 7 cm? (π ≈ 3.14)", opts: ["43.96 cm²", "153.86 cm²", "21.98 cm²", "87.92 cm²"], ans: 1, hint: "A = π × r² = 3.14 × 7²" },
    { q: "¿Cuánto suman los ángulos interiores de un triángulo?", opts: ["90°", "270°", "360°", "180°"], ans: 3, hint: "Propiedad fundamental de todos los triángulos" },
    { q: "¿Cuál es el volumen de un cubo con arista de 4 cm?", opts: ["16 cm³", "48 cm³", "64 cm³", "32 cm³"], ans: 2, hint: "V = arista³ = 4 × 4 × 4" },
  ];
}

function generateStats() {
  return [
    { q: "Las notas de un alumno son: 7, 8, 6, 9, 5. ¿Cuál es la media?", opts: ["6.5", "7", "7.5", "8"], ans: 1, hint: "Suma todos y divide entre la cantidad: (7+8+6+9+5)/5" },
    { q: "En el conjunto {3, 7, 7, 9, 2, 7}, ¿cuál es la moda?", opts: ["9", "3", "7", "2"], ans: 2, hint: "La moda es el valor que más se repite" },
    { q: "Ordena: 4, 1, 7, 3, 9. ¿Cuál es la mediana?", opts: ["3", "4", "7", "5"], ans: 1, hint: "Ordena: 1,3,4,7,9. El valor central es..." },
    { q: "¿Cuál es el rango de: 15, 22, 8, 30, 12?", opts: ["14", "22", "15", "30"], ans: 1, hint: "Rango = valor máximo - valor mínimo" },
    { q: "Si 5 amigos miden 1.60, 1.75, 1.55, 1.80, 1.65 m. ¿Cuál es su altura promedio?", opts: ["1.65 m", "1.67 m", "1.70 m", "1.62 m"], ans: 1, hint: "Suma todas las alturas y divide entre 5" },
  ];
}

function generatePercent() {
  return [
    { q: "¿Cuánto es el 25% de 80?", opts: ["15", "25", "20", "30"], ans: 2, hint: "25% = 1/4. Divide 80 entre 4" },
    { q: "Un producto cuesta $200 y tiene 30% de descuento. ¿Cuánto pagas?", opts: ["$140", "$130", "$160", "$170"], ans: 0, hint: "Descuento = 200×0.30 = 60. Precio final = 200 - 60" },
    { q: "¿Qué porcentaje es 45 de 180?", opts: ["20%", "25%", "30%", "15%"], ans: 1, hint: "(45/180) × 100 = ?" },
    { q: "Si el precio subió de $50 a $60, ¿cuál fue el % de aumento?", opts: ["15%", "20%", "25%", "10%"], ans: 1, hint: "Aumento = 10. % = (10/50) × 100" },
    { q: "¿Cuánto es el 15% de 300?", opts: ["30", "45", "60", "35"], ans: 1, hint: "15% = 10% + 5%. 30 + 15 = ?" },
  ];
}

function generateFunctions() {
  return [
    { q: "Si f(x) = 3x² - 2, ¿cuánto es f(2)?", opts: ["8", "10", "14", "6"], ans: 1, hint: "Sustituye x=2: 3(4) - 2 = 12 - 2" },
    { q: "¿Cuál es el dominio de f(x) = √x?", opts: ["Todos los reales", "x > 0", "x ≥ 0", "x ≠ 0"], ans: 2, hint: "No puedes sacar raíz de números negativos" },
    { q: "¿En qué punto intersecta y = 2x + 5 al eje Y?", opts: ["(2, 0)", "(0, 5)", "(5, 0)", "(0, 2)"], ans: 1, hint: "Cuando x = 0, y = 2(0) + 5 = ?" },
    { q: "Una función es par si f(-x) = :", opts: ["-f(x)", "f(x)", "0", "1/f(x)"], ans: 1, hint: "Las funciones pares son simétricas respecto al eje Y" },
    { q: "Si g(x) = x² y h(x) = x + 1, ¿cuánto es (g∘h)(2)?", opts: ["5", "9", "7", "4"], ans: 1, hint: "Primero h(2)=3, luego g(3)=9" },
  ];
}

function generateTrig() {
  return [
    { q: "En un triángulo rectángulo, sen(30°) =", opts: ["√3/2", "1/2", "√2/2", "1"], ans: 1, hint: "Ángulos especiales: sen(30°) = 1/2" },
    { q: "¿Cuánto es cos(60°)?", opts: ["1/2", "√3/2", "√2/2", "0"], ans: 0, hint: "cos(60°) = sen(30°) = 1/2" },
    { q: "Si sen(θ) = 0.6 y cos(θ) = 0.8, ¿cuánto es tan(θ)?", opts: ["0.8", "0.75", "1.33", "0.48"], ans: 1, hint: "tan(θ) = sen(θ)/cos(θ) = 0.6/0.8" },
    { q: "La identidad fundamental es: sen²(θ) + cos²(θ) =", opts: ["0", "2", "1", "tan²(θ)"], ans: 2, hint: "Es la identidad pitagórica fundamental" },
    { q: "¿Cuál es el período de la función y = sen(x)?", opts: ["π", "2π", "π/2", "4π"], ans: 1, hint: "La función seno completa un ciclo cada 2π radianes" },
  ];
}

function generateCalculus() {
  return [
    { q: "¿Cuál es el límite de (x² - 1)/(x - 1) cuando x→1?", opts: ["1", "0", "2", "∞"], ans: 2, hint: "Factoriza: (x-1)(x+1)/(x-1) = x+1. Cuando x→1..." },
    { q: "La derivada de f(x) = x³ es:", opts: ["x²", "3x", "3x²", "x³/3"], ans: 2, hint: "Regla de la potencia: d/dx(xⁿ) = n·xⁿ⁻¹" },
    { q: "¿Cuánto es lím(x→∞) de 1/x?", opts: ["1", "∞", "0", "-1"], ans: 2, hint: "A medida que x crece, 1/x se acerca a..." },
    { q: "La derivada de una constante es:", opts: ["La misma constante", "1", "0", "∞"], ans: 2, hint: "Una función constante no cambia, su tasa de cambio es..." },
    { q: "Si f'(x) > 0 en un intervalo, la función es:", opts: ["Decreciente", "Constante", "Creciente", "Negativa"], ans: 2, hint: "Derivada positiva indica que la función sube" },
  ];
}

function generateProb() {
  return [
    { q: "¿Cuál es la probabilidad de sacar un 6 al lanzar un dado?", opts: ["1/3", "1/4", "1/6", "1/2"], ans: 2, hint: "1 caso favorable / 6 casos posibles" },
    { q: "En una bolsa hay 3 rojas y 7 azules. P(roja) =", opts: ["3/10", "7/10", "3/7", "7/3"], ans: 0, hint: "P = favorables/totales = 3/(3+7)" },
    { q: "¿Cuántas formas hay de ordenar 3 libros distintos?", opts: ["3", "6", "9", "12"], ans: 1, hint: "Permutación: 3! = 3×2×1 = ?" },
    { q: "Si P(A) = 0.4 y P(B) = 0.3 son independientes, P(A∩B) =", opts: ["0.7", "0.12", "0.1", "0.5"], ans: 1, hint: "Eventos independientes: P(A∩B) = P(A) × P(B)" },
    { q: "¿Cuántas combinaciones hay de elegir 2 de 5 elementos?", opts: ["10", "20", "5", "15"], ans: 0, hint: "C(5,2) = 5!/(2!×3!) = 10" },
  ];
}

// ─── MathBot character ────────────────────────────────────────────────────────
function MathBot({ mood }) {
  const faces = {
    idle: "😊",
    correct: "🥳",
    wrong: "😅",
    thinking: "🤔",
    celebrate: "🎉",
  };
  return (
    <div style={{
      fontSize: 56,
      transition: "transform 0.3s",
      transform: mood === "correct" ? "scale(1.3) rotate(-10deg)" : mood === "wrong" ? "scale(0.9)" : "scale(1)",
      display: "inline-block",
      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
    }}>
      {faces[mood] || faces.idle}
    </div>
  );
}

// ─── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ percent, color, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.gray100} strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

// ─── XP Bar ───────────────────────────────────────────────────────────────────
function XPBar({ xp, maxXp = 500 }) {
  const pct = Math.min((xp / maxXp) * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 13, color: T.yellow, fontWeight: 700, whiteSpace: "nowrap" }}>⭐ {xp} XP</span>
      <div style={{ flex: 1, height: 10, background: T.navyLight, borderRadius: 5, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${T.yellow}, ${T.orange})`, borderRadius: 5, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

// ─── Quiz component ───────────────────────────────────────────────────────────
function QuizView({ topic, color, onBack, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [mood, setMood] = useState("idle");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const q = topic.questions[idx];

  function pick(i) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.ans) {
      setMood("correct");
      setScore(s => s + 1);
    } else {
      setMood("wrong");
    }
    setTimeout(() => {
      if (idx + 1 < topic.questions.length) {
        setIdx(n => n + 1);
        setSelected(null);
        setMood("idle");
        setShowHint(false);
      } else {
        setDone(true);
        setMood("celebrate");
      }
    }, 1400);
  }

  if (done) {
    const earned = Math.round((score / topic.questions.length) * topic.xp);
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <MathBot mood="celebrate" />
        <h2 style={{ fontSize: 28, color: T.navy, margin: "20px 0 8px" }}>¡Ejercicio completado!</h2>
        <p style={{ color: T.gray500, marginBottom: 24 }}>Respondiste {score} de {topic.questions.length} correctamente</p>
        <div style={{ display: "inline-flex", gap: 32, background: T.offWhite, borderRadius: 16, padding: "20px 32px", marginBottom: 32 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: color }}>{score}/{topic.questions.length}</div>
            <div style={{ fontSize: 12, color: T.gray500 }}>Correctas</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: T.yellow }}>+{earned}</div>
            <div style={{ fontSize: 12, color: T.gray500 }}>XP ganados</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: T.green }}>{Math.round(score/topic.questions.length*100)}%</div>
            <div style={{ fontSize: 12, color: T.gray500 }}>Precisión</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onBack} style={btnStyle(T.gray100, T.gray800)}>← Volver</button>
          <button onClick={() => onComplete(earned)} style={btnStyle(color, T.white)}>Guardar progreso ✓</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: T.gray500, fontSize: 15, display: "flex", alignItems: "center", gap: 4 }}>
          ← Salir
        </button>
        <span style={{ fontSize: 13, color: T.gray500, fontWeight: 600 }}>{idx + 1} / {topic.questions.length}</span>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.green }}>✓ {score} correctas</div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: T.gray100, borderRadius: 3, marginBottom: 28, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((idx) / topic.questions.length) * 100}%`, background: color, borderRadius: 3, transition: "width 0.4s" }} />
      </div>

      {/* Bot + Question */}
      <div style={{ background: T.white, borderRadius: 20, padding: "28px 24px", boxShadow: "0 4px 24px rgba(30,58,95,0.08)", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <MathBot mood={mood} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: T.navy, lineHeight: 1.5, margin: 0 }}>{q.q}</p>
            {showHint && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFF8E1", borderRadius: 10, borderLeft: `3px solid ${T.yellow}`, fontSize: 13, color: T.gray800 }}>
                💡 {q.hint}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Options */}
      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        {q.opts.map((opt, i) => {
          let bg = T.white, border = T.gray300, textColor = T.gray800;
          if (selected !== null) {
            if (i === q.ans) { bg = "#E8F8EF"; border = T.green; textColor = T.greenDark; }
            else if (i === selected) { bg = "#FEEAEA"; border = T.coral; textColor = T.coralDark; }
          }
          return (
            <button key={i} onClick={() => pick(i)} style={{
              background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: "14px 20px",
              textAlign: "left", cursor: selected !== null ? "default" : "pointer", color: textColor,
              fontWeight: 600, fontSize: 15, fontFamily: "inherit",
              transition: "all 0.2s", transform: selected === i && i !== q.ans ? "shake 0.3s" : "none",
              display: "flex", alignItems: "center", gap: 12
            }}>
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: border + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: border, flexShrink: 0 }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {selected !== null && i === q.ans && <span style={{ marginLeft: "auto" }}>✅</span>}
              {selected !== null && i === selected && i !== q.ans && <span style={{ marginLeft: "auto" }}>❌</span>}
            </button>
          );
        })}
      </div>

      {!showHint && selected === null && (
        <button onClick={() => setShowHint(true)} style={{ background: "none", border: `1px solid ${T.yellow}`, color: T.yellowDark, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
          💡 Ver pista
        </button>
      )}
    </div>
  );
}

function btnStyle(bg, text) {
  return {
    background: bg, color: text, border: "none", borderRadius: 12, padding: "12px 24px",
    fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
  };
}

// ─── Topic Card ───────────────────────────────────────────────────────────────
function TopicCard({ topic, color, bg, completed, onStart }) {
  return (
    <div onClick={onStart} style={{
      background: T.white, borderRadius: 20, padding: "24px", cursor: "pointer",
      border: `2px solid ${completed ? color : "transparent"}`,
      boxShadow: "0 2px 16px rgba(30,58,95,0.07)",
      transition: "all 0.2s",
      position: "relative", overflow: "hidden",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      {completed && (
        <div style={{ position: "absolute", top: 12, right: 12, background: color, color: T.white, borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "3px 10px" }}>✓ Completado</div>
      )}
      <div style={{ fontSize: 40, marginBottom: 12 }}>{topic.icon}</div>
      <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: T.navy }}>{topic.title}</h3>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: T.gray500, lineHeight: 1.5 }}>{topic.desc}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: color, fontWeight: 700, background: bg, padding: "4px 10px", borderRadius: 20 }}>⭐ {topic.xp} XP</span>
        <span style={{ fontSize: 13, color: T.gray500 }}>{topic.questions.length} preguntas</span>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function MathKidsApp() {
  const [screen, setScreen] = useState("home"); // home | level | quiz
  const [activeLevel, setActiveLevel] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [xp, setXp] = useState(120);
  const [completed, setCompleted] = useState(new Set());
  const [streak, setStreak] = useState(3);

  const level = LEVELS.find(l => l.id === activeLevel);
  const topics = activeLevel ? TOPICS[activeLevel] : [];

  function handleComplete(earned) {
    setXp(x => x + earned);
    setCompleted(s => new Set([...s, `${activeLevel}:${activeTopic.id}`]));
    setScreen("level");
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const appStyle = {
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    minHeight: "100vh",
    background: T.offWhite,
    color: T.gray800,
  };

  const headerStyle = {
    background: T.navy,
    color: T.white,
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
  };

  // ── Quiz Screen ─────────────────────────────────────────────────────────────
  if (screen === "quiz") {
    return (
      <div style={appStyle}>
        <header style={headerStyle}>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>🧮 MathKids</span>
          <XPBar xp={xp} />
        </header>
        <QuizView
          topic={activeTopic}
          color={level.color}
          onBack={() => setScreen("level")}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  // ── Level Screen ────────────────────────────────────────────────────────────
  if (screen === "level") {
    const levelCompleted = topics.filter(t => completed.has(`${activeLevel}:${t.id}`)).length;
    return (
      <div style={appStyle}>
        <header style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: T.white, cursor: "pointer", fontSize: 20, padding: 0 }}>←</button>
            <span style={{ fontWeight: 800, fontSize: 18 }}>🧮 MathKids</span>
          </div>
          <XPBar xp={xp} />
        </header>

        {/* Level hero */}
        <div style={{ background: level.color, color: T.white, padding: "40px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)" }} />
          <div style={{ fontSize: 56, marginBottom: 8 }}>{level.emoji}</div>
          <h1 style={{ margin: "0 0 4px", fontSize: 30, fontWeight: 900 }}>{level.label}</h1>
          <p style={{ margin: "0 0 20px", opacity: 0.85, fontSize: 16 }}>{level.grades}</p>
          <div style={{ display: "inline-flex", gap: 24, background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "12px 28px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{levelCompleted}/{topics.length}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Completados</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.3)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{topics.reduce((s, t) => s + t.xp, 0)}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>XP disponibles</div>
            </div>
          </div>
        </div>

        {/* Progress arc */}
        <div style={{ background: T.white, padding: "20px 24px", borderBottom: `1px solid ${T.gray100}` }}>
          <div style={{ height: 8, background: T.gray100, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(levelCompleted / topics.length) * 100}%`, background: `linear-gradient(90deg, ${level.color}, ${level.dark})`, borderRadius: 4, transition: "width 0.6s" }} />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: T.gray500 }}>Progreso del nivel: {levelCompleted} de {topics.length} temas</p>
        </div>

        {/* Topics grid */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800, color: T.navy }}>Temas disponibles</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {topics.map(topic => (
              <TopicCard
                key={topic.id}
                topic={topic}
                color={level.color}
                bg={level.bg}
                completed={completed.has(`${activeLevel}:${topic.id}`)}
                onStart={() => { setActiveTopic(topic); setScreen("quiz"); }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Home Screen ─────────────────────────────────────────────────────────────
  const totalCompleted = completed.size;
  const totalTopics = Object.values(TOPICS).flat().length;

  return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🧮</span>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.5px" }}>MathKids</span>
        </div>
        <XPBar xp={xp} />
      </header>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyLight} 60%, #1a6fa8 100%)`,
        color: T.white, padding: "56px 24px 64px", textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        {/* Decorative circles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: [120, 80, 60, 100, 70, 90][i],
            height: [120, 80, 60, 100, 70, 90][i],
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            top: ["10%","60%","30%","80%","15%","70%"][i],
            left: ["5%","15%","80%","75%","55%","45%"][i],
          }} />
        ))}

        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 72, marginBottom: 16, lineHeight: 1 }}>🧮</div>
          <h1 style={{ margin: "0 0 12px", fontSize: 42, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.1 }}>
            Aprende Matemáticas<br />
            <span style={{ color: T.yellow }}>de forma divertida</span>
          </h1>
          <p style={{ margin: "0 0 32px", fontSize: 18, opacity: 0.8, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            Ejercicios interactivos, pistas inteligentes y recompensas para cada nivel educativo.
          </p>

          {/* Stats row */}
          <div style={{ display: "inline-flex", gap: 0, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", borderRadius: 16, overflow: "hidden" }}>
            {[
              { val: `${totalCompleted}/${totalTopics}`, lbl: "Temas completados" },
              { val: `${xp} XP`, lbl: "Puntos ganados" },
              { val: `${streak} 🔥`, lbl: "Días seguidos" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "16px 24px", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.15)" : "none", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: T.yellow }}>{s.val}</div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Level cards */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900, color: T.navy }}>Elige tu nivel</h2>
          <p style={{ margin: 0, color: T.gray500 }}>Selecciona el nivel que corresponde a tu grado escolar</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {LEVELS.map(lvl => {
            const lvlTopics = TOPICS[lvl.id];
            const lvlDone = lvlTopics.filter(t => completed.has(`${lvl.id}:${t.id}`)).length;
            const pct = Math.round((lvlDone / lvlTopics.length) * 100);
            return (
              <div key={lvl.id} onClick={() => { setActiveLevel(lvl.id); setScreen("level"); }}
                style={{
                  background: T.white, borderRadius: 24, overflow: "hidden", cursor: "pointer",
                  boxShadow: "0 4px 24px rgba(30,58,95,0.08)", border: `2px solid transparent`,
                  transition: "all 0.25s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.border = `2px solid ${lvl.color}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.border = "2px solid transparent"; }}
              >
                <div style={{ background: lvl.color, padding: "32px 28px", color: T.white, position: "relative" }}>
                  <div style={{ position: "absolute", right: 20, top: 20 }}>
                    <ProgressRing percent={pct} color="rgba(255,255,255,0.9)" />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{pct}%</div>
                  </div>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>{lvl.emoji}</div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 900 }}>{lvl.label}</h3>
                  <p style={{ margin: 0, opacity: 0.85, fontSize: 14 }}>{lvl.grades}</p>
                </div>
                <div style={{ padding: "20px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: T.gray500 }}>{lvlDone} de {lvlTopics.length} temas</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: lvl.color }}>
                      {lvlTopics.reduce((s, t) => s + t.xp, 0)} XP total
                    </span>
                  </div>
                  <div style={{ height: 6, background: T.gray100, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: lvl.color, borderRadius: 3, transition: "width 0.6s" }} />
                  </div>
                  <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {lvlTopics.map(t => (
                      <span key={t.id} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: completed.has(`${lvl.id}:${t.id}`) ? lvl.bg : T.gray100, color: completed.has(`${lvl.id}:${t.id}`) ? lvl.dark : T.gray500, fontWeight: 600 }}>
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

      {/* How it works */}
      <div style={{ background: T.navy, color: T.white, padding: "56px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900 }}>¿Cómo funciona?</h2>
          <p style={{ margin: "0 0 40px", opacity: 0.7 }}>Simple, divertido y efectivo</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 24 }}>
            {[
              { icon: "🎯", title: "Elige un tema", desc: "Selecciona el nivel y el tema que quieres practicar" },
              { icon: "💡", title: "Responde preguntas", desc: "Resuelve ejercicios con pistas si las necesitas" },
              { icon: "⭐", title: "Gana XP", desc: "Acumula puntos de experiencia con cada respuesta" },
              { icon: "🏆", title: "Sube de nivel", desc: "Completa todos los temas y conviértete en experto" },
            ].map((step, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{step.icon}</div>
                <h4 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: T.yellow }}>{step.title}</h4>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.75, lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#15304F", color: "rgba(255,255,255,0.5)", padding: "20px 24px", textAlign: "center", fontSize: 13 }}>
        🧮 MathKids · Plataforma educativa de matemáticas · Primaria, Secundaria y High School
      </div>
    </div>
  );
}
