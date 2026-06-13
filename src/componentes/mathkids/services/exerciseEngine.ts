import type { Difficulty, Exercise } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Motor de generación DETERMINISTA de ejercicios.
//
// El código calcula la respuesta y los distractores → la matemática SIEMPRE es
// correcta y siempre se entrega el set completo (0% de error, 100% de yield).
// La IA (opcional) solo reescribe el enunciado; nunca decide la matemática.
//
// Cada generador expone `mustContain`: los números que DEBEN seguir presentes si
// la IA reescribe el enunciado (si no, se descarta la reescritura y se conserva
// el texto determinista).
// ─────────────────────────────────────────────────────────────────────────────

export interface GenExercise extends Exercise {
  /** Números que deben permanecer en el enunciado si la IA lo reescribe. */
  mustContain: string[];
  /** true = enunciado tipo problema, apto para que la IA lo enriquezca. */
  rewordable: boolean;
}

// ─── Utilidades ───────────────────────────────────────────────────────────────
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function shuffle<T>(arr: T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

const SUP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻",
};
const sup = (n: number) => String(n).split("").map(c => SUP[c] ?? c).join("");

/** Entero con signo menos Unicode (consistente con el banco estático). */
const fmtInt = (n: number) => (n < 0 ? `−${Math.abs(n)}` : String(n));

/** Número decimal sin ceros finales: 2.50 → "2.5", 6 → "6". */
const trimNum = (n: number) => String(parseFloat(n.toFixed(4)));

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
function simplifyFrac(a: number, b: number): string {
  const g = gcd(Math.abs(a), Math.abs(b)) || 1;
  return `${a / g}/${b / g}`;
}
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const rangeDown = (n: number): number[] => Array.from({ length: n }, (_, i) => n - i);

/** Distractores enteros distintos del correcto (signo Unicode). */
function numDistractors(correct: number, extra: number[] = [], allowNeg = false): string[] {
  const candidates = [...extra, correct + 1, correct - 1, correct + 2, correct - 2,
    correct + 10, correct - 10, correct + 5, correct + 3];
  const out: number[] = [];
  for (const c of candidates) {
    if (c !== correct && (allowNeg || c >= 0) && !out.includes(c)) out.push(c);
    if (out.length >= 3) break;
  }
  let d = 1;
  while (out.length < 3 && d <= 99) {
    for (const c of [correct + d, correct - d]) {
      if (c !== correct && (allowNeg || c >= 0) && !out.includes(c) && out.length < 3) out.push(c);
    }
    d++;
  }
  while (out.length < 3) out.push(correct + 100 + out.length);
  return out.slice(0, 3).map(fmtInt);
}

/** Distractores decimales (1 cifra) distintos del correcto. */
function decDistractors(c: number): string[] {
  const cs = c.toFixed(1);
  const cands = [c + 0.1, c - 0.1, c + 0.2, c - 0.2, c + 1, c - 1, c + 0.3];
  const out: string[] = [];
  for (const x of cands) {
    const s = x.toFixed(1);
    if (s !== cs && x >= 0 && !out.includes(s)) out.push(s);
    if (out.length >= 3) break;
  }
  let k = 2;
  while (out.length < 3) { const s = (c + k).toFixed(1); if (s !== cs && !out.includes(s)) out.push(s); k++; }
  return out.slice(0, 3);
}

/** Distractores enteros con unidad ("24 cm", "54 cm²") garantizados distintos. */
function unitDistractors(correct: number, unit: string, extra: number[] = []): string[] {
  return numDistractors(correct, extra).map(s => `${s} ${unit}`);
}

/** Distractores decimales con unidad, garantizados distintos del correcto. */
function unitDistractorsDec(correct: number, unit: string, extra: number[] = []): string[] {
  const cs = trimNum(correct);
  const cands = [...extra, correct * 2, correct / 2, correct + 1, correct - 1, correct + 2, correct + 0.5];
  const out: string[] = [];
  for (const x of cands) {
    const s = trimNum(x);
    if (s !== cs && x > 0 && !out.includes(s)) out.push(s);
    if (out.length >= 3) break;
  }
  let k = 1;
  while (out.length < 3) { const s = trimNum(correct + k); if (s !== cs && !out.includes(s)) out.push(s); k++; }
  return out.slice(0, 3).map(s => `${s} ${unit}`);
}

/** Distractores para fracciones (strings) distintos del correcto. */
function fracDistractors(a: number, b: number, correct: string): string[] {
  const cand = [`${b - a}/${b}`, simplifyFrac(b - a, b), `${a}/${b - a}`, `${b}/${a}`, `${a}/${b}`];
  const out: string[] = [];
  for (const c of cand) {
    const [n, d] = c.split("/");
    if (c !== correct && !out.includes(c) && d !== "0" && n !== d) out.push(c);
    if (out.length >= 3) break;
  }
  let k = 2;
  while (out.length < 3) { const f = `${a}/${b + k}`; if (f !== correct && !out.includes(f)) out.push(f); k++; }
  return out.slice(0, 3);
}

/**
 * Ensambla un ejercicio de opción múltiple. `ans` se fija al índice real de la
 * respuesta correcta tras barajar; opts[ans] === correct SIEMPRE por construcción.
 */
function mc(
  q: string,
  correct: string,
  distractors: string[],
  steps: string[],
  formula: string,
  hint: string,
  mustContain: string[] = [],
  rewordable = false,
): GenExercise {
  const uniq: string[] = [];
  for (const d of distractors) {
    if (d !== correct && !uniq.includes(d)) uniq.push(d);
    if (uniq.length === 3) break;
  }
  let n = 2;
  while (uniq.length < 3) { const f = `${correct}·${n++}`; if (!uniq.includes(f)) uniq.push(f); }
  const opts = shuffle([correct, ...uniq.slice(0, 3)]);
  return { q, opts, ans: opts.indexOf(correct), hint, explanation: { steps, formula }, mustContain, rewordable };
}

/** Construye un ejercicio conceptual desde una tupla [pregunta, correcta, distractores]. */
function fromTuple(t: [string, string, string[]], formula: string, hint: string): GenExercise {
  const stem = t[0].replace(/\s*=\s*$/, "");
  return mc(t[0], t[1], t[2], [`${stem} = ${t[1]} ✓`], formula, hint, []);
}

// ─── Generadores por materia ──────────────────────────────────────────────────
type Gen = (d: Difficulty) => GenExercise;

const NAMES = ["Ana", "Luis", "María", "Pedro", "Sofía", "Juan", "Lucía", "Diego"];

const GENERATORS: Record<string, Gen[]> = {
  // ── Primaria: Suma y Resta ──
  suma: [
    (d) => {
      const [lo, hi] = d === "facil" ? [10, 49] : d === "dificil" ? [100, 499] : [20, 99];
      const a = rnd(lo, hi), b = rnd(lo, hi), c = a + b;
      return mc(`¿Cuánto es ${a} + ${b}?`, String(c),
        numDistractors(c, [c + 10, c - 10, c - 1]),
        [`Suma ${a} + ${b}`, `Resultado: ${c} ✓`], "Suma de números naturales",
        `Suma ${a} y ${b}`, [String(a), String(b)]);
    },
    (d) => {
      const [lo, hi] = d === "facil" ? [10, 49] : d === "dificil" ? [100, 499] : [20, 99];
      const a = rnd(lo, hi), b = rnd(lo, a), c = a - b;
      return mc(`¿Cuánto es ${a} − ${b}?`, String(c),
        numDistractors(c, [c + 10, c - 10, c + 1]),
        [`Resta ${a} − ${b}`, `Resultado: ${c} ✓`], "Resta de números naturales",
        `Resta ${b} de ${a}`, [String(a), String(b)]);
    },
    (d) => {
      const [lo, hi] = d === "facil" ? [5, 30] : d === "dificil" ? [50, 300] : [15, 80];
      const a = rnd(lo, hi), b = rnd(lo, hi), c = a + b;
      const name = pick(NAMES), obj = pick(["manzanas", "galletas", "monedas", "peras", "flores", "fichas"]);
      return mc(`${name} tiene ${a} ${obj} y consigue ${b} más. ¿Cuántas tiene en total?`, String(c),
        numDistractors(c, [c - 1, c + 10, c + 1]),
        [`${a} + ${b}`, `= ${c} ✓`], "Total = inicial + añadido",
        `Suma ${a} + ${b}`, [String(a), String(b)], true);
    },
  ],

  // ── Primaria: Multiplicación y División ──
  multi: [
    (d) => {
      const [lo, hi] = d === "facil" ? [2, 9] : d === "dificil" ? [6, 12] : [2, 12];
      const a = rnd(lo, hi), b = rnd(lo, hi), c = a * b;
      return mc(`¿Cuánto es ${a} × ${b}?`, String(c),
        numDistractors(c, [c + a, c - a, c + b]),
        [`${a} × ${b}`, `= ${c} ✓`], "Multiplicación",
        `Tabla del ${a}`, [String(a), String(b)]);
    },
    (d) => {
      const [lo, hi] = d === "facil" ? [2, 9] : [2, 12];
      const b = rnd(lo, hi), c = rnd(2, 9), a = b * c;
      return mc(`¿Cuánto es ${a} ÷ ${b}?`, String(c),
        numDistractors(c, [c + 1, c - 1, c + 2]),
        [`${b} × ${c} = ${a}`, `Entonces ${a} ÷ ${b} = ${c} ✓`], "División exacta",
        `¿${b} por cuánto da ${a}?`, [String(a), String(b)]);
    },
    (d) => {
      const [lo, hi] = d === "facil" ? [2, 6] : [3, 9];
      const g = rnd(lo, hi), e = rnd(lo, hi), c = g * e;
      const obj = pick(["cajas", "bolsas", "cestas", "filas", "repisas"]);
      const it = pick(["galletas", "frutas", "peras", "flores", "fichas"]);
      return mc(`Hay ${g} ${obj} con ${e} ${it} cada una. ¿Cuántas ${it} hay en total?`, String(c),
        numDistractors(c, [g + e, c + e, c - e]),
        [`${g} × ${e}`, `= ${c} ✓`], "Total = grupos × elementos",
        `${g} × ${e}`, [String(g), String(e)], true);
    },
  ],

  // ── Primaria: Fracciones ──
  fracciones: [
    () => {
      const den = rnd(5, 10), a = rnd(1, den - 2), b = rnd(1, den - 1 - a), s = a + b;
      return mc(`¿Cuánto es ${a}/${den} + ${b}/${den}?`, `${s}/${den}`,
        [`${s}/${den + den}`, `${a}/${den}`, `${b}/${den}`, `${s + 1}/${den}`],
        [`Mismo denominador: ${den}`, `${a}+${b}=${s}`, `Resultado: ${s}/${den} ✓`],
        "a/c + b/c = (a+b)/c", "Suma los numeradores", [`${a}/${den}`, `${b}/${den}`]);
    },
    () => {
      const den = rnd(2, 6), k = rnd(2, 6), n = den * k, c = k;
      return mc(`¿Cuánto es 1/${den} de ${n}?`, String(c),
        numDistractors(c, [n, den, n - k]),
        [`${n} ÷ ${den} = ${c}`, `Una de ${den} partes de ${n} es ${c} ✓`],
        "Fracción de número = n ÷ denominador", `${n} ÷ ${den}`, [String(n), String(den)]);
    },
    () => {
      const [num, den] = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5]]);
      const k = rnd(2, 5), a = num * k, b = den * k;
      return mc(`Simplifica ${a}/${b}`, `${num}/${den}`,
        [`${a}/${b}`, `${num}/${den + 1}`, `${num + 1}/${den}`, `${den}/${num}`],
        [`MCD(${a},${b})=${k}`, `${a}÷${k}=${num}, ${b}÷${k}=${den}`, `${num}/${den} ✓`],
        "Simplificar = dividir entre el MCD", `MCD(${a},${b})=${k}`, [`${a}/${b}`]);
    },
  ],

  // ── Primaria: Números Decimales ──
  decimales: [
    () => {
      const a = rnd(10, 89) / 10, b = rnd(10, 89) / 10, c = Math.round((a + b) * 10) / 10;
      return mc(`¿Cuánto es ${a.toFixed(1)} + ${b.toFixed(1)}?`, c.toFixed(1),
        decDistractors(c), [`${a.toFixed(1)} + ${b.toFixed(1)}`, `= ${c.toFixed(1)} ✓`],
        "Suma decimal: alinear el punto", "Suma las décimas", [a.toFixed(1), b.toFixed(1)]);
    },
    () => {
      const a = rnd(30, 99) / 10, b = rnd(10, Math.round(a * 10) - 1) / 10, c = Math.round((a - b) * 10) / 10;
      return mc(`¿Cuánto es ${a.toFixed(1)} − ${b.toFixed(1)}?`, c.toFixed(1),
        decDistractors(c), [`${a.toFixed(1)} − ${b.toFixed(1)}`, `= ${c.toFixed(1)} ✓`],
        "Resta decimal: alinear el punto", "Resta las décimas", [a.toFixed(1), b.toFixed(1)]);
    },
    () => {
      const a = rnd(1, 99) / 100, c = a * 10;
      return mc(`¿Cuánto es ${a.toFixed(2)} × 10?`, trimNum(c),
        [trimNum(a * 100), trimNum(a), trimNum(c + 1), trimNum(c + 0.5)],
        [`Multiplicar por 10 mueve el punto un lugar a la derecha`, `= ${trimNum(c)} ✓`],
        "n × 10 mueve el punto 1 lugar a la derecha", "Mueve el punto a la derecha", [a.toFixed(2)]);
    },
  ],

  // ── Primaria: Geometría Básica ──
  geometria: [
    () => {
      const l = rnd(3, 20), c = 4 * l;
      return mc(`¿Cuál es el perímetro de un cuadrado de lado ${l} cm?`, `${c} cm`,
        unitDistractors(c, "cm", [c + l, l * l, c - l, 2 * l]),
        [`P = 4 × ${l}`, `= ${c} cm ✓`], "Perímetro cuadrado = 4 × lado",
        "4 lados iguales", [String(l)]);
    },
    () => {
      const b = rnd(2, 20), h = rnd(2, 20), c = b * h;
      return mc(`Área de un rectángulo de base ${b} cm y altura ${h} cm`, `${c} cm²`,
        unitDistractors(c, "cm²", [b + h, 2 * (b + h), c + b, c - h]),
        [`A = ${b} × ${h}`, `= ${c} cm² ✓`], "Área rectángulo = base × altura",
        "base × altura", [String(b), String(h)]);
    },
    () => {
      const l = rnd(2, 15), c = l * l;
      return mc(`Área de un cuadrado de lado ${l} cm`, `${c} cm²`,
        unitDistractors(c, "cm²", [4 * l, 2 * l, c + l, c - 1]),
        [`A = ${l} × ${l}`, `= ${c} cm² ✓`], "Área cuadrado = lado²",
        "lado × lado", [String(l)]);
    },
    () => {
      const b = rnd(2, 12) * 2, h = rnd(2, 12), c = (b * h) / 2;
      return mc(`Área de un triángulo de base ${b} cm y altura ${h} cm`, `${c} cm²`,
        unitDistractors(c, "cm²", [b * h, c + b, c - h, b + h]),
        [`A = (${b} × ${h}) / 2`, `= ${b * h} / 2`, `= ${c} cm² ✓`],
        "Área triángulo = (base × altura) / 2", "(base × altura) / 2", [String(b), String(h)]);
    },
  ],

  // ── Primaria: Medidas y Conversiones ──
  medidas: [
    () => {
      const m = rnd(2, 9), c = m * 100;
      return mc(`¿Cuántos centímetros hay en ${m} metros?`, `${c} cm`,
        [`${m * 10} cm`, `${m * 1000} cm`, `${m} cm`],
        [`1 m = 100 cm`, `${m} × 100 = ${c}`, `= ${c} cm ✓`], "m → cm: ×100",
        "1 m = 100 cm", [String(m)]);
    },
    () => {
      const k = rnd(2, 9), c = k * 1000;
      return mc(`¿Cuántos gramos hay en ${k} kilogramos?`, `${c} g`,
        [`${k * 100} g`, `${k * 10} g`, `${k} g`],
        [`1 kg = 1000 g`, `${k} × 1000 = ${c}`, `= ${c} g ✓`], "kg → g: ×1000",
        "1 kg = 1000 g", [String(k)]);
    },
    () => {
      const L = rnd(2, 9), c = L * 1000;
      return mc(`¿Cuántos mililitros hay en ${L} litros?`, `${c} mL`,
        [`${L * 100} mL`, `${L * 10} mL`, `${L} mL`],
        [`1 L = 1000 mL`, `${L} × 1000 = ${c}`, `= ${c} mL ✓`], "L → mL: ×1000",
        "1 L = 1000 mL", [String(L)]);
    },
    () => {
      const h = rnd(2, 9), c = h * 60;
      return mc(`¿Cuántos minutos hay en ${h} horas?`, `${c} min`,
        [`${h * 30} min`, `${h * 100} min`, `${h * 6} min`],
        [`1 h = 60 min`, `${h} × 60 = ${c}`, `= ${c} min ✓`], "h → min: ×60",
        "1 h = 60 min", [String(h)]);
    },
  ],

  // ── Secundaria: Álgebra ──
  algebra: [
    () => {
      const x = rnd(2, 12), a = rnd(2, 9), b = rnd(1, 20), c = a * x + b;
      return mc(`Si ${a}x + ${b} = ${c}, ¿cuánto vale x?`, `x=${x}`,
        [`x=${x + 1}`, `x=${x - 1}`, `x=${c - b}`, `x=${x + 2}`],
        [`${a}x = ${c} − ${b} = ${a * x}`, `x = ${a * x} ÷ ${a} = ${x} ✓`],
        "Despejar en orden inverso", `Resta ${b}, luego divide entre ${a}`,
        [String(a), String(b), String(c)]);
    },
    () => {
      const x = rnd(2, 15), a = rnd(2, 9), c = a * x;
      return mc(`Resuelve: ${a}x = ${c}`, `x=${x}`,
        [`x=${x + 1}`, `x=${x - 1}`, `x=${c}`, `x=${x + 3}`],
        [`x = ${c} ÷ ${a}`, `x = ${x} ✓`], "Divide entre el coeficiente",
        `Divide entre ${a}`, [String(a), String(c)]);
    },
    () => {
      const x = rnd(2, 9), b = rnd(1, 15), c = x + b;
      return mc(`Si x + ${b} = ${c}, ¿cuánto vale x?`, `x=${x}`,
        [`x=${x + 1}`, `x=${x - 1}`, `x=${c}`, `x=${c + b}`],
        [`x = ${c} − ${b}`, `x = ${x} ✓`], "Resta en ambos lados",
        `Resta ${b}`, [String(b), String(c)]);
    },
  ],

  // ── Secundaria: Geometría Avanzada ──
  geometria2: [
    () => {
      const r = rnd(2, 12), c = Math.round(3.14 * r * r * 100) / 100;
      return mc(`Área de un círculo de radio ${r} cm (π≈3.14)`, `${trimNum(c)} cm²`,
        unitDistractorsDec(c, "cm²", [Math.round(2 * 3.14 * r * 100) / 100, Math.round(3.14 * r * 100) / 100, r * r]),
        [`A = 3.14 × ${r}²`, `= 3.14 × ${r * r}`, `= ${trimNum(c)} cm² ✓`],
        "Área círculo = π × r²", "π × r²", [String(r)]);
    },
    () => {
      const a = rnd(2, 8), c = a * a * a;
      return mc(`Volumen de un cubo de arista ${a} cm`, `${c} cm³`,
        unitDistractors(c, "cm³", [a * a, 3 * a, c + a, a * a + a]),
        [`V = ${a}³`, `= ${c} cm³ ✓`], "Volumen cubo = a³", "arista³", [String(a)]);
    },
    () => {
      const [x, y, h] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]]);
      return mc(`Catetos de un triángulo rectángulo: ${x} y ${y}. ¿Hipotenusa?`, String(h),
        numDistractors(h, [x + y, h + 1, h - 1]),
        [`c² = ${x}² + ${y}² = ${x * x + y * y}`, `c = √${x * x + y * y} = ${h} ✓`],
        "Teorema de Pitágoras: c² = a² + b²", `c² = ${x}² + ${y}²`, [String(x), String(y)]);
    },
    () => {
      const b = rnd(2, 12) * 2, h = rnd(2, 12), c = (b * h) / 2;
      return mc(`Área de un triángulo de base ${b} cm y altura ${h} cm`, `${c} cm²`,
        unitDistractors(c, "cm²", [b * h, c + b, b + h, c - h]),
        [`A = (${b} × ${h}) / 2`, `= ${c} cm² ✓`], "Área triángulo = (b × h) / 2",
        "(base × altura) / 2", [String(b), String(h)]);
    },
  ],

  // ── Secundaria: Estadística ──
  estadistica: [
    () => {
      const n = pick([3, 4, 5]);
      const nums = Array.from({ length: n }, () => rnd(2, 20));
      let sum = nums.reduce((a, b) => a + b, 0);
      const rem = sum % n;
      if (rem !== 0) { nums[n - 1] += n - rem; sum = nums.reduce((a, b) => a + b, 0); }
      const c = sum / n;
      return mc(`¿Cuál es la media de ${nums.join(", ")}?`, String(c),
        numDistractors(c, [c + 1, c - 1, c + 2]),
        [`Suma: ${nums.join("+")} = ${sum}`, `${sum} ÷ ${n} = ${c} ✓`],
        "Media = Σx / n", `Suma y divide entre ${n}`, nums.map(String));
    },
    () => {
      const nums = Array.from({ length: 5 }, () => rnd(5, 50));
      const mx = Math.max(...nums), mn = Math.min(...nums), c = mx - mn;
      return mc(`Rango de ${nums.join(", ")}`, String(c),
        numDistractors(c, [mx, mn, c + 1]),
        [`Máx=${mx}, Mín=${mn}`, `${mx} − ${mn} = ${c} ✓`], "Rango = máximo − mínimo",
        "máximo − mínimo", nums.map(String));
    },
    () => {
      const arr = Array.from({ length: 5 }, () => rnd(1, 30));
      const sorted = [...arr].sort((a, b) => a - b), c = sorted[2];
      return mc(`Mediana de ${arr.join(", ")}`, String(c),
        numDistractors(c, [sorted[0], sorted[4], c + 1]),
        [`Ordenado: ${sorted.join(", ")}`, `Valor central: ${c} ✓`],
        "Mediana = valor central (n impar)", "Ordena y toma el central", arr.map(String));
    },
  ],

  // ── Secundaria: Porcentajes ──
  porcentajes: [
    () => {
      const p = pick([10, 20, 25, 50]);
      const base = pick([20, 40, 60, 80, 100, 120, 160, 200]);
      const c = (base * p) / 100;
      return mc(`¿Cuánto es el ${p}% de ${base}?`, String(c),
        numDistractors(c, [base - c, base * p / 10, c + 5]),
        [`${p}% = ${p}/100`, `${base} × ${p / 100} = ${c} ✓`], "% de n = n × (%/100)",
        `${p}/100 de ${base}`, [String(p), String(base)]);
    },
    () => {
      const base = pick([40, 50, 80, 100, 200]);
      const p = pick([10, 20, 25, 50]);
      const disc = (base * p) / 100, c = base - disc;
      return mc(`Un artículo de $${base} tiene ${p}% de descuento. ¿Precio final?`, `$${c}`,
        [`$${base}`, `$${disc}`, `$${c - 5}`, `$${base + disc}`],
        [`Descuento: ${base} × ${p / 100} = ${disc}`, `${base} − ${disc} = ${c}`, `Precio final: $${c} ✓`],
        "Precio final = precio × (1 − %)", "Resta el descuento al precio", [String(base), String(p)], true);
    },
  ],

  // ── Secundaria: Razones y Proporciones ──
  razones: [
    () => {
      const unit = rnd(2, 9), q1 = rnd(2, 5), price = unit * q1, q2 = rnd(q1 + 1, 8), c = unit * q2;
      return mc(`Si ${q1} unidades cuestan $${price}, ¿cuánto cuestan ${q2} unidades?`, `$${c}`,
        [`$${price}`, `$${c + unit}`, `$${c - unit}`, `$${unit}`],
        [`1 unidad: ${price} ÷ ${q1} = ${unit}`, `${q2} × ${unit} = ${c}`, `= $${c} ✓`],
        "Regla de 3 directa: x = (b × c) / a", "Precio unitario × cantidad",
        [String(q1), String(price), String(q2)], true);
    },
    () => {
      const [n, dd] = pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [1, 2], [1, 3]]);
      const k = rnd(2, 6);
      return mc(`La razón de ${n * k} a ${dd * k} simplificada es:`, `${n}/${dd}`,
        [`${n * k}/${dd * k}`, `${dd}/${n}`, `${n}/${dd + 1}`, `${n + 1}/${dd}`],
        [`MCD(${n * k},${dd * k})=${k}`, `${n * k}÷${k}=${n}, ${dd * k}÷${k}=${dd}`, `${n}/${dd} ✓`],
        "Razón simplificada = dividir entre el MCD", "Divide ambos entre su MCD", [String(n * k), String(dd * k)]);
    },
  ],

  // ── Secundaria: Números y Potencias ──
  numeros: [
    () => {
      const base = rnd(2, 6), exp = rnd(2, 4), c = Math.pow(base, exp);
      return mc(`¿Cuánto es ${base}${sup(exp)}?`, String(c),
        numDistractors(c, [base * exp, c + base, c - base]),
        [`${Array(exp).fill(base).join("×")}`, `= ${c} ✓`], "aⁿ = a por sí mismo n veces",
        `Multiplica ${base} ${exp} veces`, [String(base)]);
    },
    () => {
      const r = rnd(2, 15), sq = r * r;
      return mc(`¿Cuánto es √${sq}?`, String(r),
        numDistractors(r, [sq, r + 1, r - 1]),
        [`${r} × ${r} = ${sq}`, `√${sq} = ${r} ✓`], "√(a²) = a (a ≥ 0)",
        `¿Qué número al cuadrado da ${sq}?`, [String(sq)]);
    },
    () => {
      const a = rnd(2, 12), b = rnd(2, 12);
      return mc(`¿Cuánto es (−${a}) + (−${b})?`, `−${a + b}`,
        [`${a + b}`, `−${a + b + 2}`, `−${a + b - 1}`, `${Math.abs(a - b)}`],
        [`Ambos negativos: ${a}+${b}=${a + b}`, `Signo negativo: −${a + b} ✓`],
        "(−a) + (−b) = −(a+b)", "Suma y conserva el signo negativo", [String(a), String(b)]);
    },
  ],

  // ── High School: Funciones ──
  funciones: [
    () => {
      const a = rnd(2, 5), b = rnd(1, 9), x = rnd(2, 6), c = a * x + b;
      return mc(`f(x)=${a}x+${b}. ¿Cuánto es f(${x})?`, String(c),
        numDistractors(c, [a + x + b, a * x, x + b]),
        [`f(${x}) = ${a}(${x}) + ${b}`, `= ${a * x} + ${b} = ${c} ✓`], "Evaluar: sustituir x por el valor",
        `Sustituye x=${x}`, [String(a), String(b), String(x)]);
    },
    () => {
      const m = rnd(2, 9), b = rnd(1, 9), sign = pick(["+", "−"]);
      return mc(`¿Cuál es la pendiente de y = ${m}x ${sign} ${b}?`, String(m),
        numDistractors(m, [b, m + b, m + 1]),
        [`Forma y = mx + b`, `m = ${m} ✓`], "Pendiente = coeficiente de x",
        "m es el número que multiplica a x", [String(m)]);
    },
    () => {
      const m = rnd(2, 6), b = rnd(2, 9), sign = pick([1, -1]), bb = b * sign;
      const eq = `y = ${m}x ${sign > 0 ? "+" : "−"} ${b}`;
      return mc(`¿Dónde corta ${eq} al eje Y?`, `(0,${fmtInt(bb)})`,
        [`(${fmtInt(bb)},0)`, `(0,${fmtInt(-bb)})`, `(0,${fmtInt(bb + 1)})`, `(${m},0)`],
        [`x=0: y = ${m}(0) ${sign > 0 ? "+" : "−"} ${b}`, `y = ${fmtInt(bb)}`, `Punto: (0,${fmtInt(bb)}) ✓`],
        "El intercepto en Y se obtiene con x=0", "Evalúa en x=0", [String(m), String(b)]);
    },
  ],

  // ── High School: Trigonometría ──
  trigono: [
    () => fromTuple(pick([
      ["sen(30°) =", "1/2", ["√3/2", "√2/2", "1"]],
      ["cos(60°) =", "1/2", ["√3/2", "√2/2", "1"]],
      ["sen(90°) =", "1", ["0", "1/2", "√2/2"]],
      ["cos(0°) =", "1", ["0", "1/2", "−1"]],
      ["tan(45°) =", "1", ["0", "√2/2", "√3"]],
      ["sen(0°) =", "0", ["1", "1/2", "√2/2"]],
      ["cos(90°) =", "0", ["1", "1/2", "√2/2"]],
      ["cos(30°) =", "√3/2", ["1/2", "√2/2", "1"]],
      ["sen(60°) =", "√3/2", ["1/2", "√2/2", "1"]],
      ["sen(45°) =", "√2/2", ["1/2", "√3/2", "1"]],
      ["cos(45°) =", "√2/2", ["1/2", "√3/2", "1"]],
      ["tan(0°) =", "0", ["1", "√3", "√2/2"]],
    ]) as [string, string, string[]], "Valores de ángulos especiales (0, 30, 45, 60, 90)", "Memoriza los ángulos especiales"),
    () => {
      const [o, a, h] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
      const c = trimNum(Math.round((o / h) * 100) / 100);
      return mc(`Cateto opuesto ${o}, hipotenusa ${h}. ¿Cuánto vale sen(θ)?`, c,
        [trimNum(Math.round((a / h) * 100) / 100), trimNum(Math.round((o / a) * 100) / 100), "1"],
        [`sen(θ) = opuesto / hipotenusa`, `= ${o}/${h} = ${c} ✓`], "sen(θ) = opuesto / hipotenusa",
        "opuesto / hipotenusa", [String(o), String(h)]);
    },
  ],

  // ── High School: Pre-Cálculo ──
  calculo: [
    () => {
      const n = rnd(2, 5);
      const deriv = (k: number) => { const p = k - 1; return p === 0 ? String(k) : p === 1 ? `${k}x` : `${k}x${sup(p)}`; };
      return mc(`Derivada de f(x)=x${sup(n)}`, deriv(n),
        [`${n}x${sup(n)}`, n - 1 === 1 ? `x` : `x${sup(n - 1)}`, deriv(n + 1)],
        [`d/dx(xⁿ) = n·xⁿ⁻¹`, `n=${n}: ${deriv(n)} ✓`], "d/dx(xⁿ) = n·xⁿ⁻¹",
        "Baja el exponente y réstale 1", []);
    },
    () => {
      const a = rnd(2, 9);
      return mc(`Derivada de f(x)=${a}x`, String(a),
        [`${a}x`, "0", "1", `${a}x²`],
        [`d/dx(ax) = a`, `= ${a} ✓`], "d/dx(ax) = a", "La derivada de una recta es su pendiente", []);
    },
    () => {
      const x0 = rnd(1, 8), b = rnd(1, 9), c = x0 + b;
      return mc(`lím(x→${x0}) (x + ${b})`, String(c),
        numDistractors(c, [x0, b, c + 1]),
        [`Sustituir x=${x0}`, `${x0} + ${b} = ${c} ✓`], "Límite de función continua = evaluar en el punto",
        `Sustituye x=${x0}`, [String(x0), String(b)]);
    },
  ],

  // ── High School: Probabilidad ──
  probabilidad: [
    () => {
      const tot = pick([4, 5, 6, 8, 10]);
      const fav = rnd(1, tot - 1), c = simplifyFrac(fav, tot);
      return mc(`En una bolsa hay ${fav} bolas rojas y ${tot - fav} azules. ¿Cuál es P(roja)?`, c,
        fracDistractors(fav, tot, c),
        [`Total = ${tot}`, `Favorables = ${fav}`, `P = ${fav}/${tot} = ${c} ✓`],
        "P = casos favorables / casos totales", "favorables / total", [String(fav), String(tot - fav)], true);
    },
    () => {
      const n = rnd(3, 5), c = fact(n);
      return mc(`¿Cuánto es ${n}! (factorial de ${n})?`, String(c),
        numDistractors(c, [n * n, fact(n - 1), c + 2]),
        [`${rangeDown(n).join("×")}`, `= ${c} ✓`], "n! = n × (n−1) × … × 1",
        `Multiplica de ${n} hasta 1`, [String(n)]);
    },
  ],

  // ── High School: Matrices y Sistemas ──
  matrices: [
    () => {
      const a = rnd(1, 6), b = rnd(0, 6), cc = rnd(0, 6), dd = rnd(1, 6), det = a * dd - b * cc;
      return mc(`Determinante de la matriz [[${a},${b}],[${cc},${dd}]]`, fmtInt(det),
        numDistractors(det, [a * dd + b * cc, a + dd, det + 1], true),
        [`det = (${a}×${dd}) − (${b}×${cc})`, `= ${a * dd} − ${b * cc} = ${fmtInt(det)} ✓`],
        "det([[a,b],[c,d]]) = ad − bc", "ad − bc", [String(a), String(b), String(cc), String(dd)]);
    },
    () => {
      const r = rnd(2, 4), col = rnd(2, 4), c = r * col;
      return mc(`¿Cuántos elementos tiene una matriz ${r}×${col}?`, String(c),
        numDistractors(c, [r + col, r, col]),
        [`${r} filas × ${col} columnas`, `= ${c} ✓`], "Elementos = filas × columnas",
        "filas × columnas", [String(r), String(col)]);
    },
    () => {
      const x = rnd(2, 9), y = rnd(1, x - 1), s = x + y, diff = x - y;
      return mc(`Sistema: x+y=${s}, x−y=${diff}. ¿Cuánto vale x?`, String(x),
        numDistractors(x, [y, s, diff]),
        [`Sumar ecuaciones: 2x = ${s + diff}`, `x = ${x} ✓`], "Eliminación: suma para cancelar una variable",
        "Suma las dos ecuaciones", [String(s), String(diff)]);
    },
  ],

  // ── High School: Geometría Analítica ──
  analitica: [
    () => {
      const [dx, dy, h] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]);
      const x1 = rnd(0, 3), y1 = rnd(0, 3), x2 = x1 + dx, y2 = y1 + dy;
      return mc(`Distancia entre los puntos (${x1},${y1}) y (${x2},${y2})`, String(h),
        numDistractors(h, [dx + dy, h + 1, h - 1]),
        [`Δx=${dx}, Δy=${dy}`, `d = √(${dx}² + ${dy}²) = √${dx * dx + dy * dy}`, `= ${h} ✓`],
        "Distancia = √(Δx² + Δy²)", "√(Δx² + Δy²)", [String(x1), String(y1), String(x2), String(y2)]);
    },
    () => {
      const x1 = rnd(0, 8), y1 = rnd(0, 8), x2 = x1 + rnd(1, 6) * 2, y2 = y1 + rnd(1, 6) * 2;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      return mc(`Punto medio entre (${x1},${y1}) y (${x2},${y2})`, `(${mx},${my})`,
        [`(${x1 + x2},${y1 + y2})`, `(${mx + 1},${my})`, `(${mx},${my + 1})`],
        [`xₘ = (${x1}+${x2})/2 = ${mx}`, `yₘ = (${y1}+${y2})/2 = ${my}`, `= (${mx},${my}) ✓`],
        "Punto medio = ((x₁+x₂)/2, (y₁+y₂)/2)", "Promedia cada coordenada",
        [String(x1), String(y1), String(x2), String(y2)]);
    },
    () => {
      const r = rnd(2, 12), sq = r * r;
      return mc(`Radio del círculo x²+y²=${sq}`, String(r),
        numDistractors(r, [sq, Math.round(sq / 2), r + 1]),
        [`r² = ${sq}`, `r = √${sq} = ${r} ✓`], "Círculo centrado en el origen: x²+y²=r²",
        `r = √${sq}`, [String(sq)]);
    },
  ],
};

/**
 * Genera `count` ejercicios DETERMINISTAS para un tema. Todos correctos por
 * construcción; se evitan enunciados duplicados y se garantizan 4 opciones
 * distintas con `ans` válido.
 */
export function generateExercises(topicId: string, difficulty: Difficulty, count: number): GenExercise[] {
  const gens = GENERATORS[topicId] ?? GENERATORS.suma;
  const out: GenExercise[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard < count * 40) {
    guard++;
    const ex = pick(gens)(difficulty);
    if (seen.has(ex.q)) continue;
    if (ex.opts.length !== 4 || new Set(ex.opts).size !== 4) continue;
    if (ex.ans < 0 || ex.ans > 3) continue;
    seen.add(ex.q);
    out.push(ex);
  }
  return out;
}
