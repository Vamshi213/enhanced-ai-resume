'use client';

import { useEffect, useState } from 'react';
import { RecruiterLikelihood } from '@/lib/types';

interface ScoreGaugeProps {
  score: number;
  recruiterLikelihood: RecruiterLikelihood;
}

function scoreColor(score: number): string {
  if (score >= 80) return '#34d399';
  if (score >= 60) return '#818cf8';
  if (score >= 40) return '#fbbf24';
  return '#f87171';
}

const LIKELIHOOD_STYLES: Record<RecruiterLikelihood, string> = {
  'Very High': 'bg-emerald-400/10 text-emerald-300 border-emerald-400/25',
  High: 'bg-indigo-400/10 text-indigo-300 border-indigo-400/25',
  Medium: 'bg-amber-400/10 text-amber-300 border-amber-400/25',
  Low: 'bg-red-400/10 text-red-300 border-red-400/25',
};

const LIKELIHOOD_ICON: Record<RecruiterLikelihood, string> = {
  'Very High': '🎯',
  High: '📈',
  Medium: '⚡',
  Low: '🔧',
};

export function ScoreGauge({ score, recruiterLikelihood }: ScoreGaugeProps) {
  const [animated, setAnimated] = useState(0);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;
  const color = scoreColor(score);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 120);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative inline-flex items-center justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="14"
          />
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring"
          />
        </svg>
        {/* Glow */}
        <div
          className="absolute w-32 h-32 rounded-full blur-2xl opacity-20"
          style={{ background: color }}
        />
        <div className="absolute text-center z-10">
          <div className="text-5xl font-bold" style={{ color }}>{score}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">/ 100</div>
        </div>
      </div>

      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${LIKELIHOOD_STYLES[recruiterLikelihood]}`}
      >
        <span>{LIKELIHOOD_ICON[recruiterLikelihood]}</span>
        <span>{recruiterLikelihood} recruiter call likelihood</span>
      </div>
    </div>
  );
}
