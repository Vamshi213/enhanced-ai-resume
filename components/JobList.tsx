'use client';

import { useState, useMemo, useEffect } from 'react';
import { Job, UserProfile } from '@/lib/types';
import { loadProfile } from '@/lib/profile';
import { scoreJobForProfile } from '@/lib/scoring';
import { JobCard } from './JobCard';

interface JobListProps {
  jobs: Job[];
}

const WORK_TYPES = ['All', 'Remote', 'Hybrid', 'On-site'] as const;
type Tab = 'recommended' | 'all';

export function JobList({ jobs }: JobListProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tab, setTab] = useState<Tab>('recommended');
  const [query, setQuery] = useState('');
  const [workType, setWorkType] = useState<(typeof WORK_TYPES)[number]>('All');

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    if (!p) setTab('all');
  }, []);

  const scoredJobs = useMemo(() => {
    return jobs.map((job) => ({
      job,
      score: profile ? scoreJobForProfile(job, profile) : undefined,
    }));
  }, [jobs, profile]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let list = scoredJobs.filter(({ job }) => {
      const matchesType = workType === 'All' || job.type === workType;
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.techStack.some((t) => t.toLowerCase().includes(q)) ||
        job.location.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });

    if (tab === 'recommended' && profile) {
      list = [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }

    return list;
  }, [scoredJobs, query, workType, tab, profile]);

  return (
    <div>
      {/* Tabs (only when profile exists) */}
      {profile && (
        <div className="flex gap-1 mb-6 glass-bright rounded-xl p-1 w-fit">
          {(['recommended', 'all'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                tab === t
                  ? 'text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={tab === t ? { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' } : {}}
            >
              {t === 'recommended' ? '✦ For You' : 'All Jobs'}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search role, company, or technology…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-dark pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {WORK_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setWorkType(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                workType === t
                  ? 'text-white'
                  : 'btn-ghost'
              }`}
              style={workType === t ? { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' } : {}}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-500 mb-5">
        {filtered.length === 0
          ? 'No jobs match.'
          : `${filtered.length} job${filtered.length !== 1 ? 's' : ''}${tab === 'recommended' && profile ? ' — sorted by your match score' : ''}`}
      </p>

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ job, score }) => (
            <JobCard key={job.id} job={job} matchScore={score} />
          ))}
        </div>
      )}
    </div>
  );
}
