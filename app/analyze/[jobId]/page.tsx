'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { jobs } from '@/lib/jobs';
import { AnalysisResult, ScoreBreakdown } from '@/lib/types';
import { ScoreGauge } from '@/components/ScoreGauge';

const LOADING_MESSAGES = [
  'Reading your resume…',
  'Matching skills against job requirements…',
  'Assessing impact quantification…',
  'Checking ATS keyword coverage…',
  'Formatting recruiter-ready version…',
  'Almost done…',
];

function BreakdownBar({ label, value }: { label: string; value: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  const color =
    value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-blue-500' : value >= 40 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

const BREAKDOWN_LABELS: Record<keyof ScoreBreakdown, string> = {
  skillsMatch: 'Skills match',
  experienceRelevance: 'Experience relevance',
  impactQuantification: 'Impact quantification',
  formatting: 'Resume formatting',
  keywordOptimization: 'ATS keyword coverage',
};

export default function AnalyzePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const job = jobs.find((j) => j.id === jobId);

  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  async function analyze() {
    if (!resumeText.trim() || !job) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setLoadingMsgIdx(0);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const data: AnalysisResult = await res.json();
      setResult(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function copyResume() {
    if (!result) return;
    navigator.clipboard.writeText(result.formattedResume).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Job not found.</p>
        <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
          ← Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Jobs</Link>
        <span>/</span>
        <Link href={`/jobs/${job.id}`} className="hover:text-gray-600 transition-colors">{job.title}</Link>
        <span>/</span>
        <span className="text-gray-700">Analyze</span>
      </nav>

      {/* Job context strip */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 mb-8 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${job.companyColor} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
          {job.companyInitials}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{job.title}</div>
          <div className="text-sm text-gray-400">{job.company} · {job.location} · {job.type}</div>
        </div>
        <div className="ml-auto hidden sm:flex flex-wrap gap-1.5">
          {job.techStack.slice(0, 4).map((t) => (
            <span key={t} className="text-xs bg-indigo-50 text-indigo-600 rounded-md px-2 py-0.5">{t}</span>
          ))}
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        {['Paste resume', 'AI analysis', 'Optimized result'].map((step, i) => {
          const active = i === 0 ? !result : i === 1 ? isAnalyzing : !!result;
          const done = i === 0 ? !!result || isAnalyzing : i === 1 ? !!result : false;
          return (
            <div key={step} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px bg-gray-200" />}
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-green-500 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={done ? 'text-green-600' : active ? 'text-indigo-600 font-medium' : 'text-gray-400'}>
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resume input */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Paste your resume
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Plain text works best. Include all sections: work experience, skills, education.
          The AI will analyze and reformat it.
        </p>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder={`John Smith
john@example.com | linkedin.com/in/johnsmith | github.com/johnsmith

EXPERIENCE

Senior Software Engineer — Acme Corp (March 2022 – Present)
• Built React dashboard used by 3,000 internal users
• Reduced page load time by 40% by migrating to lazy-loaded modules
• Led migration from REST to GraphQL, cutting over-fetching by 60%

...`}
          rows={16}
          className="w-full font-mono text-sm border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y text-gray-700 placeholder:text-gray-300"
          disabled={isAnalyzing}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">
            {resumeText.length} chars · {resumeText.trim().split(/\s+/).filter(Boolean).length} words
          </span>
          <button
            onClick={analyze}
            disabled={!resumeText.trim() || isAnalyzing}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-8 rounded-xl transition-colors text-sm"
          >
            {isAnalyzing ? 'Analyzing…' : 'Analyze Match'}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isAnalyzing && (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-8 flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="font-medium text-gray-900">{LOADING_MESSAGES[loadingMsgIdx]}</p>
            <p className="text-sm text-gray-400 mt-1">This takes 15–30 seconds</p>
          </div>
          <div className="flex gap-1.5">
            {LOADING_MESSAGES.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === loadingMsgIdx ? 'bg-indigo-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center animate-fade-in">
          <p className="text-red-700 font-medium mb-2">Analysis failed</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <p className="text-xs text-red-400">
            Make sure <code className="bg-red-100 px-1 rounded">ANTHROPIC_API_KEY</code> is set in your <code className="bg-red-100 px-1 rounded">.env.local</code> file.
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div ref={resultsRef} className="space-y-6 animate-slide-up">
          {/* Score + likelihood */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center gap-6">
            <h2 className="text-lg font-bold text-gray-900">Your match score</h2>
            <ScoreGauge score={result.score} recruiterLikelihood={result.recruiterLikelihood} />
            <p className="text-sm text-gray-500 text-center max-w-sm">
              {result.recruiterLikelihood === 'Very High'
                ? 'Your profile closely matches this role. Focus on the suggestions below to make it perfect.'
                : result.recruiterLikelihood === 'High'
                ? 'Strong match. A few targeted improvements could make this application stand out.'
                : result.recruiterLikelihood === 'Medium'
                ? 'Moderate match. Address the missing skills and improve impact quantification.'
                : 'Significant gaps. Tailor your resume heavily using the suggestions below.'}
            </p>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Score breakdown</h2>
            <div className="space-y-4">
              {(Object.keys(result.breakdown) as (keyof ScoreBreakdown)[]).map((key) => (
                <BreakdownBar
                  key={key}
                  label={BREAKDOWN_LABELS[key]}
                  value={result.breakdown[key]}
                />
              ))}
            </div>
          </div>

          {/* Strengths + Missing skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                Strengths
              </h2>
              <ul className="space-y-2.5">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs">!</span>
                Missing skills
              </h2>
              {result.missingSkills.length === 0 ? (
                <p className="text-sm text-gray-400">No critical skill gaps found.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-red-50 text-red-600 border border-red-100 rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Improvement suggestions</h2>
            <ol className="space-y-4">
              {result.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">{s}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Formatted resume */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">AI-formatted resume</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Rewritten following recruiter best practices — copy and paste into your editor.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowResume((v) => !v)}
                  className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                >
                  {showResume ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={copyResume}
                  className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-1.5 transition-colors font-medium"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            {showResume && (
              <pre className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-xs font-mono text-gray-700 whitespace-pre-wrap leading-relaxed overflow-auto max-h-[600px]">
                {result.formattedResume}
              </pre>
            )}
            {!showResume && (
              <button
                onClick={() => setShowResume(true)}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
              >
                Click to reveal your formatted resume
              </button>
            )}
          </div>

          {/* Re-analyze */}
          <div className="flex justify-center pb-8">
            <button
              onClick={() => {
                setResult(null);
                setResumeText('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Analyze a different resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
