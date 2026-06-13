import type { CSSProperties } from "react";
import { T } from "./theme";

// ─── Shared button styles ─────────────────────────────────────────────────────
export const ghostBtn: CSSProperties = {
  background:T.white, color:T.gray800, border:`1.5px solid ${T.gray300}`,
  borderRadius:10, padding:"8px 16px", fontWeight:600, fontSize:14,
  cursor:"pointer", fontFamily:"inherit",
};

export function primaryBtn(color: string): CSSProperties {
  return {
    background:color, color:T.white, border:"none", borderRadius:12,
    padding:"12px 24px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit",
  };
}

// ─── Shared keyframes (inyectados por los componentes que los usan) ───────────
export const KEYFRAMES = `
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
`;
