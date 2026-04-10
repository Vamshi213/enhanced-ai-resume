'use client';

import { useEffect, useState } from 'react';
import { RecruiterLikelihood } from '@/lib/types';

interface ScoreGaugeProps {
  score: number;
  recruiterLikelihood: RecruiterLikelihood;
}

function scoreColor(score: number): string {
  if (score >= 80) return '#10B981'; // green
  if (score >= 60) return '#3B82F6'; // blue
  if (score >= 40) return '#F59E0B'; // amber
  return '#EF4444'; // red
}

function likelihoodBg(likelihood: RecruiterLikelihood): string {
  const map: Record<RecruiterLikelihood, string> = {
    'Very High': 'bg-green-100 text-green-800 border-green-200',
    High: 'bg-blue-100 text-blue-800 border-blue-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Low: 'bg-red-100 text-red-800 border-red-200',
  };
  return map[likelihood];
}

function likelihoodIcon(likelihood: RecruiterLikelihood): string {
  const map: Record<RecruiterLikelihood, string> = {
    'Very High': '🎯',
    High: '📈',
    Medium: '⚡',
    Low: '🔧',
  };
  return map[likelihood];
}

export function ScoreGauge({ score, recruiterLikelihood }: ScoreGaugeProps) {
  const [animated, setAnimated] = useState(0);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;
  const color = scoreColor(score);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative inline-flex items-center justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
          <circle
            cx="100" cy="100" r={radius}
            fill="none" stroke="#E5E7EB" strokeWidth="14"
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
        <div className="absolute text-center">
          <div className="text-5xl font-bold" style={{ color }}>{score}</div>
          <div className="text-sm text-gray-400 font-medium">/ 100</div>
        </div>
      </div>

      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${likelihoodBg(recruiterLikelihood)}`}>
        <span>{likelihoodIcon(recruiterLikelihood)}</span>
        <span>{recruiterLikelihood} recruiter call likelihood</span>
      </div>
    </div>
  );
}
