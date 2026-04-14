'use client';

import { useEffect, useState } from 'react';
import { getMatchColor } from '@/lib/scoring';

interface MatchRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function MatchRing({ score, size = 52, strokeWidth = 4 }: MatchRingProps) {
  const [animated, setAnimated] = useState(0);
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;
  const color = getMatchColor(score);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 120);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="score-ring"
        />
      </svg>
      <span
        className="absolute text-[11px] font-bold leading-none"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}
