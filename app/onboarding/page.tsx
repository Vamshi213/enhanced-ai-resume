'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveProfile } from '@/lib/profile';
import { UserProfile } from '@/lib/types';

type Stage = 'input' | 'parsing' | 'confirm' | 'error';

export default function OnboardingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('input');
  const [resumeText, setResumeText] = useState('');
  const [parsed, setParsed] = useState<Omit<UserProfile, 'resumeText' | 'createdAt'> | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleParse() {
    if (!resumeText.trim()) return;
    setStage('parsing');
    setErrorMsg('');

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      setParsed(data);
      setStage('confirm');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Profile extraction failed. Please try again.');
      setStage('error');
    }
  }

  function handleSave() {
    if (!parsed) return;
    const profile: UserProfile = {
      ...parsed,
      resumeText,
      createdAt: new Date().toISOString(),
    };
    saveProfile(profile);
    router.push('/');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
      {/* Header */}
      <div className="mb-10 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 tag-violet mb-4 text-xs font-semibold uppercase tracking-widest">
          Profile setup
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Build your profile</h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
          Paste your resume below. Our AI will extract your skills and experience in
          seconds — then rank every open role for you automatically.
        </p>
      </div>

      {/* ── Input stage ─────────────────────────────────────────── */}
      {(stage === 'input' || stage === 'error') && (
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <label className="block text-sm font-semibold text-white mb-1">
            Your resume
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Plain text or copy-paste from PDF. Include experience, skills, and education.
          </p>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder={`Jane Smith
jane@example.com | linkedin.com/in/janesmith

EXPERIENCE
Senior Software Engineer — Stripe (Jan 2022 – Present)
• Built React dashboard used by 15,000 merchants, reducing support tickets by 28%
• Migrated REST endpoints to GraphQL, cutting over-fetching by 60%

SKILLS
React, TypeScript, GraphQL, Node.js, PostgreSQL, AWS

EDUCATION
BS Computer Science · MIT · 2019`}
            rows={14}
            className="w-full font-mono text-sm rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y text-slate-200 placeholder:text-slate-600 transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-slate-600">
              {resumeText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              onClick={handleParse}
              disabled={!resumeText.trim()}
              className="btn-primary text-sm px-7 py-2.5"
            >
              Extract my profile →
            </button>
          </div>

          {stage === 'error' && errorMsg && (
            <div className="mt-4 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5' }}>
              {errorMsg}
              {errorMsg.includes('ANTHROPIC_API_KEY') && (
                <p className="mt-1 text-xs" style={{ color: '#f87171' }}>
                  Add <code className="px-1 rounded" style={{ background: 'rgba(255,255,255,0.07)' }}>ANTHROPIC_API_KEY</code> to <code className="px-1 rounded" style={{ background: 'rgba(255,255,255,0.07)' }}>.env.local</code>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Parsing stage ───────────────────────────────────────── */}
      {stage === 'parsing' && (
        <div className="glass rounded-2xl p-10 flex flex-col items-center gap-5 animate-fade-in">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="font-semibold text-white">Extracting your profile…</p>
            <p className="text-sm text-slate-400 mt-1">
              Claude Haiku is reading your resume — usually under 3 seconds.
            </p>
          </div>
        </div>
      )}

      {/* ── Confirm stage ───────────────────────────────────────── */}
      {stage === 'confirm' && parsed && (
        <div className="space-y-5 animate-slide-up">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white">Profile extracted</h2>
              <span className="tag-green text-xs">Ready</span>
            </div>

            <div className="space-y-4">
              {/* Name + title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Name</label>
                  <div className="text-sm text-white font-medium">{parsed.name}</div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Title</label>
                  <div className="text-sm text-white font-medium">{parsed.title}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Experience</label>
                  <div className="text-sm text-white font-medium">{parsed.yearsExperience} years</div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Domains</label>
                  <div className="flex flex-wrap gap-1">
                    {parsed.domains.map((d) => (
                      <span key={d} className="tag-cyan capitalize">{d}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
                  Skills detected ({parsed.skills.length})
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.skills.map((s) => (
                    <span key={s} className="tag-violet">{s}</span>
                  ))}
                </div>
              </div>

              {/* Education */}
              {parsed.education && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Education</label>
                  <div className="text-sm text-slate-300">{parsed.education}</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStage('input')}
              className="btn-ghost text-sm px-5 py-2.5 flex-1"
            >
              ← Edit resume
            </button>
            <button
              onClick={handleSave}
              className="btn-primary text-sm px-7 py-2.5 flex-1"
            >
              Save profile & see matches →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
