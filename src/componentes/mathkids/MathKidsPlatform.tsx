import { useState, type CSSProperties } from "react";
import { AIExerciseGenerator } from "./components/AIExerciseGenerator";
import { OllamaBadge } from "./components/OllamaBadge";
import { ProgressRing } from "./components/ProgressRing";
import { QuizView } from "./components/QuizView";
import { TopicDetail } from "./components/TopicDetail";
import { XPBar } from "./components/XPBar";
import { OLLAMA_MODEL } from "./config";
import { LEVELS, TOPICS } from "./data/levels";
import { getStaticQuestions } from "./data/staticQuestions";
import { useOllamaStatus } from "./hooks/useOllamaStatus";
import { T } from "./theme";
import type { Exercise, LevelId, OllamaStatus, Screen, Topic } from "./types";

const appStyle: CSSProperties = {
  fontFamily: "'Nunito','Segoe UI',sans-serif",
  minHeight: "100vh",
  background: T.offWhite,
};

const headerStyle: CSSProperties = {
  background: T.navy,
  color: T.white,
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: 60,
  position: "sticky",
  top: 0,
  zIndex: 100,
  boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
  gap: 16,
  flexShrink: 0,
};

interface AppHeaderProps {
  xp: number;
  status: OllamaStatus;
  onBack?: () => void;
  home?: boolean;
}

function AppHeader({ xp, status, onBack, home = false }: AppHeaderProps) {
  return (
    <header style={headerStyle}>
      {home ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>🧮</span>
          <span
            style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.5px" }}
          >
            MathKids
          </span>
        </div>
      ) : onBack ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: T.white,
              cursor: "pointer",
              fontSize: 22,
              padding: 0,
            }}
          >
            ←
          </button>
          <span style={{ fontWeight: 900, fontSize: 18 }}>🧮 MathKids</span>
        </div>
      ) : (
        <span style={{ fontWeight: 900, fontSize: 18, flexShrink: 0 }}>
          🧮 MathKids
        </span>
      )}
      <XPBar xp={xp} />
      <OllamaBadge status={status} />
    </header>
  );
}

export default function MathKidsPlatform() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeLevel, setActiveLevel] = useState<LevelId | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Exercise[]>([]);
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [streak] = useState(3);
  const { status: ollamaStatus } = useOllamaStatus();

  const level = LEVELS.find((l) => l.id === activeLevel);
  const topics = activeLevel ? TOPICS[activeLevel] : [];

  function goToLevel(levelId: LevelId) {
    setActiveLevel(levelId);
    setScreen("level");
  }
  function goToTopic(topic: Topic) {
    setActiveTopic(topic);
    setScreen("topicDetail");
  }
  function goToAIGen() {
    setScreen("aiGen");
  }
  function goToAIQuiz(qs: Exercise[]) {
    setActiveQuestions(qs);
    setScreen("quiz");
  }
  function goToPreset() {
    if (!activeTopic) return;
    setActiveQuestions(getStaticQuestions(activeTopic.id));
    setScreen("quiz");
  }

  function handleComplete(earned: number) {
    setXp((x) => x + earned);
    if (activeLevel && activeTopic) {
      setCompleted((s) => new Set([...s, `${activeLevel}:${activeTopic.id}`]));
    }
    setScreen("topicDetail");
  }

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  if (screen === "quiz" && level && activeTopic)
    return (
      <div style={appStyle}>
        <AppHeader xp={xp} status={ollamaStatus} />
        <QuizView
          topic={activeTopic}
          level={level}
          color={level.color}
          questions={activeQuestions}
          onBack={() => setScreen("topicDetail")}
          onComplete={handleComplete}
        />
      </div>
    );

  // ── AI GENERATOR ───────────────────────────────────────────────────────────
  if (screen === "aiGen" && level && activeTopic)
    return (
      <div style={appStyle}>
        <AppHeader xp={xp} status={ollamaStatus} />
        <AIExerciseGenerator
          level={level}
          topic={activeTopic}
          color={level.color}
          onStartQuiz={goToAIQuiz}
          onBack={() => setScreen("topicDetail")}
        />
      </div>
    );

  // ── TOPIC DETAIL ───────────────────────────────────────────────────────────
  if (screen === "topicDetail" && level && activeTopic)
    return (
      <div style={appStyle}>
        <AppHeader
          xp={xp}
          status={ollamaStatus}
          onBack={() => setScreen("level")}
        />
        <TopicDetail
          topic={activeTopic}
          color={level.color}
          completed={completed.has(`${activeLevel}:${activeTopic.id}`)}
          onStartPreset={goToPreset}
          onStartAI={goToAIGen}
          onBack={() => setScreen("level")}
        />
      </div>
    );

  // ── LEVEL ──────────────────────────────────────────────────────────────────
  if (screen === "level" && level) {
    const lvlDone = topics.filter((t) =>
      completed.has(`${activeLevel}:${t.id}`),
    ).length;
    return (
      <div style={appStyle}>
        <AppHeader
          xp={xp}
          status={ollamaStatus}
          onBack={() => setScreen("home")}
        />

        <div
          style={{
            background: level.color,
            color: T.white,
            padding: "40px 24px 48px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 54, marginBottom: 8 }}>{level.emoji}</div>
          <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900 }}>
            {level.label}
          </h1>
          <p style={{ margin: "0 0 20px", opacity: 0.85, fontSize: 15 }}>
            {level.grades}
          </p>
          <div
            style={{
              display: "inline-flex",
              gap: 24,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: "12px 28px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {lvlDone}/{topics.length}
              </div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Completados</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.3)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {topics.reduce((s, t) => s + t.xp, 0)}
              </div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>XP disponibles</div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: T.white,
            padding: "16px 24px",
            borderBottom: `1px solid ${T.gray100}`,
          }}
        >
          <div
            style={{
              height: 8,
              background: T.gray100,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(lvlDone / topics.length) * 100}%`,
                background: level.color,
                borderRadius: 4,
                transition: "width 0.6s",
              }}
            />
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: T.gray500 }}>
            Progreso: {lvlDone} de {topics.length} temas
          </p>
        </div>

        <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
          <h2
            style={{
              margin: "0 0 20px",
              fontSize: 20,
              fontWeight: 800,
              color: T.navy,
            }}
          >
            Temas disponibles
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: 20,
            }}
          >
            {topics.map((topic) => {
              const done = completed.has(`${activeLevel}:${topic.id}`);
              return (
                <div
                  key={topic.id}
                  onClick={() => goToTopic(topic)}
                  style={{
                    background: T.white,
                    borderRadius: 20,
                    padding: "22px",
                    cursor: "pointer",
                    border: `2px solid ${done ? level.color : T.gray100}`,
                    boxShadow: "0 2px 16px rgba(30,58,95,0.07)",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 28px rgba(30,58,95,0.13)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 16px rgba(30,58,95,0.07)";
                  }}
                >
                  {done && (
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background: level.color,
                        color: T.white,
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 10px",
                      }}
                    >
                      ✓
                    </div>
                  )}
                  <div style={{ fontSize: 38, marginBottom: 10 }}>
                    {topic.icon}
                  </div>
                  <h3
                    style={{
                      margin: "0 0 5px",
                      fontSize: 16,
                      fontWeight: 800,
                      color: T.navy,
                    }}
                  >
                    {topic.title}
                  </h3>
                  <p
                    style={{
                      margin: "0 0 14px",
                      fontSize: 13,
                      color: T.gray500,
                      lineHeight: 1.5,
                    }}
                  >
                    {topic.desc}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: level.color,
                        fontWeight: 700,
                        background: level.bg,
                        padding: "4px 10px",
                        borderRadius: 20,
                      }}
                    >
                      ⭐ {topic.xp} XP
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: T.gray300,
                        background: T.gray100,
                        padding: "3px 9px",
                        borderRadius: 20,
                        fontWeight: 600,
                      }}
                    >
                      ✨ IA disponible
                    </span>
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
      <AppHeader xp={xp} status={ollamaStatus} home />

      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg,${T.navy} 0%,${T.navyLight} 60%,#1a6fa8 100%)`,
          color: T.white,
          padding: "56px 24px 64px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: [120, 80, 60, 100, 70, 90][i],
              height: [120, 80, 60, 100, 70, 90][i],
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              top: ["10%", "60%", "30%", "80%", "15%", "70%"][i],
              left: ["5%", "15%", "80%", "75%", "55%", "45%"][i],
            }}
          />
        ))}
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 70, marginBottom: 14 }}>🧮</div>
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: 38,
              fontWeight: 900,
              lineHeight: 1.1,
            }}
          >
            Aprende Matemáticas
            <br />
            <span style={{ color: T.yellow }}>con IA como tu tutor</span>
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              fontSize: 16,
              opacity: 0.82,
              maxWidth: 520,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            Ejercicios generados por IA, explicaciones paso a paso y un tutor
            inteligente disponible en todo momento.
          </p>

          {/* Ollama banner */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "10px 20px",
              marginBottom: 28,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <span style={{ fontSize: 22 }}>🤖</span>
            <div style={{ textAlign: "left" }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>
                Potenciado por Ollama
              </p>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
                Modelo: {OLLAMA_MODEL} · Funciona 100% local
              </p>
            </div>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: ollamaStatus === "online" ? T.green : T.coral,
                display: "inline-block",
                boxShadow:
                  ollamaStatus === "online" ? `0 0 8px ${T.green}` : undefined,
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "inline-flex",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              {[
                { v: `${completed.size}/${totalTopics}`, l: "Temas" },
                { v: `${xp} XP`, l: "Puntos" },
                { v: `${streak} 🔥`, l: "Días" },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 22px",
                    borderRight:
                      i < 2 ? "1px solid rgba(255,255,255,0.15)" : "none",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ fontSize: 20, fontWeight: 800, color: T.yellow }}
                  >
                    {s.v}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Offline warning */}
      {ollamaStatus === "offline" && (
        <div
          style={{
            background: "#FEF3C7",
            borderBottom: "2px solid #F59E0B",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 24 }}>⚠️</span>
          <div>
            <p
              style={{
                margin: "0 0 2px",
                fontWeight: 700,
                color: "#92400E",
                fontSize: 14,
              }}
            >
              Ollama no detectado — los ejercicios de IA y el tutor no estarán
              disponibles
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#78350F" }}>
              Ejecuta:{" "}
              <code
                style={{
                  background: "#FDE68A",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                ollama serve
              </code>{" "}
              y luego{" "}
              <code
                style={{
                  background: "#FDE68A",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                ollama pull {OLLAMA_MODEL}
              </code>
            </p>
          </div>
        </div>
      )}

      {/* Level cards */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: 26,
              fontWeight: 900,
              color: T.navy,
            }}
          >
            Elige tu nivel
          </h2>
          <p style={{ margin: 0, color: T.gray500 }}>
            Todos los temas incluyen ejercicios de IA personalizados y tutor
            inteligente
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 24,
          }}
        >
          {LEVELS.map((lvl) => {
            const lvlTopics = TOPICS[lvl.id];
            const lvlDone = lvlTopics.filter((t) =>
              completed.has(`${lvl.id}:${t.id}`),
            ).length;
            const pct = Math.round((lvlDone / lvlTopics.length) * 100);
            return (
              <div
                key={lvl.id}
                onClick={() => goToLevel(lvl.id)}
                style={{
                  background: T.white,
                  borderRadius: 24,
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: "0 4px 24px rgba(30,58,95,0.08)",
                  border: "2px solid transparent",
                  transition: "all 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.border = `2px solid ${lvl.color}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.border = "2px solid transparent";
                }}
              >
                <div
                  style={{
                    background: lvl.color,
                    padding: "28px 24px",
                    color: T.white,
                    position: "relative",
                  }}
                >
                  <div style={{ position: "absolute", right: 16, top: 16 }}>
                    <ProgressRing percent={pct} color="rgba(255,255,255,0.9)" />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {pct}%
                    </div>
                  </div>
                  <div style={{ fontSize: 46, marginBottom: 8 }}>
                    {lvl.emoji}
                  </div>
                  <h3
                    style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900 }}
                  >
                    {lvl.label}
                  </h3>
                  <p style={{ margin: 0, opacity: 0.85, fontSize: 14 }}>
                    {lvl.grades}
                  </p>
                </div>
                <div style={{ padding: "18px 22px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 13, color: T.gray500 }}>
                      {lvlDone} / {lvlTopics.length} temas
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: lvl.color,
                      }}
                    >
                      {lvlTopics.reduce((s, t) => s + t.xp, 0)} XP
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: T.gray100,
                      borderRadius: 3,
                      overflow: "hidden",
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: lvl.color,
                        borderRadius: 3,
                        transition: "width 0.6s",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {lvlTopics.map((t) => (
                      <span
                        key={t.id}
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 20,
                          background: completed.has(`${lvl.id}:${t.id}`)
                            ? lvl.bg
                            : T.gray100,
                          color: completed.has(`${lvl.id}:${t.id}`)
                            ? lvl.dark
                            : T.gray500,
                          fontWeight: 600,
                        }}
                      >
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
      <div style={{ background: T.navy, color: T.white, padding: "52px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900 }}>
            Tecnología al servicio del aprendizaje
          </h2>
          <p style={{ margin: "0 0 36px", opacity: 0.7 }}>
            100% local, privado y sin conexión a internet requerida
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
              gap: 20,
            }}
          >
            {[
              {
                icon: "🤖",
                t: "IA Generativa",
                d: "Ollama crea ejercicios únicos y personalizados en cada sesión",
              },
              {
                icon: "🧑‍🏫",
                t: "Tutor Inteligente",
                d: "Resuelve tus dudas en tiempo real con explicaciones adaptadas",
              },
              {
                icon: "📡",
                t: "100% Local",
                d: "Sin datos en la nube. Tu aprendizaje es privado y siempre disponible",
              },
              {
                icon: "🎯",
                t: "Dificultad Adaptada",
                d: "Elige entre fácil, medio y difícil según tu nivel actual",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: "22px 18px",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>{s.icon}</div>
                <h4
                  style={{
                    margin: "0 0 6px",
                    fontSize: 15,
                    fontWeight: 800,
                    color: T.yellow,
                  }}
                >
                  {s.t}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    opacity: 0.75,
                    lineHeight: 1.5,
                  }}
                >
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#15304F",
          color: "rgba(255,255,255,0.45)",
          padding: "18px 24px",
          textAlign: "center",
          fontSize: 12,
        }}
      >
        🧮 MathKids · Potenciado por Ollama ({OLLAMA_MODEL}) · Educación con IA
        local
      </div>
    </div>
  );
}
