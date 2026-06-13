import { T } from "../theme";
import type { Level, LevelId, Topic } from "../types";

// ─── Levels & Topics ──────────────────────────────────────────────────────────
export const LEVELS: Level[] = [
  { id:"primaria",   label:"Primaria",    emoji:"🌱", grades:"1° – 6° Grado",   color:T.green,  dark:T.greenDark,  bg:"#E8F8EF" },
  { id:"secundaria", label:"Secundaria",  emoji:"🚀", grades:"7° – 9° Grado",   color:T.sky,    dark:"#357ABD",    bg:"#E8F4FD" },
  { id:"highschool", label:"High School", emoji:"🎓", grades:"10° – 12° Grado", color:T.purple, dark:T.purpleDark, bg:"#F3EBF9" },
];

export const TOPICS: Record<LevelId, Topic[]> = {
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
