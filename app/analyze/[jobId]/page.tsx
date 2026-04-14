'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { jobs } from '@/lib/jobs';
import { AnalysisResult, ScoreBreakdown, RecruiterLikelihood } from '@/lib/types';
import { ScoreGauge } from '@/components/ScoreGauge';

// ─── Streaming parser ───────────────────────────────────────────────────────
function parseStream(text: string): Partial<AnalysisResult> {
  const result: Partial<AnalysisResult> = {};
  const bd: Partial<ScoreBreakdown> = {};
  const strengths: string[] = [];
  const suggestions: string[] = [];

  // Split off resume section first
  const resumeSplit = text.split(/^RESUME$/m);
  const header = resumeSplit[0];
  if (resumeSplit.length > 1) {
    result.formattedResume = resumeSplit.slice(1).join('\nRESUME\n').trim();
  }

  for (const line of header.split('\n')) {
    const m = line.match(/^([A-Z_]+):\s*(.*)/);
    if (!m) continue;
    const [, key, val] = m;
    const v = val.trim();
    switch (key) {
      case 'SCORE':      result.score = parseInt(v); break;
      case 'SKILLS':     bd.skillsMatch = parseInt(v); break;
      case 'EXPERIENCE': bd.experienceRelevance = parseInt(v); break;
      case 'IMPACT':     bd.impactQuantification = parseInt(v); break;
      case 'FORMAT':     bd.formatting = parseInt(v); break;
      case 'KEYWORDS':   bd.keywordOptimization = parseInt(v); break;
      case 'LIKELIHOOD': result.recruiterLikelihood = v as RecruiterLikelihood; break;
      case 'STRENGTH':   if (v) strengths.push(v); break;
      case 'MISSING':
        result.missingSkills = v === 'NONE' ? [] : v.split(',').map((s) => s.trim()).filter(Boolean);
        break;
      case 'FIX':        if (v) suggestions.push(v); break;
    }
  }

  if (Object.keys(bd).length) result.breakdown = bd as ScoreBreakdown;
  if (strengths.length) result.strengths = strengths;
  if (suggestions.length) result.suggestions = suggestions;
  return result;
}

// ─── BreakdownBar ──────────────────────────────────────────────────────────
const BREAKDOWN_LABELS: Record<keyof ScoreBreakdown, string> = {
  skillsMatch: 'Skills match',
  experienceRelevance: 'Experience relevance',
  impactQuantification: 'Impact quantification',
  formatting: 'Resume formatting',
  keywordOptimization: 'ATS keyword coverage',
};

function BreakdownBar({ label, value }: { label: string; value: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 100); return () => clearTimeout(t); }, [value]);
  const color = value >= 80 ? '#34d399' : value >= 60 ? '#818cf8' : value >= 40 ? '#fbbf24' : '#f87171';
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${w}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function AnalyzePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const job = jobs.find((j) => j.id === jobId);

  const [resumeText, setResumeText] = useState('');
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle');
  const [partial, setPartial] = useState<Partial<AnalysisResult>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const accRef = useRef('');

  async function analyze() {
    if (!resumeText.trim() || !job) return;
    setStatus('streaming');
    setPartial({});
    setErrorMsg('');
    accRef.current = '';

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobId }),
      });

      if (!res.ok || !res.body) {
        const body = await res.text();
        throw new Error(body || `Server error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accRef.current += decoder.decode(value, { stream: true });

        // Surface an error line immediately
        if (accRef.current.includes('\nERROR:')) {
          const errLine = accRef.current.split('\n').find((l) => l.startsWith('ERROR:'));
          throw new Error(errLine?.replace('ERROR: ', '') ?? 'Analysis failed.');
        }

        setPartial(parseStream(accRef.current));
      }

      const final = parseStream(accRef.current);
      setPartial(final);
      setStatus('done');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Analysis failed.');
      setStatus('error');
    }
  }

  function copyResume() {
    if (!partial.formattedResume) return;
    navigator.clipboard.writeText(partial.formattedResume).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const isStreaming = status === 'streaming';
  const hasResult = status === 'done' || (isStreaming && partial.score !== undefined);

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-400 mb-4">Job not found.</p>
        <Link href="/" className="text-violet-400 hover:text-violet-300 font-medium">← Back to jobs</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link href="/" className="hover:text-slate-300 transition-colors">Jobs</Link>
        <span>/</span>
        <Link href={`/jobs/${job.id}`} className="hover:text-slate-300 transition-colors">{job.title}</Link>
        <span>/</span>
        <span className="text-slate-300">Analyze</span>
      </nav>

      {/* Job strip */}
      <div className="glass rounded-2xl p-4 mb-7 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl ${job.companyColor} flex items-center justify-center text-white font-bold flex-shrink-0`}>
          {job.companyInitials}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{job.title}</p>
          <p className="text-xs text-slate-400">{job.company} · {job.location} · {job.type}</p>
        </div>
        <div className="ml-auto hidden sm:flex flex-wrap gap-1.5">
          {job.techStack.slice(0, 4).map((t) => (
            <span key={t} className="tag-violet">{t}</span>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-7 text-xs">
        {(['Paste resume', 'AI analysis', 'Optimised result'] as const).map((step, i) => {
          const done = i === 0 ? hasResult : i === 1 ? status === 'done' : false;
          const active = i === 0 ? status === 'idle' : i === 1 ? isStreaming : status === 'done';
          return (
            <div key={step} className="flex items-center gap-2">
              {i > 0 && <div className="w-6 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                  style={done ? { background: '#34d399', color: '#fff' } : active ? { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff' } : { background: 'rgba(255,255,255,0.07)', color: '#64748b' }}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span style={{ color: done ? '#34d399' : active ? '#a78bfa' : '#475569' }}>{step}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resume input */}
      <div className="glass rounded-2xl p-6 mb-5">
        <label className="block text-sm font-semibold text-white mb-1">Paste your resume</label>
        <p className="text-xs text-slate-500 mb-3">
          Plain text works best. Include all sections — work experience, skills, education.
        </p>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="John Smith&#10;john@example.com&#10;&#10;EXPERIENCE&#10;Senior Engineer — Acme (March 2022 – Present)&#10;• Built React dashboard used by 3,000 users..."
          rows={13}
          disabled={isStreaming}
          className="w-full font-mono text-sm rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y text-slate-200 placeholder:text-slate-600 transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-600">
            {resumeText.trim().split(/\s+/).filter(Boolean).length} words
          </span>
          <button
            onClick={analyze}
            disabled={!resumeText.trim() || isStreaming}
            className="btn-primary text-sm px-7 py-2.5"
          >
            {isStreaming ? 'Analyzing…' : 'Analyze match'}
          </button>
        </div>
      </div>

      {/* Error */}
      {status === 'error' && (
        <div className="rounded-2xl p-5 mb-5 text-sm animate-fade-in"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5' }}>
          <p className="font-medium mb-1">Analysis failed</p>
          <p className="text-xs" style={{ color: '#f87171' }}>{errorMsg}</p>
        </div>
      )}

      {/* ── Streaming / result display ──────────────────────────────── */}
      {(hasResult || isStreaming) && (
        <div ref={resultsRef} className="space-y-5 animate-fade-in">

          {/* Score gauge */}
          {partial.score !== undefined && partial.recruiterLikelihood && (
            <div className="glass rounded-2xl p-8 flex flex-col items-center gap-5">
              <h2 className="text-base font-bold text-white">Your match score</h2>
              <ScoreGauge score={partial.score} recruiterLikelihood={partial.recruiterLikelihood} />
              {isStreaming && (
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-3 h-3 border border-violet-500 border-t-transparent rounded-full animate-spin inline-block" />
                  Loading more insights…
                </p>
              )}
            </div>
          )}

          {/* Breakdown */}
          {partial.breakdown && Object.keys(partial.breakdown).length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-5">Score breakdown</h2>
              <div className="space-y-4">
                {(Object.keys(BREAKDOWN_LABELS) as (keyof ScoreBreakdown)[]).map((key) =>
                  partial.breakdown?.[key] !== undefined ? (
                    <BreakdownBar key={key} label={BREAKDOWN_LABELS[key]} value={partial.breakdown[key]!} />
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Strengths + Missing */}
          {((partial.strengths?.length ?? 0) > 0 || (partial.missingSkills?.length ?? 0) >= 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {(partial.strengths?.length ?? 0) > 0 && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
                      style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>✓</span>
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {partial.strengths!.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {partial.missingSkills !== undefined && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
                      style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>!</span>
                    Missing skills
                  </h3>
                  {partial.missingSkills.length === 0 ? (
                    <p className="text-xs text-slate-500">No critical gaps found.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {partial.missingSkills.map((s) => (
                        <span key={s} className="tag-red">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Suggestions */}
          {(partial.suggestions?.length ?? 0) > 0 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-5">Improvement suggestions</h2>
              <ol className="space-y-4">
                {partial.suggestions!.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-300 leading-relaxed">{s}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Formatted resume */}
          {partial.formattedResume && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4 gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">AI-formatted resume</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Rewritten following recruiter best practices.</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowResume((v) => !v)}
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    {showResume ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={copyResume}
                    className="btn-primary text-xs px-4 py-1.5"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {showResume ? (
                <pre
                  className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-auto max-h-[560px] rounded-xl p-5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {partial.formattedResume}
                </pre>
              ) : (
                <button
                  onClick={() => setShowResume(true)}
                  className="w-full rounded-xl py-7 text-sm text-slate-500 hover:text-violet-400 transition-colors"
                  style={{ border: '2px dashed rgba(255,255,255,0.08)' }}
                >
                  Click to reveal your formatted resume
                </button>
              )}
            </div>
          )}

          {/* Streaming indicator in footer */}
          {isStreaming && !partial.score && (
            <div className="glass rounded-2xl p-6 flex items-center gap-4">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Analyzing your resume…</p>
                <p className="text-xs text-slate-500 mt-0.5">Claude Sonnet is reading against the JD — 15–25 seconds</p>
              </div>
            </div>
          )}

          {/* Reset */}
          {status === 'done' && (
            <div className="flex justify-center pb-6">
              <button
                onClick={() => { setStatus('idle'); setPartial({}); setResumeText(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Analyze a different resume
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
