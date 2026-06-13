import { T } from "../theme";

interface ProgressRingProps {
  percent: number;
  color: string;
  size?: number;
}

export function ProgressRing({ percent, color, size = 56 }: ProgressRingProps) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.gray100} strokeWidth={6}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeDasharray={circ} strokeDashoffset={offset} style={{ transition:"stroke-dashoffset 0.6s ease" }}/>
    </svg>
  );
}
