'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserProfile } from '@/lib/types';
import { loadProfile } from '@/lib/profile';
import { ProfileCard } from '@/components/ProfileCard';
import { JobList } from '@/components/JobList';
import { getJobsSortedByDate } from '@/lib/jobs';

const JOBS = getJobsSortedByDate();

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  // Hydration guard
  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ── Landing hero (no profile) ─────────────────────────────────── */}
      {!profile && (
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 tag-violet mb-6 text-xs font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI-powered resume matching
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-5 leading-tight">
            Land every{' '}
            <span className="text-gradient">recruiter call</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Build your profile once. Get AI-matched job recommendations, a score
            for every role, and a recruiter-ready resume — instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/onboarding" className="btn-primary text-base px-8 py-3">
              Build my profile in 30 seconds →
            </Link>
            <span className="text-xs text-slate-500">No sign-up required · Stays in your browser</span>
          </div>

          {/* Steps */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { n: '01', title: 'Paste your resume', body: 'Drop in your current resume text — any format works.' },
              { n: '02', title: 'Get matched instantly', body: 'AI extracts your profile and scores every open role.' },
              { n: '03', title: 'One-click apply-ready', body: 'Deep-analyze any role to get a formatted, ATS-optimised resume.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="glass rounded-2xl p-5">
                <div className="text-xs font-bold text-violet-400 mb-2 tracking-widest">{n}</div>
                <h3 className="font-semibold text-white mb-1">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Personalised dashboard (has profile) ─────────────────────── */}
      {profile && (
        <div className="mb-10 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back,{' '}
                <span className="text-gradient">{profile.name.split(' ')[0]}</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {JOBS.length} open roles — sorted by your match score below
              </p>
            </div>
            <ProfileCard profile={profile} compact />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Open roles', value: JOBS.length },
              { label: 'Your skills', value: profile.skills.length },
              { label: 'Yrs experience', value: profile.yearsExperience },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Job listings ─────────────────────────────────────────────── */}
      <div>
        {!profile && (
          <h2 className="text-xl font-bold text-white mb-6">
            Browse open roles
          </h2>
        )}
        <JobList jobs={JOBS} />
      </div>
    </div>
  );
}
