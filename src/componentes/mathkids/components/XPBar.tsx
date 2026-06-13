import { T } from "../theme";

interface XPBarProps {
  xp: number;
  maxXp?: number;
}

export function XPBar({ xp, maxXp = 1500 }: XPBarProps) {
  const pct = Math.min((xp / maxXp) * 100, 100);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, maxWidth:260 }}>
      <span style={{ fontSize:13, color:T.yellow, fontWeight:800, whiteSpace:"nowrap" }}>⭐ {xp} XP</span>
      <div style={{ flex:1, height:10, background:"rgba(255,255,255,0.15)", borderRadius:5, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${T.yellow},${T.orange})`, borderRadius:5, transition:"width 0.8s ease" }}/>
      </div>
    </div>
  );
}
