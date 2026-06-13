import { useEffect, useRef, useState } from "react";
import { getTutorSystemPrompt } from "../prompts";
import { ollamaChat } from "../services/ollama";
import { KEYFRAMES } from "../styles";
import { T } from "../theme";
import type { ChatMessage, Exercise, Level, Topic } from "../types";

interface TutorChatProps {
  level: Level;
  topic: Topic;
  color: string;
  currentQuestion: Exercise | null;
  onClose: () => void;
}

export function TutorChat({ level, topic, color, currentQuestion, onClose }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role:"assistant",
      content:`¡Hola! Soy **MathBot** 🤖, tu tutor de matemáticas.\n\nEstoy aquí para ayudarte con **${topic.title}**. ¿Tienes alguna duda sobre el ejercicio actual o quieres que te explique algún concepto?\n\n¡No te preocupes, aprenderemos juntos! 😊`,
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  async function sendMessage(text?: string) {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");

    // Add user message + context about current question
    let userContent = msg;
    if (currentQuestion) {
      userContent = `[Contexto: El alumno está viendo esta pregunta: "${currentQuestion.q}"]\n\nAlumno: ${msg}`;
    }

    const newMessages: ChatMessage[] = [...messages, { role:"user", content:msg }];
    setMessages(newMessages);
    setLoading(true);
    setStreamingContent("");

    try {
      const apiMessages: ChatMessage[] = [
        { role:"system", content:systemPrompt },
        ...newMessages.map(m => ({ role:m.role, content:m.content })),
      ];
      // replace last user message with context-enriched version
      apiMessages[apiMessages.length-1].content = userContent;

      let final = "";
      await ollamaChat(apiMessages, (text) => {
        final = text;
        setStreamingContent(text);
      }, { think: false }); // sin razonamiento interno → respuestas ~3x más rápidas para el alumno

      setMessages(prev => [...prev, { role:"assistant", content:final }]);
    } catch {
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

  function formatMessage(text: string): string {
    // Basic markdown: headings, bullets, bold, code, line breaks.
    // Se elimina cualquier bloque <think> por seguridad (no debe verlo el alumno).
    return text
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/^#{1,6}\s*(.+)$/gm, '<strong>$1</strong>')   // # Encabezado → negrita
      .replace(/^\s*[-*]\s+(.+)$/gm, '• $1')                  // - bullet → •
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code style="background:#EEF1F5;padding:2px 6px;border-radius:4px;font-size:12px">$1</code>')
      .replace(/\n/g, '<br/>')
      .trim();
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
          onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) sendMessage(); }}
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

      <style>{KEYFRAMES}</style>
    </div>
  );
}
