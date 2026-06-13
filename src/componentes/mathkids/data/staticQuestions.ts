import type { Exercise } from "../types";

// ─── Static questions bank (compact) ──────────────────────────────────────────
const STATIC_Q: Record<string, Exercise[]> = {
  suma: [
    {
      q: "¿Cuánto es 47 + 38?",
      opts: ["75", "85", "95", "65"],
      ans: 1,
      hint: "Suma unidades: 7+8=15, lleva 1",
      explanation: {
        steps: [
          "Unidades: 7+8=15 → escribe 5, lleva 1",
          "Decenas: 4+3+1=8",
          "Resultado: 85 ✓",
        ],
        formula: "Suma columna por columna de derecha a izquierda",
      },
    },
    {
      q: "María tenía 63 manzanas y regaló 29. ¿Cuántas le quedan?",
      opts: ["34", "44", "24", "54"],
      ans: 0,
      hint: "63 − 29: pide prestado en las unidades",
      explanation: {
        steps: [
          "Unidades: 3−9 no se puede → pide prestado",
          "13−9=4",
          "Decenas: 6−1−2=3",
          "Resultado: 34 ✓",
        ],
        formula: "Cuando dígito arriba < abajo, pide 1 decena prestada",
      },
    },
    {
      q: "¿Cuánto es 125 + 347?",
      opts: ["462", "472", "482", "452"],
      ans: 1,
      hint: "Suma columna por columna",
      explanation: {
        steps: [
          "Unidades: 5+7=12→escribe 2, lleva 1",
          "Decenas: 2+4+1=7",
          "Centenas: 1+3=4",
          "Resultado: 472 ✓",
        ],
        formula: "Suma con acarreo de derecha a izquierda",
      },
    },
    {
      q: "¿Cuánto es 200 − 87?",
      opts: ["113", "123", "103", "133"],
      ans: 0,
      hint: "87 + ? = 200 (complemento)",
      explanation: {
        steps: ["87+13=100", "100+100=200", "13+100=113 ✓"],
        formula: "Complemento: 200−87=(200−100)+(100−87)",
      },
    },
    {
      q: "Un libro cuesta $45 y un cuaderno $23. ¿Total?",
      opts: ["$68", "$78", "$58", "$88"],
      ans: 0,
      hint: "Suma los dos precios",
      explanation: {
        steps: ["45+23", "Unidades: 5+3=8", "Decenas: 4+2=6", "Total: $68 ✓"],
        formula: "Precio total = precio A + precio B",
      },
    },
    {
      q: "¿Cuánto es 56 + 27?",
      opts: ["73", "83", "93", "81"],
      ans: 1,
      hint: "Suma unidades: 6+7=13, lleva 1",
      explanation: {
        steps: ["Unidades: 6+7=13 → escribe 3, lleva 1", "Decenas: 5+2+1=8", "Resultado: 83 ✓"],
        formula: "Suma con acarreo de derecha a izquierda",
      },
    },
    {
      q: "¿Cuánto es 90 − 45?",
      opts: ["35", "45", "55", "40"],
      ans: 1,
      hint: "Piensa: 45 + ? = 90",
      explanation: {
        steps: ["45 + 45 = 90", "Entonces 90 − 45 = 45 ✓"],
        formula: "Resta: a − b = c equivale a b + c = a",
      },
    },
    {
      q: "Pedro tiene 38 cromos y compra 26 más. ¿Cuántos tiene?",
      opts: ["64", "54", "74", "62"],
      ans: 0,
      hint: "Suma 38 + 26",
      explanation: {
        steps: ["Unidades: 8+6=14 → escribe 4, lleva 1", "Decenas: 3+2+1=6", "Resultado: 64 ✓"],
        formula: "Total = cantidad inicial + cantidad añadida",
      },
    },
    {
      q: "¿Cuánto es 150 + 250?",
      opts: ["350", "400", "450", "300"],
      ans: 1,
      hint: "Suma centenas y decenas por separado",
      explanation: {
        steps: ["100+200=300", "50+50=100", "300+100=400 ✓"],
        formula: "Descomponer en centenas y decenas facilita la suma",
      },
    },
    {
      q: "Una tienda tenía 80 panes y vendió 35. ¿Cuántos quedan?",
      opts: ["55", "45", "35", "50"],
      ans: 1,
      hint: "Resta 80 − 35",
      explanation: {
        steps: ["80 − 30 = 50", "50 − 5 = 45", "Quedan 45 ✓"],
        formula: "Quedan = inicial − vendidos",
      },
    },
  ],
  multi: [
    {
      q: "¿Cuánto es 7 × 8?",
      opts: ["54", "56", "58", "52"],
      ans: 1,
      hint: "7×7=49, más 7 = ?",
      explanation: {
        steps: ["7×8: puedes pensar 7×7=49", "49+7=56 ✓"],
        formula: "a×b = sumar 'a' exactamente 'b' veces",
      },
    },
    {
      q: "¿Cuánto es 9 × 9?",
      opts: ["72", "81", "90", "63"],
      ans: 1,
      hint: "9×10=90, menos 9",
      explanation: {
        steps: [
          "9×10=90",
          "90−9=81 ✓",
          "Verificación: 8+1=9 (truco tabla del 9)",
        ],
        formula: "n×9 = n×10 − n",
      },
    },
    {
      q: "¿Cuánto es 15 × 4?",
      opts: ["50", "55", "60", "65"],
      ans: 2,
      hint: "Descompón: 15=10+5",
      explanation: {
        steps: ["(10+5)×4", "10×4=40", "5×4=20", "40+20=60 ✓"],
        formula: "Propiedad distributiva: (a+b)×c = a×c + b×c",
      },
    },
    {
      q: "¿Cuánto es 12 × 5?",
      opts: ["55", "65", "60", "50"],
      ans: 2,
      hint: "×5 = ÷2 y ×10",
      explanation: {
        steps: ["12÷2=6", "6×10=60 ✓"],
        formula: "n×5 = (n÷2)×10",
      },
    },
    {
      q: "3 amigos compran 4 libretas cada uno. ¿Total?",
      opts: ["10", "11", "12", "13"],
      ans: 2,
      hint: "3 × 4",
      explanation: {
        steps: ["3 grupos × 4 unidades", "3×4=12 ✓"],
        formula: "Grupos × elementos = total",
      },
    },
    {
      q: "¿Cuánto es 6 × 7?",
      opts: ["42", "48", "36", "49"],
      ans: 0,
      hint: "Tabla del 6",
      explanation: {
        steps: ["6×7 = 6+6+6+6+6+6+6", "= 42 ✓"],
        formula: "Tabla del 6: 6, 12, 18, 24, 30, 36, 42",
      },
    },
    {
      q: "¿Cuánto es 8 × 4?",
      opts: ["24", "32", "36", "28"],
      ans: 1,
      hint: "8×4 = doble de 8×2",
      explanation: {
        steps: ["8×2=16", "16×2=32 ✓"],
        formula: "a×4 = (a×2)×2",
      },
    },
    {
      q: "¿Cuánto es 56 ÷ 7?",
      opts: ["6", "7", "8", "9"],
      ans: 2,
      hint: "¿7 por cuánto da 56?",
      explanation: {
        steps: ["7 × 8 = 56", "Entonces 56 ÷ 7 = 8 ✓"],
        formula: "División: a ÷ b = c equivale a b × c = a",
      },
    },
    {
      q: "¿Cuánto es 9 × 6?",
      opts: ["54", "56", "45", "63"],
      ans: 0,
      hint: "9×6 = 10×6 − 6",
      explanation: {
        steps: ["10×6=60", "60−6=54 ✓"],
        formula: "n×9 = n×10 − n",
      },
    },
    {
      q: "Hay 5 cajas con 6 lápices cada una. ¿Cuántos lápices hay?",
      opts: ["11", "30", "35", "25"],
      ans: 1,
      hint: "5 grupos de 6",
      explanation: {
        steps: ["5 cajas × 6 lápices", "5×6=30 ✓"],
        formula: "Total = cajas × elementos por caja",
      },
    },
  ],
  fracciones: [
    {
      q: "¿Qué fracción son 3 porciones de una pizza en 8?",
      opts: ["3/5", "3/8", "5/8", "8/3"],
      ans: 1,
      hint: "Partes tomadas / partes totales",
      explanation: {
        steps: ["Pizza dividida en 8", "Tomamos 3", "Fracción = 3/8 ✓"],
        formula: "Fracción = numerador/denominador",
      },
    },
    {
      q: "¿Cuánto es 1/2 + 1/4?",
      opts: ["2/6", "3/4", "2/4", "1/3"],
      ans: 1,
      hint: "Convierte 1/2 = 2/4",
      explanation: {
        steps: ["1/2=2/4", "2/4+1/4=3/4 ✓"],
        formula: "Para sumar: busca denominador común",
      },
    },
    {
      q: "¿Cuánto es 3/4 de 20?",
      opts: ["12", "15", "10", "18"],
      ans: 1,
      hint: "20÷4×3",
      explanation: {
        steps: ["20÷4=5 (una parte)", "5×3=15 (tres partes) ✓"],
        formula: "Fracción de número = (n÷denominador)×numerador",
      },
    },
    {
      q: "Simplifica 6/9",
      opts: ["3/4", "2/3", "1/2", "4/6"],
      ans: 1,
      hint: "MCD(6,9)=3",
      explanation: {
        steps: ["MCD(6,9)=3", "6÷3=2, 9÷3=3", "2/3 ✓"],
        formula: "Simplificar = dividir entre MCD",
      },
    },
    {
      q: "¿Cuál es mayor: 2/3 o 3/4?",
      opts: ["2/3", "3/4", "Iguales", "No se puede"],
      ans: 1,
      hint: "Convierte a /12",
      explanation: {
        steps: ["2/3=8/12", "3/4=9/12", "9/12>8/12 → 3/4 ✓"],
        formula: "Para comparar: denominador común",
      },
    },
    {
      q: "¿Cuánto es 2/5 + 1/5?",
      opts: ["3/10", "3/5", "2/5", "1/5"],
      ans: 1,
      hint: "Mismo denominador: suma los numeradores",
      explanation: {
        steps: ["Denominador común: 5", "2+1=3", "Resultado: 3/5 ✓"],
        formula: "a/c + b/c = (a+b)/c",
      },
    },
    {
      q: "Simplifica 4/8",
      opts: ["1/2", "2/4", "1/4", "2/3"],
      ans: 0,
      hint: "MCD(4,8)=4",
      explanation: {
        steps: ["MCD(4,8)=4", "4÷4=1, 8÷4=2", "1/2 ✓"],
        formula: "Simplificar = dividir entre el MCD",
      },
    },
    {
      q: "¿Cuánto es 1/3 de 12?",
      opts: ["3", "4", "6", "2"],
      ans: 1,
      hint: "12 ÷ 3",
      explanation: {
        steps: ["12 ÷ 3 = 4", "Una tercera parte de 12 es 4 ✓"],
        formula: "Fracción de número = (n÷denominador)×numerador",
      },
    },
    {
      q: "¿Cuál es mayor: 1/2 o 1/3?",
      opts: ["1/3", "1/2", "Iguales", "Ninguna"],
      ans: 1,
      hint: "Convierte a sextos",
      explanation: {
        steps: ["1/2 = 3/6", "1/3 = 2/6", "3/6 > 2/6 → 1/2 ✓"],
        formula: "Con numerador igual, mayor fracción = menor denominador",
      },
    },
    {
      q: "¿Cuánto es 5/7 − 2/7?",
      opts: ["3/7", "7/7", "3/14", "1/7"],
      ans: 0,
      hint: "Mismo denominador: resta los numeradores",
      explanation: {
        steps: ["Denominador común: 7", "5−2=3", "Resultado: 3/7 ✓"],
        formula: "a/c − b/c = (a−b)/c",
      },
    },
  ],
  algebra: [
    {
      q: "Si 3x + 7 = 22, ¿cuánto vale x?",
      opts: ["3", "5", "4", "6"],
      ans: 1,
      hint: "Resta 7, luego divide entre 3",
      explanation: {
        steps: ["3x=22−7=15", "x=15÷3=5 ✓", "Verificación: 3(5)+7=22"],
        formula: "Despejar: deshacer operaciones en orden inverso",
      },
    },
    {
      q: "Resuelve: 2x − 5 = x + 3",
      opts: ["x=6", "x=7", "x=8", "x=9"],
      ans: 2,
      hint: "Lleva x al mismo lado",
      explanation: {
        steps: ["2x−x=3+5", "x=8 ✓", "Verificación: 16−5=11=8+3"],
        formula: "Transponer: al cruzar el igual, cambia signo",
      },
    },
    {
      q: "Factoriza: x² − 9",
      opts: ["(x−3)(x+3)", "(x−9)(x+1)", "(x−3)²", "(x+9)(x−1)"],
      ans: 0,
      hint: "Diferencia de cuadrados",
      explanation: {
        steps: ["x²−9=x²−3²", "a²−b²=(a−b)(a+b)", "(x−3)(x+3) ✓"],
        formula: "Diferencia de cuadrados: a²−b²=(a−b)(a+b)",
      },
    },
    {
      q: "Simplifica: 3x + 2y − x + 4y",
      opts: ["2x+6y", "4x+6y", "2x+2y", "4x+2y"],
      ans: 0,
      hint: "Agrupa términos semejantes",
      explanation: {
        steps: ["x: 3x−x=2x", "y: 2y+4y=6y", "2x+6y ✓"],
        formula: "Solo se suman términos con la misma variable y exponente",
      },
    },
    {
      q: "¿Cuánto es 2(x+3) cuando x=4?",
      opts: ["11", "14", "10", "8"],
      ans: 1,
      hint: "Paréntesis primero",
      explanation: {
        steps: ["2(4+3)", "2×7=14 ✓"],
        formula: "PEMDAS: Paréntesis antes de multiplicación",
      },
    },
    {
      q: "Si x + 9 = 15, ¿cuánto vale x?",
      opts: ["5", "6", "7", "24"],
      ans: 1,
      hint: "Resta 9 en ambos lados",
      explanation: {
        steps: ["x = 15 − 9", "x = 6 ✓", "Verificación: 6+9=15"],
        formula: "Despejar: pasa el término al otro lado restando",
      },
    },
    {
      q: "Resuelve: 4x = 28",
      opts: ["6", "7", "8", "24"],
      ans: 1,
      hint: "Divide entre 4",
      explanation: {
        steps: ["x = 28 ÷ 4", "x = 7 ✓", "Verificación: 4×7=28"],
        formula: "Despejar: divide entre el coeficiente",
      },
    },
    {
      q: "Si 2x + 3 = 11, ¿cuánto vale x?",
      opts: ["3", "4", "5", "7"],
      ans: 1,
      hint: "Resta 3, luego divide entre 2",
      explanation: {
        steps: ["2x = 11 − 3 = 8", "x = 8 ÷ 2 = 4 ✓", "Verificación: 2×4+3=11"],
        formula: "Deshacer operaciones en orden inverso",
      },
    },
    {
      q: "Simplifica: 5a + 3a − 2a",
      opts: ["6a", "10a", "8a", "4a"],
      ans: 0,
      hint: "Opera los coeficientes",
      explanation: {
        steps: ["5 + 3 − 2 = 6", "Resultado: 6a ✓"],
        formula: "Términos semejantes: se operan los coeficientes",
      },
    },
    {
      q: "¿Cuánto vale 3(x − 2) cuando x = 5?",
      opts: ["6", "9", "15", "3"],
      ans: 1,
      hint: "Resuelve el paréntesis primero",
      explanation: {
        steps: ["3(5 − 2)", "3 × 3 = 9 ✓"],
        formula: "PEMDAS: paréntesis antes de multiplicar",
      },
    },
  ],
  geometria: [
    {
      q: "Área de triángulo: base=8, altura=5",
      opts: ["20", "40", "13", "16"],
      ans: 0,
      hint: "A = (base×altura)/2",
      explanation: {
        steps: ["A=(8×5)/2", "=40/2=20 cm² ✓"],
        formula: "Área triángulo = (base × altura) / 2",
      },
    },
    {
      q: "Catetos 3 y 4. ¿Hipotenusa?",
      opts: ["6", "7", "5", "8"],
      ans: 2,
      hint: "a²+b²=c²",
      explanation: {
        steps: ["c²=3²+4²=9+16=25", "c=√25=5 ✓", "Triángulo 3-4-5"],
        formula: "Teorema de Pitágoras: c² = a² + b²",
      },
    },
    {
      q: "Área del círculo radio=7 (π≈3.14)",
      opts: ["43.96", "153.86", "21.98", "87.92"],
      ans: 1,
      hint: "A = π × r²",
      explanation: {
        steps: ["A=3.14×7²", "=3.14×49", "=153.86 cm² ✓"],
        formula: "Área círculo = π × r²",
      },
    },
    {
      q: "¿Cuánto suman los ángulos de un triángulo?",
      opts: ["90°", "270°", "360°", "180°"],
      ans: 3,
      hint: "Propiedad fundamental",
      explanation: {
        steps: [
          "Todo triángulo: suma ángulos interiores",
          "60+60+60=180° (equilátero)",
          "Siempre 180° ✓",
        ],
        formula: "α + β + γ = 180°",
      },
    },
    {
      q: "Volumen cubo arista=4",
      opts: ["16", "48", "64", "32"],
      ans: 2,
      hint: "V = arista³",
      explanation: {
        steps: ["V=4³", "=4×4×4=64 cm³ ✓"],
        formula: "Volumen cubo = a³",
      },
    },
    {
      q: "¿Cuál es el perímetro de un cuadrado de lado 6 cm?",
      opts: ["24", "36", "12", "18"],
      ans: 0,
      hint: "El cuadrado tiene 4 lados iguales",
      explanation: {
        steps: ["P = 4 × lado", "P = 4 × 6", "= 24 cm ✓"],
        formula: "Perímetro del cuadrado = 4 × lado",
      },
    },
    {
      q: "Área de un rectángulo de base 7 cm y altura 3 cm",
      opts: ["10", "21", "20", "24"],
      ans: 1,
      hint: "A = base × altura",
      explanation: {
        steps: ["A = 7 × 3", "= 21 cm² ✓"],
        formula: "Área rectángulo = base × altura",
      },
    },
    {
      q: "¿Cuántos lados tiene un pentágono?",
      opts: ["4", "5", "6", "7"],
      ans: 1,
      hint: "El prefijo 'penta' significa cinco",
      explanation: {
        steps: ["'Penta' = cinco", "Un pentágono tiene 5 lados ✓"],
        formula: "Pentágono = polígono de 5 lados",
      },
    },
    {
      q: "Perímetro de un triángulo equilátero de lado 5 cm",
      opts: ["10", "15", "20", "25"],
      ans: 1,
      hint: "3 lados iguales",
      explanation: {
        steps: ["Equilátero: 3 lados iguales", "P = 3 × 5", "= 15 cm ✓"],
        formula: "Perímetro = 3 × lado (triángulo equilátero)",
      },
    },
    {
      q: "Área de un cuadrado de lado 9 cm",
      opts: ["18", "36", "72", "81"],
      ans: 3,
      hint: "A = lado × lado",
      explanation: {
        steps: ["A = lado²", "A = 9 × 9", "= 81 cm² ✓"],
        formula: "Área del cuadrado = lado²",
      },
    },
  ],
  estadistica: [
    {
      q: "Notas: 7,8,6,9,5. ¿Media?",
      opts: ["6.5", "7", "7.5", "8"],
      ans: 1,
      hint: "Suma todos y divide entre 5",
      explanation: {
        steps: ["7+8+6+9+5=35", "35÷5=7 ✓"],
        formula: "Media = Σx / n",
      },
    },
    {
      q: "Conjunto {3,7,7,9,2,7}. ¿Moda?",
      opts: ["9", "3", "7", "2"],
      ans: 2,
      hint: "El que más se repite",
      explanation: {
        steps: ["7 aparece 3 veces", "Es la moda ✓"],
        formula: "Moda = valor con mayor frecuencia",
      },
    },
    {
      q: "Ordena 4,1,7,3,9. ¿Mediana?",
      opts: ["3", "4", "7", "5"],
      ans: 1,
      hint: "Ordena y encuentra el central",
      explanation: {
        steps: ["1,3,4,7,9", "5 valores, el 3° es 4", "Mediana=4 ✓"],
        formula: "Mediana: valor central del conjunto ordenado",
      },
    },
    {
      q: "Rango de: 15,22,8,30,12",
      opts: ["14", "22", "15", "30"],
      ans: 1,
      hint: "Máximo − Mínimo",
      explanation: {
        steps: ["Máx=30, Mín=8", "30−8=22 ✓"],
        formula: "Rango = máximo − mínimo",
      },
    },
    {
      q: "5 libros: $12,$15,$10,$18,$20. Precio promedio",
      opts: ["$14", "$15", "$16", "$17"],
      ans: 1,
      hint: "Suma y divide entre 5",
      explanation: {
        steps: ["12+15+10+18+20=75", "75÷5=15 ✓"],
        formula: "Promedio = suma / cantidad",
      },
    },
    {
      q: "¿Cuál es la media de 4, 8 y 12?",
      opts: ["6", "8", "10", "12"],
      ans: 1,
      hint: "Suma y divide entre 3",
      explanation: {
        steps: ["4+8+12=24", "24÷3=8 ✓"],
        formula: "Media = Σx / n",
      },
    },
    {
      q: "Moda del conjunto {2, 4, 4, 4, 7, 9}",
      opts: ["2", "4", "7", "9"],
      ans: 1,
      hint: "El valor que más se repite",
      explanation: {
        steps: ["4 aparece 3 veces", "Es el más frecuente", "Moda = 4 ✓"],
        formula: "Moda = valor con mayor frecuencia",
      },
    },
    {
      q: "Mediana de 3, 5, 7, 9",
      opts: ["5", "6", "7", "8"],
      ans: 1,
      hint: "Con cantidad par, promedia los dos centrales",
      explanation: {
        steps: ["Ordenados: 3,5,7,9", "Centrales: 5 y 7", "(5+7)/2=6 ✓"],
        formula: "Mediana (n par) = promedio de los dos centrales",
      },
    },
    {
      q: "Rango de 10, 25, 15, 40",
      opts: ["25", "30", "40", "15"],
      ans: 1,
      hint: "Máximo − mínimo",
      explanation: {
        steps: ["Máx=40, Mín=10", "40−10=30 ✓"],
        formula: "Rango = máximo − mínimo",
      },
    },
    {
      q: "Media de 20, 30, 40, 50 y 60",
      opts: ["35", "40", "45", "50"],
      ans: 1,
      hint: "Suma y divide entre 5",
      explanation: {
        steps: ["20+30+40+50+60=200", "200÷5=40 ✓"],
        formula: "Media = Σx / n",
      },
    },
  ],
  funciones: [
    {
      q: "f(x)=3x²−2. ¿f(2)?",
      opts: ["8", "10", "14", "6"],
      ans: 1,
      hint: "Sustituye x=2",
      explanation: {
        steps: ["f(2)=3(2)²−2", "=3×4−2=12−2=10 ✓"],
        formula: "Evaluar: sustituir x por el valor dado",
      },
    },
    {
      q: "Dominio de f(x)=√x",
      opts: ["Todos los reales", "x>0", "x≥0", "x≠0"],
      ans: 2,
      hint: "√x no existe para x negativo",
      explanation: {
        steps: ["√0=0 ✓ (definida)", "√(-1): no real ✗", "Dominio: x≥0 ✓"],
        formula: "Dominio = valores de x donde f(x) está definida",
      },
    },
    {
      q: "¿Dónde corta y=2x+5 al eje Y?",
      opts: ["(2,0)", "(0,5)", "(5,0)", "(0,2)"],
      ans: 1,
      hint: "x=0 en el eje Y",
      explanation: {
        steps: ["x=0: y=2(0)+5=5", "Punto: (0,5) ✓"],
        formula: "En y=mx+b, el intercepto en Y es 'b'",
      },
    },
    {
      q: "Pendiente por (1,3) y (3,7)",
      opts: ["1", "2", "3", "4"],
      ans: 1,
      hint: "m=(y₂−y₁)/(x₂−x₁)",
      explanation: {
        steps: ["m=(7−3)/(3−1)", "=4/2=2 ✓"],
        formula: "Pendiente = Δy/Δx",
      },
    },
    {
      q: "g(x)=x², h(x)=x+1. (g∘h)(2)=?",
      opts: ["5", "9", "7", "4"],
      ans: 1,
      hint: "Primero h(2), luego g de ese resultado",
      explanation: {
        steps: ["h(2)=3", "g(3)=9 ✓"],
        formula: "(f∘g)(x) = f(g(x))",
      },
    },
    {
      q: "f(x)=2x+1. ¿Cuánto es f(3)?",
      opts: ["6", "7", "8", "5"],
      ans: 1,
      hint: "Sustituye x=3",
      explanation: {
        steps: ["f(3)=2(3)+1", "=6+1=7 ✓"],
        formula: "Evaluar: sustituir x por el valor dado",
      },
    },
    {
      q: "f(x)=x²+1. ¿Cuánto es f(0)?",
      opts: ["0", "1", "2", "−1"],
      ans: 1,
      hint: "Sustituye x=0",
      explanation: {
        steps: ["f(0)=0²+1", "=0+1=1 ✓"],
        formula: "Evaluar: sustituir x por el valor dado",
      },
    },
    {
      q: "¿Cuál es la pendiente de y = 4x − 2?",
      opts: ["−2", "4", "2", "−4"],
      ans: 1,
      hint: "En y=mx+b, m es la pendiente",
      explanation: {
        steps: ["Forma y=mx+b", "m=4 ✓"],
        formula: "Pendiente = coeficiente de x",
      },
    },
    {
      q: "Para f(x)=x²−4, ¿qué valor positivo de x hace f(x)=0?",
      opts: ["1", "2", "4", "3"],
      ans: 1,
      hint: "x²=4",
      explanation: {
        steps: ["x²−4=0", "x²=4", "x=2 (valor positivo) ✓"],
        formula: "Resolver f(x)=0: igualar a cero y despejar",
      },
    },
    {
      q: "¿Dónde corta y = −3x + 7 al eje Y?",
      opts: ["−3", "7", "0", "3"],
      ans: 1,
      hint: "El intercepto en Y es b (cuando x=0)",
      explanation: {
        steps: ["x=0: y=−3(0)+7", "y=7 ✓"],
        formula: "En y=mx+b, el intercepto en Y es b",
      },
    },
  ],
  trigono: [
    {
      q: "sen(30°) =",
      opts: ["√3/2", "1/2", "√2/2", "1"],
      ans: 1,
      hint: "Ángulos especiales: memoriza 30°,45°,60°",
      explanation: {
        steps: [
          "sen(30°)=1/2 (valor exacto)",
          "Triángulo 30-60-90: hipotenusa=2, opuesto=1",
          "1/2 ✓",
        ],
        formula: "Triángulo 30-60-90: lados 1:√3:2",
      },
    },
    {
      q: "cos(60°) =",
      opts: ["1/2", "√3/2", "√2/2", "0"],
      ans: 0,
      hint: "cos(60°)=sen(30°)",
      explanation: {
        steps: ["cos(60°)=1/2 ✓", "Identidad: cos(θ)=sen(90°−θ)"],
        formula: "sen(θ)=cos(90°−θ)",
      },
    },
    {
      q: "sen(θ)=0.6, cos(θ)=0.8. tan(θ)=?",
      opts: ["0.8", "0.75", "1.33", "0.48"],
      ans: 1,
      hint: "tan=sen/cos",
      explanation: {
        steps: ["tan=0.6/0.8=0.75 ✓", "Triángulo 3-4-5: tan=3/4"],
        formula: "tan(θ) = sen(θ)/cos(θ)",
      },
    },
    {
      q: "sen²(θ) + cos²(θ) =",
      opts: ["0", "2", "1", "tan²"],
      ans: 2,
      hint: "Identidad pitagórica fundamental",
      explanation: {
        steps: [
          "Viene del Teorema de Pitágoras",
          "a²/c²+b²/c²=1",
          "sen²+cos²=1 ✓",
        ],
        formula: "sen²(θ) + cos²(θ) = 1 (siempre)",
      },
    },
    {
      q: "Período de y=sen(x)",
      opts: ["π", "2π", "π/2", "4π"],
      ans: 1,
      hint: "Un ciclo completo de la función seno",
      explanation: {
        steps: ["Seno: sube, baja, vuelve en 2π", "Período=2π≈6.28 ✓"],
        formula: "y=A·sen(Bx+C) → período = 2π/|B|",
      },
    },
    {
      q: "tan(45°) =",
      opts: ["0", "1", "√2/2", "√3"],
      ans: 1,
      hint: "En 45°, seno y coseno son iguales",
      explanation: {
        steps: ["tan(45°)=sen(45°)/cos(45°)", "Valores iguales → cociente = 1 ✓"],
        formula: "tan(45°) = 1",
      },
    },
    {
      q: "cos(0°) =",
      opts: ["0", "1", "1/2", "−1"],
      ans: 1,
      hint: "Valor del coseno al inicio",
      explanation: {
        steps: ["En 0° el coseno es máximo", "cos(0°)=1 ✓"],
        formula: "cos(0°) = 1",
      },
    },
    {
      q: "sen(90°) =",
      opts: ["0", "1/2", "1", "√2/2"],
      ans: 2,
      hint: "Valor máximo del seno",
      explanation: {
        steps: ["El seno alcanza su máximo en 90°", "sen(90°)=1 ✓"],
        formula: "sen(90°) = 1",
      },
    },
    {
      q: "cos(30°) =",
      opts: ["1/2", "√3/2", "√2/2", "1"],
      ans: 1,
      hint: "Ángulo especial 30°",
      explanation: {
        steps: ["Triángulo 30-60-90", "cos(30°)=√3/2 ✓"],
        formula: "cos(30°) = √3/2",
      },
    },
    {
      q: "Cateto opuesto 3, hipotenusa 5. ¿Cuánto vale sen(θ)?",
      opts: ["0.6", "0.8", "0.75", "1.33"],
      ans: 0,
      hint: "sen = opuesto / hipotenusa",
      explanation: {
        steps: ["sen(θ)=opuesto/hipotenusa", "=3/5=0.6 ✓"],
        formula: "sen(θ) = cateto opuesto / hipotenusa",
      },
    },
  ],
  calculo: [
    {
      q: "lím(x→1) (x²−1)/(x−1)",
      opts: ["1", "0", "2", "∞"],
      ans: 2,
      hint: "Factoriza el numerador",
      explanation: {
        steps: [
          "0/0 → factorizar",
          "x²−1=(x−1)(x+1)",
          "Cancela (x−1): x+1",
          "lím→1: 1+1=2 ✓",
        ],
        formula: "Si 0/0: factoriza y cancela el factor común",
      },
    },
    {
      q: "Derivada de f(x)=x³",
      opts: ["x²", "3x", "3x²", "x³/3"],
      ans: 2,
      hint: "Regla de la potencia",
      explanation: {
        steps: ["d/dx(xⁿ)=n·xⁿ⁻¹", "n=3: 3x² ✓"],
        formula: "d/dx(xⁿ) = n·xⁿ⁻¹",
      },
    },
    {
      q: "lím(x→∞) 1/x",
      opts: ["1", "∞", "0", "−1"],
      ans: 2,
      hint: "¿Qué pasa a 1/x cuando x crece?",
      explanation: {
        steps: ["x=100: 1/100=0.01", "x=∞: 1/∞→0 ✓"],
        formula: "lím(x→∞) k/xⁿ = 0 (para n>0)",
      },
    },
    {
      q: "Derivada de f(x)=5x²+3x−2",
      opts: ["5x+3", "10x+3", "10x−2", "5x+3x"],
      ans: 1,
      hint: "Deriva término por término",
      explanation: {
        steps: ["5x²→10x", "3x→3", "−2→0", "f'(x)=10x+3 ✓"],
        formula: "d/dx(axⁿ)=a·n·xⁿ⁻¹ | d/dx(c)=0",
      },
    },
    {
      q: "Si f'(x)>0, la función es:",
      opts: ["Decreciente", "Constante", "Creciente", "Negativa"],
      ans: 2,
      hint: "Pendiente positiva = ?",
      explanation: {
        steps: [
          "f'>0 → pendiente positiva",
          "Función va hacia arriba",
          "f creciente ✓",
        ],
        formula: "f'>0 → creciente | f'<0 → decreciente | f'=0 → crítico",
      },
    },
    {
      q: "Derivada de f(x)=x²",
      opts: ["x", "2x", "x²", "2"],
      ans: 1,
      hint: "Regla de la potencia: baja el exponente",
      explanation: {
        steps: ["d/dx(xⁿ)=n·xⁿ⁻¹", "n=2: 2x¹=2x ✓"],
        formula: "d/dx(xⁿ) = n·xⁿ⁻¹",
      },
    },
    {
      q: "Derivada de f(x)=7x",
      opts: ["0", "7", "7x", "x"],
      ans: 1,
      hint: "La derivada de una recta es su pendiente",
      explanation: {
        steps: ["d/dx(ax)=a", "a=7: f'(x)=7 ✓"],
        formula: "d/dx(ax) = a",
      },
    },
    {
      q: "Derivada de una constante f(x)=5",
      opts: ["5", "1", "0", "x"],
      ans: 2,
      hint: "Una constante no cambia",
      explanation: {
        steps: ["Una constante tiene pendiente 0", "f'(x)=0 ✓"],
        formula: "d/dx(c) = 0",
      },
    },
    {
      q: "lím(x→2) (x + 3)",
      opts: ["2", "3", "5", "6"],
      ans: 2,
      hint: "Sustituye x=2 (función continua)",
      explanation: {
        steps: ["Sustituir x=2", "2+3=5 ✓"],
        formula: "Límite de función continua = evaluar en el punto",
      },
    },
    {
      q: "Derivada de f(x)=x⁴",
      opts: ["4x³", "x³", "4x", "3x⁴"],
      ans: 0,
      hint: "Regla de la potencia",
      explanation: {
        steps: ["d/dx(xⁿ)=n·xⁿ⁻¹", "n=4: 4x³ ✓"],
        formula: "d/dx(xⁿ) = n·xⁿ⁻¹",
      },
    },
  ],
  probabilidad: [
    {
      q: "P(sacar 6 en un dado)",
      opts: ["1/3", "1/4", "1/6", "1/2"],
      ans: 2,
      hint: "1 favorable / 6 posibles",
      explanation: {
        steps: ["Dados: 6 caras", "Favorables: {6}=1", "P=1/6 ✓"],
        formula: "P(evento) = casos favorables / casos totales",
      },
    },
    {
      q: "Bolsa: 3 rojas, 7 azules. P(roja)",
      opts: ["3/10", "7/10", "3/7", "7/3"],
      ans: 0,
      hint: "Total = 3+7",
      explanation: {
        steps: ["Total=10", "P(roja)=3/10 ✓", "P(azul)=7/10→suma=1"],
        formula: "P(A)+P(Aᶜ)=1",
      },
    },
    {
      q: "Formas de ordenar 3 libros",
      opts: ["3", "6", "9", "12"],
      ans: 1,
      hint: "3! = 3×2×1",
      explanation: {
        steps: ["1°: 3 opciones", "2°: 2 opciones", "3°: 1 opción", "3!=6 ✓"],
        formula: "Permutaciones de n objetos = n!",
      },
    },
    {
      q: "P(A)=0.4, P(B)=0.3, independientes. P(A∩B)",
      opts: ["0.7", "0.12", "0.1", "0.5"],
      ans: 1,
      hint: "Independientes: multiplica",
      explanation: {
        steps: ["P(A∩B)=P(A)×P(B)", "=0.4×0.3=0.12 ✓"],
        formula: "Eventos independientes: P(A∩B)=P(A)·P(B)",
      },
    },
    {
      q: "Combinaciones C(5,2)",
      opts: ["10", "20", "5", "15"],
      ans: 0,
      hint: "5!/(2!×3!)",
      explanation: {
        steps: ["C(5,2)=5!/(2!×3!)", "=120/(2×6)=10 ✓"],
        formula: "C(n,r) = n! / (r!(n−r)!)",
      },
    },
    {
      q: "P(sacar cara al lanzar una moneda)",
      opts: ["1/4", "1/2", "1", "1/3"],
      ans: 1,
      hint: "2 resultados igualmente posibles",
      explanation: {
        steps: ["Resultados: cara, cruz (2)", "Favorables: 1", "P=1/2 ✓"],
        formula: "P = casos favorables / casos totales",
      },
    },
    {
      q: "P(número par al lanzar un dado)",
      opts: ["1/6", "1/3", "1/2", "2/3"],
      ans: 2,
      hint: "Pares: 2, 4, 6",
      explanation: {
        steps: ["Pares: {2,4,6} = 3", "Total: 6", "3/6=1/2 ✓"],
        formula: "P = casos favorables / casos totales",
      },
    },
    {
      q: "¿Cuánto es 4! (factorial de 4)?",
      opts: ["12", "24", "16", "8"],
      ans: 1,
      hint: "4×3×2×1",
      explanation: {
        steps: ["4×3=12", "12×2=24", "24×1=24 ✓"],
        formula: "n! = n × (n−1) × … × 1",
      },
    },
    {
      q: "Bolsa con 2 verdes y 3 rojas. P(verde)",
      opts: ["2/5", "3/5", "2/3", "1/2"],
      ans: 0,
      hint: "Total = 2+3",
      explanation: {
        steps: ["Total=5", "Verdes=2", "P(verde)=2/5 ✓"],
        formula: "P = casos favorables / casos totales",
      },
    },
    {
      q: "P(sacar un As de una baraja de 52 cartas)",
      opts: ["1/52", "1/13", "4/13", "1/4"],
      ans: 1,
      hint: "Hay 4 ases en 52 cartas",
      explanation: {
        steps: ["4 ases / 52 cartas", "4/52 = 1/13 ✓"],
        formula: "P = casos favorables / casos totales",
      },
    },
  ],

  // ── Primaria: Números Decimales ──────────────────────────────────────────
  decimales: [
    {
      q: "¿Cuánto es 3.5 + 2.4?",
      opts: ["5.9", "6.0", "5.8", "6.1"],
      ans: 0,
      hint: "Suma décimas: 5+4=9",
      explanation: {
        steps: [
          "Parte entera: 3+2=5",
          "Parte decimal: 0.5+0.4=0.9",
          "Resultado: 5.9 ✓",
        ],
        formula: "Suma decimal: alinear el punto decimal",
      },
    },
    {
      q: "¿Cuánto es 7.8 − 3.2?",
      opts: ["4.8", "4.6", "5.2", "4.4"],
      ans: 1,
      hint: "Resta décimas: 8−2=6",
      explanation: {
        steps: [
          "Parte entera: 7−3=4",
          "Parte decimal: 0.8−0.2=0.6",
          "Resultado: 4.6 ✓",
        ],
        formula: "Resta decimal: columna por columna alineando el punto",
      },
    },
    {
      q: "¿Qué decimal corresponde a 7 décimas?",
      opts: ["7.0", "0.07", "0.7", "70.0"],
      ans: 2,
      hint: "1 décima = 1/10 = 0.1",
      explanation: {
        steps: ["1 décima = 0.1", "7 décimas = 7 × 0.1", "= 0.7 ✓"],
        formula: "décimas = número / 10",
      },
    },
    {
      q: "¿Cuánto es 0.6 × 10?",
      opts: ["0.06", "6", "60", "0.6"],
      ans: 1,
      hint: "Multiplicar por 10 mueve el punto un lugar a la derecha",
      explanation: {
        steps: ["0.6 × 10", "Mover punto 1 lugar a la derecha", "= 6.0 ✓"],
        formula: "n × 10 desplaza el punto decimal 1 lugar a la derecha",
      },
    },
    {
      q: "¿Cuál es mayor: 0.8 ó 0.75?",
      opts: ["0.75", "0.8", "Son iguales", "No se puede comparar"],
      ans: 1,
      hint: "0.8 = 0.80; compara centésimas",
      explanation: {
        steps: [
          "0.8 = 0.80",
          "Comparar décimas: 0.80 tiene 8, 0.75 tiene 7",
          "8 > 7 → 0.80 > 0.75 ✓",
        ],
        formula: "Para comparar: igualar la cantidad de cifras decimales",
      },
    },
    {
      q: "¿Cuánto es 2.5 + 1.5?",
      opts: ["3.5", "4.0", "4.5", "3.0"],
      ans: 1,
      hint: "Suma décimas: 5+5=10",
      explanation: {
        steps: ["Décimas: 0.5+0.5=1.0", "Enteros: 2+1=3", "3+1.0=4.0 ✓"],
        formula: "Suma decimal: alinear el punto decimal",
      },
    },
    {
      q: "¿Cuánto es 6.4 − 2.1?",
      opts: ["4.3", "4.5", "3.3", "4.2"],
      ans: 0,
      hint: "Resta décimas: 4−1=3",
      explanation: {
        steps: ["Enteros: 6−2=4", "Décimas: 0.4−0.1=0.3", "Resultado: 4.3 ✓"],
        formula: "Resta decimal: alinear el punto decimal",
      },
    },
    {
      q: "¿Cuánto es 0.25 × 100?",
      opts: ["2.5", "25", "250", "0.25"],
      ans: 1,
      hint: "×100 mueve el punto 2 lugares a la derecha",
      explanation: {
        steps: ["0.25 × 100", "Mover punto 2 lugares a la derecha", "= 25 ✓"],
        formula: "n × 100 desplaza el punto decimal 2 lugares a la derecha",
      },
    },
    {
      q: "¿Cuánto es 3.7 ÷ 10?",
      opts: ["37", "0.37", "0.037", "3.70"],
      ans: 1,
      hint: "÷10 mueve el punto un lugar a la izquierda",
      explanation: {
        steps: ["3.7 ÷ 10", "Mover punto 1 lugar a la izquierda", "= 0.37 ✓"],
        formula: "n ÷ 10 desplaza el punto decimal 1 lugar a la izquierda",
      },
    },
    {
      q: "¿Qué decimal corresponde a 'tres centésimas'?",
      opts: ["0.3", "0.03", "3.0", "0.003"],
      ans: 1,
      hint: "1 centésima = 1/100 = 0.01",
      explanation: {
        steps: ["1 centésima = 0.01", "3 centésimas = 3 × 0.01", "= 0.03 ✓"],
        formula: "centésimas = número / 100",
      },
    },
  ],

  // ── Primaria: Medidas y Conversiones ────────────────────────────────────
  medidas: [
    {
      q: "¿Cuántos centímetros hay en 2 metros?",
      opts: ["20 cm", "200 cm", "2000 cm", "0.2 cm"],
      ans: 1,
      hint: "1 metro = 100 centímetros",
      explanation: {
        steps: ["1 m = 100 cm", "2 m = 2 × 100 cm", "= 200 cm ✓"],
        formula: "m → cm: multiplicar por 100",
      },
    },
    {
      q: "¿Cuántos gramos hay en 3 kilogramos?",
      opts: ["300 g", "30 g", "3000 g", "3 g"],
      ans: 2,
      hint: "1 kg = 1000 g",
      explanation: {
        steps: ["1 kg = 1000 g", "3 kg = 3 × 1000 g", "= 3000 g ✓"],
        formula: "kg → g: multiplicar por 1000",
      },
    },
    {
      q: "¿Cuántos minutos hay en 2 horas y media?",
      opts: ["120 min", "130 min", "150 min", "140 min"],
      ans: 2,
      hint: "1 hora = 60 min; media hora = 30 min",
      explanation: {
        steps: [
          "2 horas = 2 × 60 = 120 min",
          "Media hora = 30 min",
          "120 + 30 = 150 min ✓",
        ],
        formula: "horas → minutos: multiplicar por 60",
      },
    },
    {
      q: "Una botella tiene 1500 mL. ¿Cuántos litros son?",
      opts: ["0.15 L", "15 L", "150 L", "1.5 L"],
      ans: 3,
      hint: "1 L = 1000 mL",
      explanation: {
        steps: ["1 L = 1000 mL", "1500 mL ÷ 1000", "= 1.5 L ✓"],
        formula: "mL → L: dividir entre 1000",
      },
    },
    {
      q: "¿Cuántos cm tiene 1 km?",
      opts: ["100 cm", "10 000 cm", "100 000 cm", "1000 cm"],
      ans: 2,
      hint: "1 km = 1000 m; 1 m = 100 cm",
      explanation: {
        steps: ["1 km = 1000 m", "1000 m × 100 cm/m", "= 100 000 cm ✓"],
        formula: "km → cm: multiplicar por 100 000",
      },
    },
    {
      q: "¿Cuántos mililitros hay en 2 litros?",
      opts: ["200 mL", "2000 mL", "20 mL", "20000 mL"],
      ans: 1,
      hint: "1 L = 1000 mL",
      explanation: {
        steps: ["1 L = 1000 mL", "2 L = 2 × 1000", "= 2000 mL ✓"],
        formula: "L → mL: multiplicar por 1000",
      },
    },
    {
      q: "¿Cuántos centímetros hay en 5 metros?",
      opts: ["50 cm", "500 cm", "5000 cm", "5 cm"],
      ans: 1,
      hint: "1 m = 100 cm",
      explanation: {
        steps: ["1 m = 100 cm", "5 m = 5 × 100", "= 500 cm ✓"],
        formula: "m → cm: multiplicar por 100",
      },
    },
    {
      q: "¿Cuántos segundos hay en 3 minutos?",
      opts: ["120 s", "150 s", "180 s", "210 s"],
      ans: 2,
      hint: "1 minuto = 60 segundos",
      explanation: {
        steps: ["1 min = 60 s", "3 min = 3 × 60", "= 180 s ✓"],
        formula: "minutos → segundos: multiplicar por 60",
      },
    },
    {
      q: "¿Cuántos kilogramos hay en 4000 gramos?",
      opts: ["4 kg", "40 kg", "0.4 kg", "400 kg"],
      ans: 0,
      hint: "1 kg = 1000 g",
      explanation: {
        steps: ["1 kg = 1000 g", "4000 g ÷ 1000", "= 4 kg ✓"],
        formula: "g → kg: dividir entre 1000",
      },
    },
    {
      q: "¿Cuántos días hay en 3 semanas?",
      opts: ["14", "21", "28", "18"],
      ans: 1,
      hint: "1 semana = 7 días",
      explanation: {
        steps: ["1 semana = 7 días", "3 × 7 = 21", "= 21 días ✓"],
        formula: "semanas → días: multiplicar por 7",
      },
    },
  ],

  // ── Secundaria: Geometría Avanzada ───────────────────────────────────────
  geometria2: [
    {
      q: "¿Cuánto mide el área de un rectángulo de base 9 cm y altura 6 cm?",
      opts: ["30 cm²", "54 cm²", "45 cm²", "36 cm²"],
      ans: 1,
      hint: "A = base × altura",
      explanation: {
        steps: ["A = base × altura", "A = 9 × 6", "= 54 cm² ✓"],
        formula: "Área rectángulo = base × altura",
      },
    },
    {
      q: "Un prisma rectangular mide 4×3×5 cm. ¿Cuál es su volumen?",
      opts: ["60 cm³", "47 cm³", "36 cm³", "80 cm³"],
      ans: 0,
      hint: "V = largo × ancho × alto",
      explanation: {
        steps: ["V = 4 × 3 × 5", "= 12 × 5", "= 60 cm³ ✓"],
        formula: "Volumen prisma rectangular = l × a × h",
      },
    },
    {
      q: "Catetos de un triángulo rectángulo: 5 y 12. ¿Cuánto mide la hipotenusa?",
      opts: ["13", "17", "11", "15"],
      ans: 0,
      hint: "c² = 5² + 12²",
      explanation: {
        steps: ["c² = 5² + 12²", "= 25 + 144 = 169", "c = √169 = 13 ✓"],
        formula: "Teorema de Pitágoras: c² = a² + b²",
      },
    },
    {
      q: "Un trapecio tiene bases 8 cm y 12 cm, altura 5 cm. ¿Área?",
      opts: ["50 cm²", "60 cm²", "40 cm²", "100 cm²"],
      ans: 0,
      hint: "A = ((b1 + b2) / 2) × h",
      explanation: {
        steps: [
          "A = ((8 + 12) / 2) × 5",
          "= (20 / 2) × 5",
          "= 10 × 5 = 50 cm² ✓",
        ],
        formula: "Área trapecio = ((b₁ + b₂) / 2) × h",
      },
    },
    {
      q: "¿Cuánto mide el perímetro de un hexágono regular de lado 7 cm?",
      opts: ["35 cm", "42 cm", "49 cm", "28 cm"],
      ans: 1,
      hint: "Un hexágono tiene 6 lados iguales",
      explanation: {
        steps: ["Hexágono regular: 6 lados iguales", "P = 6 × 7", "= 42 cm ✓"],
        formula: "Perímetro polígono regular = n × lado",
      },
    },
    {
      q: "Área de un círculo de radio 5 cm (π≈3.14)",
      opts: ["78.5 cm²", "31.4 cm²", "15.7 cm²", "157 cm²"],
      ans: 0,
      hint: "A = π × r²",
      explanation: {
        steps: ["A = 3.14 × 5²", "= 3.14 × 25", "= 78.5 cm² ✓"],
        formula: "Área del círculo = π × r²",
      },
    },
    {
      q: "Volumen de un cubo de arista 3 cm",
      opts: ["9 cm³", "18 cm³", "27 cm³", "81 cm³"],
      ans: 2,
      hint: "V = arista³",
      explanation: {
        steps: ["V = 3³", "= 3 × 3 × 3", "= 27 cm³ ✓"],
        formula: "Volumen del cubo = a³",
      },
    },
    {
      q: "Catetos de un triángulo rectángulo: 6 y 8. ¿Hipotenusa?",
      opts: ["10", "12", "14", "9"],
      ans: 0,
      hint: "c² = 6² + 8²",
      explanation: {
        steps: ["c² = 36 + 64 = 100", "c = √100 = 10 ✓"],
        formula: "Teorema de Pitágoras: c² = a² + b²",
      },
    },
    {
      q: "Área de un triángulo de base 10 cm y altura 4 cm",
      opts: ["40 cm²", "20 cm²", "14 cm²", "24 cm²"],
      ans: 1,
      hint: "A = (base × altura) / 2",
      explanation: {
        steps: ["A = (10 × 4) / 2", "= 40 / 2", "= 20 cm² ✓"],
        formula: "Área triángulo = (base × altura) / 2",
      },
    },
    {
      q: "Circunferencia de un círculo de radio 10 cm (π≈3.14)",
      opts: ["31.4 cm", "62.8 cm", "314 cm", "6.28 cm"],
      ans: 1,
      hint: "C = 2 × π × r",
      explanation: {
        steps: ["C = 2 × 3.14 × 10", "= 6.28 × 10", "= 62.8 cm ✓"],
        formula: "Circunferencia = 2 × π × r",
      },
    },
  ],

  // ── Secundaria: Porcentajes ───────────────────────────────────────────────
  porcentajes: [
    {
      q: "¿Cuánto es el 20% de 150?",
      opts: ["30", "20", "25", "35"],
      ans: 0,
      hint: "20% = 20/100 = 0.2",
      explanation: {
        steps: ["20% de 150", "= 150 × 0.20", "= 30 ✓"],
        formula: "% de número = número × (% / 100)",
      },
    },
    {
      q: "Un artículo vale $80 con 10% de descuento. ¿Precio final?",
      opts: ["$70", "$72", "$78", "$68"],
      ans: 1,
      hint: "Descuento = 80 × 0.10",
      explanation: {
        steps: [
          "Descuento = 80 × 0.10 = $8",
          "Precio final = 80 − 8",
          "= $72 ✓",
        ],
        formula: "Precio con descuento = precio × (1 − descuento%)",
      },
    },
    {
      q: "De 40 alumnos, 25 aprobaron. ¿Qué porcentaje aprobó?",
      opts: ["60%", "62.5%", "65%", "55%"],
      ans: 1,
      hint: "(25 / 40) × 100",
      explanation: {
        steps: ["Fracción: 25/40", "= 0.625", "× 100 = 62.5% ✓"],
        formula: "% = (parte / total) × 100",
      },
    },
    {
      q: "Un precio subió de $200 a $250. ¿Qué porcentaje aumentó?",
      opts: ["20%", "25%", "50%", "30%"],
      ans: 1,
      hint: "Aumento = 50; base = 200",
      explanation: {
        steps: ["Aumento = 250 − 200 = 50", "% = (50 / 200) × 100", "= 25% ✓"],
        formula: "% de variación = (variación / valor original) × 100",
      },
    },
    {
      q: "¿Cuánto es el 15% de $60?",
      opts: ["$9", "$10", "$8", "$12"],
      ans: 0,
      hint: "10% de 60 = 6; 5% de 60 = 3",
      explanation: {
        steps: ["10% de 60 = 6", "5% de 60 = 3", "15% = 6 + 3 = $9 ✓"],
        formula: "15% = 10% + 5%",
      },
    },
    {
      q: "¿Cuánto es el 50% de 80?",
      opts: ["30", "40", "50", "20"],
      ans: 1,
      hint: "50% es la mitad",
      explanation: {
        steps: ["50% = mitad", "80 ÷ 2 = 40 ✓"],
        formula: "50% de n = n / 2",
      },
    },
    {
      q: "¿Cuánto es el 25% de 200?",
      opts: ["25", "50", "75", "100"],
      ans: 1,
      hint: "25% es la cuarta parte",
      explanation: {
        steps: ["25% = 1/4", "200 ÷ 4 = 50 ✓"],
        formula: "25% de n = n / 4",
      },
    },
    {
      q: "¿Cuánto es el 10% de 350?",
      opts: ["35", "3.5", "350", "30"],
      ans: 0,
      hint: "10% = dividir entre 10",
      explanation: {
        steps: ["10% = 1/10", "350 ÷ 10 = 35 ✓"],
        formula: "10% de n = n / 10",
      },
    },
    {
      q: "Una camisa de $40 sube un 25%. ¿Precio nuevo?",
      opts: ["$45", "$50", "$55", "$48"],
      ans: 1,
      hint: "Suma el 25% de 40 al precio",
      explanation: {
        steps: ["25% de 40 = 10", "40 + 10 = 50", "Precio nuevo = $50 ✓"],
        formula: "Precio con aumento = precio × (1 + %)",
      },
    },
    {
      q: "De 50 estudiantes, 30 aprobaron. ¿Qué porcentaje aprobó?",
      opts: ["50%", "60%", "70%", "65%"],
      ans: 1,
      hint: "(30 / 50) × 100",
      explanation: {
        steps: ["30/50 = 0.6", "0.6 × 100 = 60% ✓"],
        formula: "% = (parte / total) × 100",
      },
    },
  ],

  // ── Secundaria: Razones y Proporciones ──────────────────────────────────
  razones: [
    {
      q: "Si 3 lápices cuestan $6, ¿cuánto cuestan 7 lápices?",
      opts: ["$12", "$14", "$16", "$10"],
      ans: 1,
      hint: "Regla de tres directa: más lápices, más dinero",
      explanation: {
        steps: [
          "3 lápices → $6",
          "1 lápiz → $6 ÷ 3 = $2",
          "7 lápices → 7 × $2 = $14 ✓",
        ],
        formula: "Regla de 3 directa: a/b = c/x → x = (b×c)/a",
      },
    },
    {
      q: "La razón entre 8 y 12 simplificada es:",
      opts: ["4/6", "2/3", "3/2", "8/12"],
      ans: 1,
      hint: "MCD(8,12) = 4",
      explanation: {
        steps: ["MCD(8,12) = 4", "8 ÷ 4 = 2", "12 ÷ 4 = 3", "Razón = 2/3 ✓"],
        formula: "Razón simplificada = dividir entre el MCD",
      },
    },
    {
      q: "5 obreros tardan 12 días. ¿Cuántos días tardan 6 obreros?",
      opts: ["10", "14", "8", "15"],
      ans: 0,
      hint: "Más obreros → menos días (proporcionalidad inversa)",
      explanation: {
        steps: ["5 × 12 = 6 × x", "60 = 6x", "x = 10 días ✓"],
        formula: "Regla de 3 inversa: a₁×b₁ = a₂×b₂",
      },
    },
    {
      q: "Una maqueta usa escala 1:50. Una pared mide 6 m en real, ¿cuánto mide en la maqueta?",
      opts: ["12 cm", "30 cm", "60 cm", "3 cm"],
      ans: 0,
      hint: "Real ÷ 50 = maqueta (en mismas unidades)",
      explanation: {
        steps: ["6 m = 600 cm", "Maqueta = 600 cm ÷ 50", "= 12 cm ✓"],
        formula: "Escala 1:n → medida maqueta = medida real / n",
      },
    },
    {
      q: "¿Cuál de estos pares NO son proporcionales directos: (2,4), (4,8), (3,7), (5,10)?",
      opts: ["(2,4)", "(4,8)", "(3,7)", "(5,10)"],
      ans: 2,
      hint: "¿La razón siempre es la misma?",
      explanation: {
        steps: [
          "2/4 = 1/2",
          "4/8 = 1/2",
          "3/7 ≠ 1/2  ← distinto",
          "5/10 = 1/2",
          "(3,7) no es proporcional ✓",
        ],
        formula: "Proporcionalidad directa: a/b = constante",
      },
    },
    {
      q: "Si 2 kg cuestan $8, ¿cuánto cuestan 5 kg?",
      opts: ["$16", "$20", "$24", "$10"],
      ans: 1,
      hint: "Regla de tres directa",
      explanation: {
        steps: ["2 kg → $8", "1 kg → $8 ÷ 2 = $4", "5 kg → 5 × $4 = $20 ✓"],
        formula: "Regla de 3 directa: x = (b × c) / a",
      },
    },
    {
      q: "La razón de 10 a 15 simplificada es:",
      opts: ["2/3", "3/2", "5/3", "10/15"],
      ans: 0,
      hint: "MCD(10,15)=5",
      explanation: {
        steps: ["MCD(10,15)=5", "10÷5=2, 15÷5=3", "Razón = 2/3 ✓"],
        formula: "Razón simplificada = dividir entre el MCD",
      },
    },
    {
      q: "Si 4 obreros tardan 6 días, ¿cuántos días tardan 8 obreros?",
      opts: ["3", "12", "4", "6"],
      ans: 0,
      hint: "Más obreros → menos días (inversa)",
      explanation: {
        steps: ["4 × 6 = 8 × x", "24 = 8x", "x = 3 días ✓"],
        formula: "Regla de 3 inversa: a₁×b₁ = a₂×b₂",
      },
    },
    {
      q: "Una receta para 4 personas usa 8 huevos. ¿Cuántos para 6 personas?",
      opts: ["10", "12", "14", "16"],
      ans: 1,
      hint: "Calcula huevos por persona",
      explanation: {
        steps: ["8 ÷ 4 = 2 huevos por persona", "6 × 2 = 12 ✓"],
        formula: "Regla de 3 directa: x = (b × c) / a",
      },
    },
    {
      q: "En escala 1:100, una pared real de 5 m mide en el plano:",
      opts: ["5 cm", "50 cm", "0.5 cm", "500 cm"],
      ans: 0,
      hint: "Real ÷ 100 (en las mismas unidades)",
      explanation: {
        steps: ["5 m = 500 cm", "500 cm ÷ 100 = 5 cm ✓"],
        formula: "Escala 1:n → plano = real / n",
      },
    },
  ],

  // ── Secundaria: Números y Potencias ─────────────────────────────────────
  numeros: [
    {
      q: "¿Cuánto es 3⁴?",
      opts: ["12", "64", "81", "27"],
      ans: 2,
      hint: "3 × 3 × 3 × 3",
      explanation: {
        steps: ["3¹ = 3", "3² = 9", "3³ = 27", "3⁴ = 81 ✓"],
        formula: "aⁿ = a multiplicado por sí mismo n veces",
      },
    },
    {
      q: "¿Cuánto es √144?",
      opts: ["11", "12", "13", "14"],
      ans: 1,
      hint: "¿Qué número al cuadrado da 144?",
      explanation: {
        steps: ["12 × 12 = 144", "√144 = 12 ✓"],
        formula: "√(a²) = a (para a ≥ 0)",
      },
    },
    {
      q: "¿Cuál es el valor de (−3)²?",
      opts: ["−9", "6", "9", "−6"],
      ans: 2,
      hint: "(−3)² = (−3) × (−3)",
      explanation: {
        steps: ["(−3) × (−3)", "Negativo × negativo = positivo", "= 9 ✓"],
        formula: "(−a)² = a² (el cuadrado es siempre positivo)",
      },
    },
    {
      q: "Simplifica: 2⁵ ÷ 2²",
      opts: ["2³", "2⁷", "4", "2¹⁰"],
      ans: 0,
      hint: "División de potencias misma base: resta exponentes",
      explanation: {
        steps: ["2⁵ ÷ 2² = 2^(5−2)", "= 2³", "= 8 ✓"],
        formula: "aᵐ ÷ aⁿ = a^(m−n)",
      },
    },
    {
      q: "¿Cuál es el opuesto de −7 en la recta numérica?",
      opts: ["−7", "7", "1/7", "0"],
      ans: 1,
      hint: "El opuesto tiene el mismo módulo pero signo contrario",
      explanation: {
        steps: ["Opuesto de −7", "Mismo módulo: 7", "Signo contrario: +7 ✓"],
        formula: "Opuesto de a = −a",
      },
    },
    {
      q: "¿Cuánto es 2⁵?",
      opts: ["10", "16", "32", "25"],
      ans: 2,
      hint: "Multiplica 2 cinco veces",
      explanation: {
        steps: ["2×2×2×2×2", "= 32 ✓"],
        formula: "aⁿ = a multiplicado por sí mismo n veces",
      },
    },
    {
      q: "¿Cuánto es √81?",
      opts: ["8", "9", "7", "81"],
      ans: 1,
      hint: "¿Qué número al cuadrado da 81?",
      explanation: {
        steps: ["9 × 9 = 81", "√81 = 9 ✓"],
        formula: "√(a²) = a (para a ≥ 0)",
      },
    },
    {
      q: "¿Cuánto es (−5) + (−3)?",
      opts: ["−8", "8", "−2", "2"],
      ans: 0,
      hint: "Mismo signo: suma y conserva el signo",
      explanation: {
        steps: ["Ambos negativos: 5+3=8", "Signo negativo", "= −8 ✓"],
        formula: "(−a) + (−b) = −(a+b)",
      },
    },
    {
      q: "¿Cuánto es 7² − 4²?",
      opts: ["33", "9", "65", "23"],
      ans: 0,
      hint: "Calcula cada cuadrado primero",
      explanation: {
        steps: ["7²=49", "4²=16", "49−16=33 ✓"],
        formula: "Potencias antes de restar (jerarquía de operaciones)",
      },
    },
    {
      q: "¿Cuánto es 10³?",
      opts: ["30", "100", "1000", "300"],
      ans: 2,
      hint: "10×10×10",
      explanation: {
        steps: ["10×10=100", "100×10=1000 ✓"],
        formula: "10ⁿ = 1 seguido de n ceros",
      },
    },
  ],

  // ── High School: Matrices y Sistemas ─────────────────────────────────────
  matrices: [
    {
      q: "A = [[1,2],[3,4]], B = [[5,6],[7,8]]. ¿Cuánto es A+B en posición (1,1)?",
      opts: ["6", "8", "9", "12"],
      ans: 0,
      hint: "Suma los elementos en la misma posición",
      explanation: {
        steps: ["A[1,1] = 1; B[1,1] = 5", "1 + 5 = 6", "(A+B)[1,1] = 6 ✓"],
        formula: "(A+B)ᵢⱼ = Aᵢⱼ + Bᵢⱼ",
      },
    },
    {
      q: "¿Cuál es el determinante de la matriz [[2,3],[1,4]]?",
      opts: ["5", "11", "8", "−5"],
      ans: 0,
      hint: "det = ad − bc",
      explanation: {
        steps: ["a=2, b=3, c=1, d=4", "det = (2×4) − (3×1)", "= 8 − 3 = 5 ✓"],
        formula: "det([[a,b],[c,d]]) = ad − bc",
      },
    },
    {
      q: "Resuelve el sistema: x+y=5, x−y=1. ¿Cuánto vale x?",
      opts: ["3", "4", "2", "5"],
      ans: 0,
      hint: "Suma las dos ecuaciones para eliminar y",
      explanation: {
        steps: ["Sumar: (x+y)+(x−y)=5+1", "2x = 6", "x = 3 ✓", "y = 5−3 = 2"],
        formula:
          "Método de eliminación: suma las ecuaciones para cancelar una variable",
      },
    },
    {
      q: "Una matriz 3×2 tiene __ filas y __ columnas.",
      opts: [
        "2 filas, 3 columnas",
        "3 filas, 2 columnas",
        "3 filas, 3 columnas",
        "2 filas, 2 columnas",
      ],
      ans: 1,
      hint: "El primer número indica filas, el segundo columnas",
      explanation: {
        steps: [
          "Notación m×n: m=filas, n=columnas",
          "3×2: 3 filas y 2 columnas ✓",
        ],
        formula: "Matriz m×n: m filas, n columnas",
      },
    },
    {
      q: "¿Cuánto es 2 × [[1,0],[0,1]]? ¿Cuál es el elemento (1,1)?",
      opts: ["0", "1", "2", "4"],
      ans: 2,
      hint: "Escalar × matriz: multiplica cada elemento",
      explanation: {
        steps: [
          "2 × [[1,0],[0,1]]",
          "= [[2×1, 2×0],[2×0, 2×1]]",
          "= [[2,0],[0,2]]",
          "Elemento (1,1) = 2 ✓",
        ],
        formula: "k × A: cada elemento aᵢⱼ se multiplica por k",
      },
    },
    {
      q: "Determinante de la matriz [[1,2],[3,4]]",
      opts: ["−2", "2", "10", "−10"],
      ans: 0,
      hint: "det = ad − bc",
      explanation: {
        steps: ["a=1, b=2, c=3, d=4", "det=(1×4)−(2×3)", "=4−6=−2 ✓"],
        formula: "det([[a,b],[c,d]]) = ad − bc",
      },
    },
    {
      q: "A=[[2,0],[0,2]], B=[[1,1],[1,1]]. ¿(A+B) en posición (1,1)?",
      opts: ["2", "3", "4", "1"],
      ans: 1,
      hint: "Suma los elementos (1,1)",
      explanation: {
        steps: ["A[1,1]=2, B[1,1]=1", "2+1=3 ✓"],
        formula: "(A+B)ᵢⱼ = Aᵢⱼ + Bᵢⱼ",
      },
    },
    {
      q: "¿Cuántos elementos tiene una matriz 3×3?",
      opts: ["3", "6", "9", "12"],
      ans: 2,
      hint: "Filas × columnas",
      explanation: {
        steps: ["3 filas × 3 columnas", "= 9 elementos ✓"],
        formula: "Elementos = filas × columnas",
      },
    },
    {
      q: "Sistema: x+y=10, x−y=2. ¿Cuánto vale x?",
      opts: ["4", "6", "8", "5"],
      ans: 1,
      hint: "Suma las dos ecuaciones",
      explanation: {
        steps: ["Sumar: 2x=12", "x=6 ✓", "y=10−6=4"],
        formula: "Eliminación: suma para cancelar una variable",
      },
    },
    {
      q: "Determinante de la matriz [[5,0],[0,3]]",
      opts: ["8", "15", "0", "5"],
      ans: 1,
      hint: "Matriz diagonal: multiplica la diagonal",
      explanation: {
        steps: ["det=(5×3)−(0×0)", "=15−0=15 ✓"],
        formula: "det([[a,b],[c,d]]) = ad − bc",
      },
    },
  ],

  // ── High School: Geometría Analítica ─────────────────────────────────────
  analitica: [
    {
      q: "¿Cuál es la distancia entre los puntos (1,2) y (4,6)?",
      opts: ["3", "5", "7", "4"],
      ans: 1,
      hint: "d = √((x₂−x₁)² + (y₂−y₁)²)",
      explanation: {
        steps: [
          "Δx = 4−1 = 3; Δy = 6−2 = 4",
          "d = √(3² + 4²)",
          "= √(9+16) = √25 = 5 ✓",
        ],
        formula: "Distancia = √((x₂−x₁)² + (y₂−y₁)²)",
      },
    },
    {
      q: "Recta: 2x + y = 6. ¿Cuál es la pendiente m?",
      opts: ["2", "−2", "6", "1/2"],
      ans: 1,
      hint: "Despeja y: y = mx + b",
      explanation: {
        steps: ["2x + y = 6", "y = −2x + 6", "m = −2 ✓"],
        formula: "Forma pendiente-intercepto: y = mx + b",
      },
    },
    {
      q: "¿Cuál es el punto medio entre (0,0) y (4,8)?",
      opts: ["(2,4)", "(4,4)", "(2,8)", "(4,2)"],
      ans: 0,
      hint: "Promedio de cada coordenada",
      explanation: {
        steps: [
          "xₘ = (0+4)/2 = 2",
          "yₘ = (0+8)/2 = 4",
          "Punto medio = (2,4) ✓",
        ],
        formula: "Punto medio = ((x₁+x₂)/2, (y₁+y₂)/2)",
      },
    },
    {
      q: "La ecuación x²+y²=25 representa un círculo. ¿Cuál es su radio?",
      opts: ["25", "5", "12.5", "√5"],
      ans: 1,
      hint: "Forma estándar: x²+y²=r²",
      explanation: {
        steps: ["x² + y² = r²", "r² = 25", "r = √25 = 5 ✓"],
        formula: "Círculo centrado en origen: x² + y² = r²",
      },
    },
    {
      q: "Dos rectas: y=3x+1 y y=3x−4. ¿Qué relación tienen?",
      opts: [
        "Se cortan en un punto",
        "Son paralelas",
        "Son perpendiculares",
        "Se cortan en dos puntos",
      ],
      ans: 1,
      hint: "Compara las pendientes",
      explanation: {
        steps: ["y=3x+1: m=3", "y=3x−4: m=3", "Misma pendiente → paralelas ✓"],
        formula: "Rectas paralelas: m₁ = m₂ (distinto intercepto)",
      },
    },
    {
      q: "Distancia entre los puntos (0,0) y (3,4)",
      opts: ["5", "7", "12", "25"],
      ans: 0,
      hint: "d = √(x² + y²)",
      explanation: {
        steps: ["d=√(3²+4²)", "=√(9+16)=√25", "=5 ✓"],
        formula: "Distancia = √((x₂−x₁)² + (y₂−y₁)²)",
      },
    },
    {
      q: "Punto medio entre (2,4) y (6,8)",
      opts: ["(4,6)", "(8,12)", "(3,5)", "(4,12)"],
      ans: 0,
      hint: "Promedia cada coordenada",
      explanation: {
        steps: ["xₘ=(2+6)/2=4", "yₘ=(4+8)/2=6", "=(4,6) ✓"],
        formula: "Punto medio = ((x₁+x₂)/2, (y₁+y₂)/2)",
      },
    },
    {
      q: "Pendiente de la recta y = 2x + 3",
      opts: ["2", "3", "−2", "1/2"],
      ans: 0,
      hint: "En y=mx+b, m es la pendiente",
      explanation: {
        steps: ["Forma y=mx+b", "m=2 ✓"],
        formula: "Pendiente = coeficiente de x",
      },
    },
    {
      q: "Radio del círculo x²+y²=49",
      opts: ["49", "7", "24.5", "√7"],
      ans: 1,
      hint: "x²+y²=r²",
      explanation: {
        steps: ["r²=49", "r=√49=7 ✓"],
        formula: "Círculo centrado en el origen: x²+y²=r²",
      },
    },
    {
      q: "Pendiente de la recta que pasa por (0,0) y (2,6)",
      opts: ["2", "3", "6", "1/3"],
      ans: 1,
      hint: "m=(y₂−y₁)/(x₂−x₁)",
      explanation: {
        steps: ["m=(6−0)/(2−0)", "=6/2=3 ✓"],
        formula: "Pendiente = Δy/Δx",
      },
    },
  ],
};

export function getStaticQuestions(topicId: string): Exercise[] {
  return STATIC_Q[topicId] ?? STATIC_Q.suma;
}
