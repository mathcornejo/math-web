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
  return mc(t[0], t[1], t[2],
    [`${stem} es un valor de ángulo especial que conviene tener memorizado.`, `Su valor exacto es ${t[1]}.`, `Por eso ${stem} = ${t[1]}.`],
    formula, hint, []);
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
        [`Sumar es juntar dos cantidades en una sola.`, `Junta ${a} y ${b}: ${a} + ${b} = ${c}.`, `Truco: suma primero las unidades y, si pasan de 9, lleva una decena.`], "Sumar = juntar cantidades (unidades con unidades, decenas con decenas)",
        `Suma ${a} y ${b}`, [String(a), String(b)]);
    },
    (d) => {
      const [lo, hi] = d === "facil" ? [10, 49] : d === "dificil" ? [100, 499] : [20, 99];
      const a = rnd(lo, hi), b = rnd(lo, a), c = a - b;
      return mc(`¿Cuánto es ${a} − ${b}?`, String(c),
        numDistractors(c, [c + 10, c - 10, c + 1]),
        [`Restar es quitar una cantidad a otra para ver cuánto queda.`, `A ${a} le quitamos ${b}: ${a} − ${b} = ${c}.`, `Para comprobar, suma al revés: ${b} + ${c} = ${a}.`], "Restar = quitar; se comprueba sumando el resultado al número que restaste",
        `Resta ${b} de ${a}`, [String(a), String(b)]);
    },
    (d) => {
      const [lo, hi] = d === "facil" ? [5, 30] : d === "dificil" ? [50, 300] : [15, 80];
      const a = rnd(lo, hi), b = rnd(lo, hi), c = a + b;
      const name = pick(NAMES), obj = pick(["manzanas", "galletas", "monedas", "peras", "flores", "fichas"]);
      return mc(`${name} tiene ${a} ${obj} y consigue ${b} más. ¿Cuántas tiene en total?`, String(c),
        numDistractors(c, [c - 1, c + 10, c + 1]),
        [`Hay una cantidad inicial (${a}) y se añaden ${b} más: eso es sumar.`, `${a} + ${b} = ${c}.`, `Cuando algo aumenta o se junta, sumamos.`], "Palabras como 'más' o 'en total' indican que hay que sumar",
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
        [`Multiplicar ${a} × ${b} es sumar ${a} repetido ${b} veces.`, `${a} × ${b} = ${c}.`, `Por eso multiplicar es un atajo para sumas repetidas.`], "Multiplicar = sumar el mismo número varias veces",
        `Tabla del ${a}`, [String(a), String(b)]);
    },
    (d) => {
      const [lo, hi] = d === "facil" ? [2, 9] : [2, 12];
      const b = rnd(lo, hi), c = rnd(2, 9), a = b * c;
      return mc(`¿Cuánto es ${a} ÷ ${b}?`, String(c),
        numDistractors(c, [c + 1, c - 1, c + 2]),
        [`Dividir ${a} ÷ ${b} es repartir ${a} en ${b} grupos iguales.`, `Busca el número que por ${b} da ${a}: ${b} × ${c} = ${a}.`, `Por eso ${a} ÷ ${b} = ${c}.`], "Dividir es lo contrario de multiplicar: a ÷ b = c porque b × c = a",
        `¿${b} por cuánto da ${a}?`, [String(a), String(b)]);
    },
    (d) => {
      const [lo, hi] = d === "facil" ? [2, 6] : [3, 9];
      const g = rnd(lo, hi), e = rnd(lo, hi), c = g * e;
      const obj = pick(["cajas", "bolsas", "cestas", "filas", "repisas"]);
      const it = pick(["galletas", "frutas", "peras", "flores", "fichas"]);
      return mc(`Hay ${g} ${obj} con ${e} ${it} cada una. ¿Cuántas ${it} hay en total?`, String(c),
        numDistractors(c, [g + e, c + e, c - e]),
        [`Son ${g} grupos iguales y cada uno tiene ${e}: por eso multiplicamos.`, `${g} × ${e} = ${c}.`, `Grupos iguales repetidos se resuelven multiplicando, no sumando uno a uno.`], "Grupos iguales: total = nº de grupos × elementos de cada grupo",
        `${g} × ${e}`, [String(g), String(e)], true);
    },
  ],

  // ── Primaria: Fracciones ──
  fracciones: [
    () => {
      const den = rnd(5, 10), a = rnd(1, den - 2), b = rnd(1, den - 1 - a), s = a + b;
      return mc(`¿Cuánto es ${a}/${den} + ${b}/${den}?`, `${s}/${den}`,
        [`${s}/${den + den}`, `${a}/${den}`, `${b}/${den}`, `${s + 1}/${den}`],
        [`El denominador (${den}) indica en cuántas partes se divide el entero; como es el mismo, no cambia.`, `Solo se suman los numeradores (las partes que tomamos): ${a} + ${b} = ${s}.`, `El resultado es ${s}/${den}.`],
        "Con igual denominador: suma los numeradores y mantén el denominador", "Suma solo los de arriba", [`${a}/${den}`, `${b}/${den}`]);
    },
    () => {
      const den = rnd(2, 6), k = rnd(2, 6), n = den * k, c = k;
      return mc(`¿Cuánto es 1/${den} de ${n}?`, String(c),
        numDistractors(c, [n, den, n - k]),
        [`1/${den} significa partir ${n} en ${den} partes iguales y quedarte con una.`, `Reparte: ${n} ÷ ${den} = ${c}.`, `Por eso 1/${den} de ${n} es ${c}.`],
        "Fracción de un número: divide entre el denominador (y multiplica por el numerador)", `Divide ${n} entre ${den}`, [String(n), String(den)]);
    },
    () => {
      const [num, den] = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5]]);
      const k = rnd(2, 5), a = num * k, b = den * k;
      return mc(`Simplifica ${a}/${b}`, `${num}/${den}`,
        [`${a}/${b}`, `${num}/${den + 1}`, `${num + 1}/${den}`, `${den}/${num}`],
        [`Simplificar es escribir la fracción con números más pequeños, pero que valga lo mismo.`, `Divide arriba y abajo por su máximo común divisor (${k}): ${a}÷${k}=${num} y ${b}÷${k}=${den}.`, `Queda ${num}/${den}, que representa la misma parte que ${a}/${b}.`],
        "Simplificar = dividir numerador y denominador por su MCD", `Divide ambos por ${k}`, [`${a}/${b}`]);
    },
  ],

  // ── Primaria: Números Decimales ──
  decimales: [
    () => {
      const a = rnd(10, 89) / 10, b = rnd(10, 89) / 10, c = Math.round((a + b) * 10) / 10;
      return mc(`¿Cuánto es ${a.toFixed(1)} + ${b.toFixed(1)}?`, c.toFixed(1),
        decDistractors(c), [`Alinea los puntos decimales: unidades con unidades y décimas con décimas.`, `${a.toFixed(1)} + ${b.toFixed(1)} = ${c.toFixed(1)}.`, `El punto del resultado va justo debajo de los demás.`],
        "Suma decimal: alinea el punto decimal y suma cada columna", "Alinea el punto y suma", [a.toFixed(1), b.toFixed(1)]);
    },
    () => {
      const a = rnd(30, 99) / 10, b = rnd(10, Math.round(a * 10) - 1) / 10, c = Math.round((a - b) * 10) / 10;
      return mc(`¿Cuánto es ${a.toFixed(1)} − ${b.toFixed(1)}?`, c.toFixed(1),
        decDistractors(c), [`Alinea los puntos decimales antes de restar.`, `${a.toFixed(1)} − ${b.toFixed(1)} = ${c.toFixed(1)}.`, `Resta columna por columna, igual que con números enteros.`],
        "Resta decimal: alinea el punto decimal y resta cada columna", "Alinea el punto y resta", [a.toFixed(1), b.toFixed(1)]);
    },
    () => {
      const a = rnd(1, 99) / 100, c = a * 10;
      return mc(`¿Cuánto es ${a.toFixed(2)} × 10?`, trimNum(c),
        [trimNum(a * 100), trimNum(a), trimNum(c + 1), trimNum(c + 0.5)],
        [`Multiplicar por 10 hace el número 10 veces más grande.`, `El truco: corre el punto decimal un lugar a la derecha → ${a.toFixed(2)} se convierte en ${trimNum(c)}.`, `Con ×100 lo correrías dos lugares.`],
        "×10 corre el punto 1 lugar a la derecha (×100 → dos lugares)", "Corre el punto a la derecha", [a.toFixed(2)]);
    },
  ],

  // ── Primaria: Geometría Básica ──
  geometria: [
    () => {
      const l = rnd(3, 20), c = 4 * l;
      return mc(`¿Cuál es el perímetro de un cuadrado de lado ${l} cm?`, `${c} cm`,
        unitDistractors(c, "cm", [c + l, l * l, c - l, 2 * l]),
        [`El perímetro es la distancia que rodea la figura (la suma de todos sus lados).`, `El cuadrado tiene 4 lados iguales de ${l} cm, así que 4 × ${l} = ${c}.`, `Su perímetro es ${c} cm.`], "Perímetro del cuadrado = 4 × lado",
        "Suma los 4 lados (o 4 × lado)", [String(l)]);
    },
    () => {
      const b = rnd(2, 20), h = rnd(2, 20), c = b * h;
      return mc(`Área de un rectángulo de base ${b} cm y altura ${h} cm`, `${c} cm²`,
        unitDistractors(c, "cm²", [b + h, 2 * (b + h), c + b, c - h]),
        [`El área es el espacio que la figura ocupa por dentro.`, `En un rectángulo se multiplica base por altura: ${b} × ${h} = ${c}.`, `El área es ${c} cm² (cm² porque medimos superficie).`], "Área del rectángulo = base × altura",
        "Multiplica base por altura", [String(b), String(h)]);
    },
    () => {
      const l = rnd(2, 15), c = l * l;
      return mc(`Área de un cuadrado de lado ${l} cm`, `${c} cm²`,
        unitDistractors(c, "cm²", [4 * l, 2 * l, c + l, c - 1]),
        [`El área mide la superficie interior de la figura.`, `Como en el cuadrado los lados son iguales, multiplicamos lado por lado: ${l} × ${l} = ${c}.`, `El área es ${c} cm².`], "Área del cuadrado = lado × lado (lado²)",
        "Multiplica el lado por sí mismo", [String(l)]);
    },
    () => {
      const b = rnd(2, 12) * 2, h = rnd(2, 12), c = (b * h) / 2;
      return mc(`Área de un triángulo de base ${b} cm y altura ${h} cm`, `${c} cm²`,
        unitDistractors(c, "cm²", [b * h, c + b, c - h, b + h]),
        [`Un triángulo es la mitad de un rectángulo con la misma base y altura.`, `Por eso multiplicamos base por altura y dividimos entre 2: (${b} × ${h}) / 2 = ${b * h} / 2.`, `El área es ${c} cm².`],
        "Área del triángulo = (base × altura) / 2 (la mitad del rectángulo)", "(base × altura) / 2", [String(b), String(h)]);
    },
  ],

  // ── Primaria: Medidas y Conversiones ──
  medidas: [
    () => {
      const m = rnd(2, 9), c = m * 100;
      return mc(`¿Cuántos centímetros hay en ${m} metros?`, `${c} cm`,
        [`${m * 10} cm`, `${m * 1000} cm`, `${m} cm`],
        [`El metro es mayor que el centímetro: en 1 metro caben 100 cm.`, `Como pasamos de una unidad mayor a una menor, multiplicamos: ${m} × 100 = ${c}.`, `Son ${c} cm.`], "De unidad mayor a menor se multiplica (m → cm es ×100)",
        "1 m = 100 cm", [String(m)]);
    },
    () => {
      const k = rnd(2, 9), c = k * 1000;
      return mc(`¿Cuántos gramos hay en ${k} kilogramos?`, `${c} g`,
        [`${k * 100} g`, `${k * 10} g`, `${k} g`],
        [`El kilogramo es mayor que el gramo: 1 kg son 1000 g.`, `Como pasamos de unidad mayor a menor, multiplicamos: ${k} × 1000 = ${c}.`, `Son ${c} g.`], "De unidad mayor a menor se multiplica (kg → g es ×1000)",
        "1 kg = 1000 g", [String(k)]);
    },
    () => {
      const L = rnd(2, 9), c = L * 1000;
      return mc(`¿Cuántos mililitros hay en ${L} litros?`, `${c} mL`,
        [`${L * 100} mL`, `${L * 10} mL`, `${L} mL`],
        [`El litro es mayor que el mililitro: 1 L son 1000 mL.`, `Como pasamos de unidad mayor a menor, multiplicamos: ${L} × 1000 = ${c}.`, `Son ${c} mL.`], "De unidad mayor a menor se multiplica (L → mL es ×1000)",
        "1 L = 1000 mL", [String(L)]);
    },
    () => {
      const h = rnd(2, 9), c = h * 60;
      return mc(`¿Cuántos minutos hay en ${h} horas?`, `${c} min`,
        [`${h * 30} min`, `${h * 100} min`, `${h * 6} min`],
        [`Una hora tiene 60 minutos.`, `Para pasar de horas a minutos multiplicamos por 60: ${h} × 60 = ${c}.`, `Son ${c} min.`], "Horas → minutos: multiplica por 60",
        "1 h = 60 min", [String(h)]);
    },
  ],

  // ── Secundaria: Álgebra ──
  algebra: [
    () => {
      const x = rnd(2, 12), a = rnd(2, 9), b = rnd(1, 20), c = a * x + b;
      return mc(`Si ${a}x + ${b} = ${c}, ¿cuánto vale x?`, `x=${x}`,
        [`x=${x + 1}`, `x=${x - 1}`, `x=${c - b}`, `x=${x + 2}`],
        [`Despejar x es dejarla sola, deshaciendo las operaciones en orden inverso.`, `Primero quitamos el +${b} restándolo en ambos lados: ${a}x = ${c} − ${b} = ${a * x}.`, `Luego quitamos el ×${a} dividiendo: x = ${a * x} ÷ ${a} = ${x}.`],
        "Despeja deshaciendo operaciones: primero la suma/resta, luego el ×/÷", `Resta ${b}, luego divide entre ${a}`,
        [String(a), String(b), String(c)]);
    },
    () => {
      const x = rnd(2, 15), a = rnd(2, 9), c = a * x;
      return mc(`Resuelve: ${a}x = ${c}`, `x=${x}`,
        [`x=${x + 1}`, `x=${x - 1}`, `x=${c}`, `x=${x + 3}`],
        [`x está multiplicada por ${a}; para dejarla sola hacemos lo contrario: dividir.`, `x = ${c} ÷ ${a} = ${x}.`, `Comprueba: ${a} × ${x} = ${c}.`], "Si ax = c, entonces x = c ÷ a",
        `Divide entre ${a}`, [String(a), String(c)]);
    },
    () => {
      const x = rnd(2, 9), b = rnd(1, 15), c = x + b;
      return mc(`Si x + ${b} = ${c}, ¿cuánto vale x?`, `x=${x}`,
        [`x=${x + 1}`, `x=${x - 1}`, `x=${c}`, `x=${c + b}`],
        [`A x se le suma ${b}; para aislarla hacemos lo contrario: restar ${b} en ambos lados.`, `x = ${c} − ${b} = ${x}.`, `Comprueba: ${x} + ${b} = ${c}.`], "Si x + b = c, entonces x = c − b",
        `Resta ${b}`, [String(b), String(c)]);
    },
  ],

  // ── Secundaria: Geometría Avanzada ──
  geometria2: [
    () => {
      const r = rnd(2, 12), c = Math.round(3.14 * r * r * 100) / 100;
      return mc(`Área de un círculo de radio ${r} cm (π≈3.14)`, `${trimNum(c)} cm²`,
        unitDistractorsDec(c, "cm²", [Math.round(2 * 3.14 * r * 100) / 100, Math.round(3.14 * r * 100) / 100, r * r]),
        [`El área de un círculo es π por el radio al cuadrado.`, `Primero el radio al cuadrado: ${r}² = ${r * r}. Luego por π: 3.14 × ${r * r}.`, `El área es ${trimNum(c)} cm².`],
        "Área del círculo = π × r²", "Eleva el radio al cuadrado y multiplica por π", [String(r)]);
    },
    () => {
      const a = rnd(2, 8), c = a * a * a;
      return mc(`Volumen de un cubo de arista ${a} cm`, `${c} cm³`,
        unitDistractors(c, "cm³", [a * a, 3 * a, c + a, a * a + a]),
        [`El volumen mide el espacio interior; en un cubo todas las aristas son iguales.`, `Multiplicamos la arista tres veces: ${a} × ${a} × ${a} = ${c}.`, `El volumen es ${c} cm³ (cm³ porque medimos espacio).`], "Volumen del cubo = arista³ (arista × arista × arista)", "Multiplica la arista tres veces", [String(a)]);
    },
    () => {
      const [x, y, h] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]]);
      return mc(`Catetos de un triángulo rectángulo: ${x} y ${y}. ¿Hipotenusa?`, String(h),
        numDistractors(h, [x + y, h + 1, h - 1]),
        [`En un triángulo rectángulo, la hipotenusa al cuadrado es la suma de los cuadrados de los catetos.`, `Suma los cuadrados: ${x}² + ${y}² = ${x * x} + ${y * y} = ${x * x + y * y}.`, `La hipotenusa es la raíz: √${x * x + y * y} = ${h}.`],
        "Teorema de Pitágoras: hipotenusa² = cateto² + cateto²", `Suma los catetos al cuadrado y saca la raíz`, [String(x), String(y)]);
    },
    () => {
      const b = rnd(2, 12) * 2, h = rnd(2, 12), c = (b * h) / 2;
      return mc(`Área de un triángulo de base ${b} cm y altura ${h} cm`, `${c} cm²`,
        unitDistractors(c, "cm²", [b * h, c + b, b + h, c - h]),
        [`El triángulo es la mitad de un rectángulo con la misma base y altura.`, `Multiplica base por altura y divide entre 2: (${b} × ${h}) / 2 = ${c}.`, `El área es ${c} cm².`], "Área del triángulo = (base × altura) / 2",
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
        [`La media (o promedio) reparte el total a partes iguales entre todos los datos.`, `Suma todos los valores: ${nums.join(" + ")} = ${sum}.`, `Divide entre cuántos hay (${n}): ${sum} ÷ ${n} = ${c}.`],
        "Media = suma de los datos ÷ cantidad de datos", `Suma todo y divide entre ${n}`, nums.map(String));
    },
    () => {
      const nums = Array.from({ length: 5 }, () => rnd(5, 50));
      const mx = Math.max(...nums), mn = Math.min(...nums), c = mx - mn;
      return mc(`Rango de ${nums.join(", ")}`, String(c),
        numDistractors(c, [mx, mn, c + 1]),
        [`El rango indica cuánto se separan los datos, del más grande al más pequeño.`, `Identifica el mayor (${mx}) y el menor (${mn}).`, `Réstalos: ${mx} − ${mn} = ${c}.`], "Rango = valor máximo − valor mínimo",
        "Resta el menor al mayor", nums.map(String));
    },
    () => {
      const arr = Array.from({ length: 5 }, () => rnd(1, 30));
      const sorted = [...arr].sort((a, b) => a - b), c = sorted[2];
      return mc(`Mediana de ${arr.join(", ")}`, String(c),
        numDistractors(c, [sorted[0], sorted[4], c + 1]),
        [`La mediana es el dato que queda justo en el centro cuando los ordenas.`, `Ordena de menor a mayor: ${sorted.join(", ")}.`, `El valor del medio es ${c}.`],
        "Mediana = valor central de los datos ordenados", "Ordénalos y toma el del centro", arr.map(String));
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
        [`Un porcentaje es una parte de cada 100; ${p}% significa ${p} de cada 100.`, `Conviértelo a decimal (${p} ÷ 100 = ${p / 100}) y multiplica: ${base} × ${p / 100} = ${c}.`, `El ${p}% de ${base} es ${c}.`], "Porcentaje de un número = número × (porcentaje ÷ 100)",
        `Convierte ${p}% a decimal y multiplica`, [String(p), String(base)]);
    },
    () => {
      const base = pick([40, 50, 80, 100, 200]);
      const p = pick([10, 20, 25, 50]);
      const disc = (base * p) / 100, c = base - disc;
      return mc(`Un artículo de $${base} tiene ${p}% de descuento. ¿Precio final?`, `$${c}`,
        [`$${base}`, `$${disc}`, `$${c - 5}`, `$${base + disc}`],
        [`Un descuento del ${p}% baja el precio en esa parte.`, `Calcula el descuento: ${base} × ${p / 100} = ${disc}.`, `Réstalo al precio: ${base} − ${disc} = ${c}, así que pagas $${c}.`],
        "Precio final = precio − (precio × % de descuento)", "Calcula el descuento y réstalo", [String(base), String(p)], true);
    },
  ],

  // ── Secundaria: Razones y Proporciones ──
  razones: [
    () => {
      const unit = rnd(2, 9), q1 = rnd(2, 5), price = unit * q1, q2 = rnd(q1 + 1, 8), c = unit * q2;
      return mc(`Si ${q1} unidades cuestan $${price}, ¿cuánto cuestan ${q2} unidades?`, `$${c}`,
        [`$${price}`, `$${c + unit}`, `$${c - unit}`, `$${unit}`],
        [`Si hay más unidades, cuestan más: es una proporción directa.`, `Primero halla el precio de 1: ${price} ÷ ${q1} = ${unit}.`, `Luego multiplica por ${q2}: ${q2} × ${unit} = ${c}, o sea $${c}.`],
        "Regla de 3 directa: halla el valor de 1 y multiplica", "Calcula el precio de una unidad",
        [String(q1), String(price), String(q2)], true);
    },
    () => {
      const [n, dd] = pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [1, 2], [1, 3]]);
      const k = rnd(2, 6);
      return mc(`La razón de ${n * k} a ${dd * k} simplificada es:`, `${n}/${dd}`,
        [`${n * k}/${dd * k}`, `${dd}/${n}`, `${n}/${dd + 1}`, `${n + 1}/${dd}`],
        [`Una razón compara dos cantidades; simplificarla las deja más pequeñas pero con el mismo valor.`, `Divide ambos términos por su máximo común divisor (${k}): ${n * k}÷${k}=${n} y ${dd * k}÷${k}=${dd}.`, `La razón es ${n}/${dd}.`],
        "Razón simplificada = dividir ambos términos por su MCD", "Divide ambos entre su MCD", [String(n * k), String(dd * k)]);
    },
  ],

  // ── Secundaria: Números y Potencias ──
  numeros: [
    () => {
      const base = rnd(2, 6), exp = rnd(2, 4), c = Math.pow(base, exp);
      return mc(`¿Cuánto es ${base}${sup(exp)}?`, String(c),
        numDistractors(c, [base * exp, c + base, c - base]),
        [`Una potencia indica multiplicar la base por sí misma tantas veces como diga el exponente.`, `${base}${sup(exp)} = ${Array(exp).fill(base).join(" × ")} = ${c}.`, `El exponente (${exp}) dice cuántas veces se repite el ${base}.`], "aⁿ = multiplicar 'a' por sí misma 'n' veces",
        `Multiplica ${base} por sí mismo ${exp} veces`, [String(base)]);
    },
    () => {
      const r = rnd(2, 15), sq = r * r;
      return mc(`¿Cuánto es √${sq}?`, String(r),
        numDistractors(r, [sq, r + 1, r - 1]),
        [`La raíz cuadrada busca el número que, multiplicado por sí mismo, da el de adentro.`, `Probamos: ${r} × ${r} = ${sq}.`, `Por eso √${sq} = ${r}.`], "Raíz cuadrada: √n es el número que elevado al cuadrado da n",
        `¿Qué número al cuadrado da ${sq}?`, [String(sq)]);
    },
    () => {
      const a = rnd(2, 12), b = rnd(2, 12);
      return mc(`¿Cuánto es (−${a}) + (−${b})?`, `−${a + b}`,
        [`${a + b}`, `−${a + b + 2}`, `−${a + b - 1}`, `${Math.abs(a - b)}`],
        [`Sumar dos negativos es como deber y deber más: la deuda total crece.`, `Suma sus valores: ${a} + ${b} = ${a + b}.`, `El resultado conserva el signo negativo: −${a + b}.`],
        "Negativo + negativo: suma los valores y conserva el signo −", "Suma los valores y deja el signo −", [String(a), String(b)]);
    },
  ],

  // ── High School: Funciones ──
  funciones: [
    () => {
      const a = rnd(2, 5), b = rnd(1, 9), x = rnd(2, 6), c = a * x + b;
      return mc(`f(x)=${a}x+${b}. ¿Cuánto es f(${x})?`, String(c),
        numDistractors(c, [a + x + b, a * x, x + b]),
        [`Evaluar una función es reemplazar la x por el valor dado y calcular.`, `Sustituye x = ${x}: f(${x}) = ${a}(${x}) + ${b}.`, `Opera respetando el orden: ${a * x} + ${b} = ${c}.`], "Evaluar f(x): sustituye la x por el número y resuelve",
        `Sustituye x = ${x}`, [String(a), String(b), String(x)]);
    },
    () => {
      const m = rnd(2, 9), b = rnd(1, 9), sign = pick(["+", "−"]);
      return mc(`¿Cuál es la pendiente de y = ${m}x ${sign} ${b}?`, String(m),
        numDistractors(m, [b, m + b, m + 1]),
        [`En la forma y = mx + b, la pendiente m indica cuánto sube la recta por cada paso a la derecha.`, `La pendiente es el número que acompaña a la x.`, `Aquí ese número es ${m}, así que la pendiente es ${m}.`], "En y = mx + b, la pendiente es el coeficiente de x",
        "m es el número que multiplica a x", [String(m)]);
    },
    () => {
      const m = rnd(2, 6), b = rnd(2, 9), sign = pick([1, -1]), bb = b * sign;
      const eq = `y = ${m}x ${sign > 0 ? "+" : "−"} ${b}`;
      return mc(`¿Dónde corta ${eq} al eje Y?`, `(0,${fmtInt(bb)})`,
        [`(${fmtInt(bb)},0)`, `(0,${fmtInt(-bb)})`, `(0,${fmtInt(bb + 1)})`, `(${m},0)`],
        [`Una recta cruza el eje Y justo donde x vale 0.`, `Sustituye x = 0: y = ${m}(0) ${sign > 0 ? "+" : "−"} ${b} = ${fmtInt(bb)}.`, `El corte es el punto (0, ${fmtInt(bb)}).`],
        "Corte con el eje Y: haz x = 0 y calcula y", "Evalúa la recta en x = 0", [String(m), String(b)]);
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
        [`El seno de un ángulo es el cateto opuesto dividido por la hipotenusa.`, `Aquí: ${o} ÷ ${h} = ${c}.`, `Entonces sen(θ) = ${c}.`], "sen(θ) = cateto opuesto ÷ hipotenusa",
        "Divide el cateto opuesto entre la hipotenusa", [String(o), String(h)]);
    },
  ],

  // ── High School: Pre-Cálculo ──
  calculo: [
    () => {
      const n = rnd(2, 5);
      const deriv = (k: number) => { const p = k - 1; return p === 0 ? String(k) : p === 1 ? `${k}x` : `${k}x${sup(p)}`; };
      return mc(`Derivada de f(x)=x${sup(n)}`, deriv(n),
        [`${n}x${sup(n)}`, n - 1 === 1 ? `x` : `x${sup(n - 1)}`, deriv(n + 1)],
        [`La derivada mide cómo cambia la función; para una potencia usamos la regla de la potencia.`, `Baja el exponente ${n} como factor y réstale 1 al exponente.`, `La derivada de x${sup(n)} es ${deriv(n)}.`], "Regla de la potencia: d/dx(xⁿ) = n·xⁿ⁻¹",
        "Baja el exponente y réstale 1", []);
    },
    () => {
      const a = rnd(2, 9);
      return mc(`Derivada de f(x)=${a}x`, String(a),
        [`${a}x`, "0", "1", `${a}x²`],
        [`La derivada de una recta es constante: es su pendiente (lo que multiplica a x).`, `En ${a}x, la pendiente es ${a}.`, `Por eso la derivada es ${a}.`], "d/dx(ax) = a (la pendiente de la recta)", "La derivada de una recta es su pendiente", []);
    },
    () => {
      const x0 = rnd(1, 8), b = rnd(1, 9), c = x0 + b;
      return mc(`lím(x→${x0}) (x + ${b})`, String(c),
        numDistractors(c, [x0, b, c + 1]),
        [`Si la función es continua, el límite es el valor al que se acerca: basta con sustituir.`, `Reemplaza x = ${x0}: ${x0} + ${b} = ${c}.`, `El límite es ${c}.`], "En funciones continuas, el límite se halla sustituyendo el valor",
        `Sustituye x = ${x0}`, [String(x0), String(b)]);
    },
  ],

  // ── High School: Probabilidad ──
  probabilidad: [
    () => {
      const tot = pick([4, 5, 6, 8, 10]);
      const fav = rnd(1, tot - 1), c = simplifyFrac(fav, tot);
      return mc(`En una bolsa hay ${fav} bolas rojas y ${tot - fav} azules. ¿Cuál es P(roja)?`, c,
        fracDistractors(fav, tot, c),
        [`La probabilidad compara los casos que nos sirven con todos los posibles.`, `Casos favorables (rojas): ${fav}. Casos totales: ${tot}.`, `P(roja) = ${fav}/${tot} = ${c}.`],
        "Probabilidad = casos favorables ÷ casos totales", "favorables ÷ total", [String(fav), String(tot - fav)], true);
    },
    () => {
      const n = rnd(3, 5), c = fact(n);
      return mc(`¿Cuánto es ${n}! (factorial de ${n})?`, String(c),
        numDistractors(c, [n * n, fact(n - 1), c + 2]),
        [`El factorial multiplica todos los enteros desde ${n} bajando hasta 1.`, `${rangeDown(n).join(" × ")} = ${c}.`, `Sirve para contar de cuántas formas se puede ordenar algo.`], "n! = n × (n−1) × … × 1",
        `Multiplica de ${n} hasta 1`, [String(n)]);
    },
  ],

  // ── High School: Matrices y Sistemas ──
  matrices: [
    () => {
      const a = rnd(1, 6), b = rnd(0, 6), cc = rnd(0, 6), dd = rnd(1, 6), det = a * dd - b * cc;
      return mc(`Determinante de la matriz [[${a},${b}],[${cc},${dd}]]`, fmtInt(det),
        numDistractors(det, [a * dd + b * cc, a + dd, det + 1], true),
        [`El determinante de una matriz 2×2 es la diagonal principal menos la otra diagonal.`, `Diagonal principal: ${a}×${dd} = ${a * dd}. Otra diagonal: ${b}×${cc} = ${b * cc}.`, `Réstalas: ${a * dd} − ${b * cc} = ${fmtInt(det)}.`],
        "det([[a,b],[c,d]]) = ad − bc (diagonal principal − secundaria)", "ad − bc", [String(a), String(b), String(cc), String(dd)]);
    },
    () => {
      const r = rnd(2, 4), col = rnd(2, 4), c = r * col;
      return mc(`¿Cuántos elementos tiene una matriz ${r}×${col}?`, String(c),
        numDistractors(c, [r + col, r, col]),
        [`Una matriz ${r}×${col} tiene ${r} filas y ${col} columnas; cada cruce de fila y columna es un elemento.`, `Multiplica filas por columnas: ${r} × ${col} = ${c}.`, `Tiene ${c} elementos.`], "Nº de elementos = filas × columnas",
        "filas × columnas", [String(r), String(col)]);
    },
    () => {
      const x = rnd(2, 9), y = rnd(1, x - 1), s = x + y, diff = x - y;
      return mc(`Sistema: x+y=${s}, x−y=${diff}. ¿Cuánto vale x?`, String(x),
        numDistractors(x, [y, s, diff]),
        [`Con el método de eliminación, sumamos las dos ecuaciones para que la y se cancele.`, `(x+y) + (x−y) = ${s} + ${diff}, queda 2x = ${s + diff}.`, `Despeja: x = ${s + diff} ÷ 2 = ${x}.`], "Eliminación: suma las ecuaciones para cancelar una variable",
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
        [`La distancia entre dos puntos se halla con el teorema de Pitágoras sobre sus diferencias.`, `Diferencias: Δx = ${dx}, Δy = ${dy}. Entonces d = √(${dx}² + ${dy}²) = √${dx * dx + dy * dy}.`, `La distancia es ${h}.`],
        "Distancia = √((x₂−x₁)² + (y₂−y₁)²)", "Pitágoras con Δx y Δy", [String(x1), String(y1), String(x2), String(y2)]);
    },
    () => {
      const x1 = rnd(0, 8), y1 = rnd(0, 8), x2 = x1 + rnd(1, 6) * 2, y2 = y1 + rnd(1, 6) * 2;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      return mc(`Punto medio entre (${x1},${y1}) y (${x2},${y2})`, `(${mx},${my})`,
        [`(${x1 + x2},${y1 + y2})`, `(${mx + 1},${my})`, `(${mx},${my + 1})`],
        [`El punto medio está justo a la mitad: se promedia cada coordenada por separado.`, `x del medio: (${x1}+${x2})/2 = ${mx}. y del medio: (${y1}+${y2})/2 = ${my}.`, `El punto medio es (${mx}, ${my}).`],
        "Punto medio = ((x₁+x₂)/2, (y₁+y₂)/2)", "Promedia cada coordenada",
        [String(x1), String(y1), String(x2), String(y2)]);
    },
    () => {
      const r = rnd(2, 12), sq = r * r;
      return mc(`Radio del círculo x²+y²=${sq}`, String(r),
        numDistractors(r, [sq, Math.round(sq / 2), r + 1]),
        [`En la ecuación x²+y²=r², el número de la derecha es el radio al cuadrado.`, `Aquí r² = ${sq}, así que r = √${sq}.`, `El radio es ${r}.`], "En x²+y²=r², el radio es la raíz del número de la derecha",
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
