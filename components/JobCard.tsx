import Link from 'next/link';
import { Job } from '@/lib/types';

interface JobCardProps {
  job: Job;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
}

function typeBadge(type: Job['type']): string {
  const map: Record<Job['type'], string> = {
    Remote: 'bg-green-50 text-green-700 border-green-200',
    Hybrid: 'bg-blue-50 text-blue-700 border-blue-200',
    'On-site': 'bg-gray-50 text-gray-600 border-gray-200',
  };
  return map[type];
}

export function JobCard({ job }: JobCardProps) {
  const topScore = Math.max(...job.applicants.map((a) => a.score));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col p-6 gap-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${job.companyColor} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
          {job.companyInitials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base leading-snug">{job.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(job.postedAt)}</span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`border rounded-full px-2.5 py-0.5 font-medium ${typeBadge(job.type)}`}>
          {job.type}
        </span>
        <span className="bg-gray-50 border border-gray-200 text-gray-600 rounded-full px-2.5 py-0.5">
          {job.location}
        </span>
        <span className="bg-gray-50 border border-gray-200 text-gray-600 rounded-full px-2.5 py-0.5">
          {job.salary}
        </span>
      </div>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-1.5">
        {job.techStack.slice(0, 5).map((tech) => (
          <span key={tech} className="text-xs bg-indigo-50 text-indigo-700 rounded-md px-2 py-0.5 font-medium">
            {tech}
          </span>
        ))}
        {job.techStack.length > 5 && (
          <span className="text-xs text-gray-400">+{job.techStack.length - 5} more</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
        <div className="text-xs text-gray-400">
          <span className="font-medium text-gray-600">{job.applicants.length}</span> applicants
          {' · '}top match <span className="font-medium text-gray-700">{topScore}</span>
        </div>
        <Link
          href={`/jobs/${job.id}`}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View Job →
        </Link>
      </div>
    </div>
  );
}
