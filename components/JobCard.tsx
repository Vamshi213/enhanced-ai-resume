import Link from 'next/link';
import { Job } from '@/lib/types';
import { MatchRing } from './MatchRing';
import { getMatchLabel, getMatchColorClass } from '@/lib/scoring';

interface JobCardProps {
  job: Job;
  matchScore?: number;
}

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 14) return '1w ago';
  return `${Math.floor(days / 7)}w ago`;
}

const TYPE_BADGE: Record<Job['type'], string> = {
  Remote: 'tag-green',
  Hybrid: 'tag-cyan',
  'On-site': 'tag-slate',
};

export function JobCard({ job, matchScore }: JobCardProps) {
  const topApplicantScore = Math.max(...job.applicants.map((a) => a.score));
  const matchClasses = matchScore !== undefined ? getMatchColorClass(matchScore) : null;

  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:glow-violet group">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={`w-11 h-11 rounded-xl ${job.companyColor} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}
        >
          {job.companyInitials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-1">
            {job.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{job.company}</p>
        </div>

        {/* Match ring — only shown when a user profile is available */}
        {matchScore !== undefined && (
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <MatchRing score={matchScore} size={48} />
            <span className={`text-[9px] font-semibold ${matchClasses?.text}`}>
              {getMatchLabel(matchScore)}
            </span>
          </div>
        )}

        {matchScore === undefined && (
          <span className="text-xs text-slate-500 whitespace-nowrap">{timeAgo(job.postedAt)}</span>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={TYPE_BADGE[job.type]}>{job.type}</span>
        <span className="tag-slate">{job.location}</span>
        <span className="tag-slate">{job.salary}</span>
      </div>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-1.5">
        {job.techStack.slice(0, 5).map((t) => (
          <span key={t} className="tag-violet">{t}</span>
        ))}
        {job.techStack.length > 5 && (
          <span className="text-[11px] text-slate-500">+{job.techStack.length - 5}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-auto">
        <div className="text-xs text-slate-500">
          <span className="text-slate-300 font-medium">{job.applicants.length}</span> applicants
          {matchScore === undefined && (
            <>
              {' · '}top <span className="text-slate-300 font-medium">{topApplicantScore}</span>
            </>
          )}
          {matchScore !== undefined && (
            <span className="ml-1 text-slate-600">· {timeAgo(job.postedAt)}</span>
          )}
        </div>
        <Link
          href={`/jobs/${job.id}`}
          className="text-xs font-semibold text-violet-400 group-hover:text-violet-300 transition-colors"
        >
          View Job →
        </Link>
      </div>
    </div>
  );
}
