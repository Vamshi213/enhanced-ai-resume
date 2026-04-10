'use client';

import { useState, useMemo } from 'react';
import { Job } from '@/lib/types';
import { JobCard } from './JobCard';

interface JobListProps {
  jobs: Job[];
}

const WORK_TYPES = ['All', 'Remote', 'Hybrid', 'On-site'] as const;

export function JobList({ jobs }: JobListProps) {
  const [query, setQuery] = useState('');
  const [workType, setWorkType] = useState<(typeof WORK_TYPES)[number]>('All');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return jobs.filter((job) => {
      const matchesType = workType === 'All' || job.type === workType;
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.techStack.some((t) => t.toLowerCase().includes(q)) ||
        job.location.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [jobs, query, workType]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by role, company, or technology…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          />
        </div>
        <div className="flex gap-2">
          {WORK_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setWorkType(t)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                workType === t
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-6">
        {filtered.length === 0
          ? 'No jobs match your search.'
          : `${filtered.length} job${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
