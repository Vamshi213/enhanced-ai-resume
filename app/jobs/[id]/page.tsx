import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJob, getJobsSortedByDate } from '@/lib/jobs';
import { ApplicationStatus } from '@/lib/types';

export async function generateStaticParams() {
  return getJobsSortedByDate().map((j) => ({ id: j.id }));
}

function statusBadge(status: ApplicationStatus): string {
  const map: Record<ApplicationStatus, string> = {
    screening: 'bg-gray-100 text-gray-600',
    interviewing: 'bg-blue-100 text-blue-700',
    offered: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
  };
  return map[status];
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-500';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 14) return '1w ago';
  return `${Math.floor(days / 7)}w ago`;
}

interface PageProps {
  params: { id: string };
}

export default function JobDetailPage({ params }: PageProps) {
  const job = getJob(params.id);
  if (!job) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Jobs</Link>
        <span>/</span>
        <span className="text-gray-700">{job.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Job header card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-start gap-5">
              <div className={`w-16 h-16 rounded-2xl ${job.companyColor} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                {job.companyInitials}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-gray-500 mt-1">{job.company} · {job.location}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-sm">
                  <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1">{job.type}</span>
                  <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1">{job.salary}</span>
                  <span className="bg-indigo-50 text-indigo-600 rounded-full px-3 py-1">
                    {job.applicants.length} applicants
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 flex gap-3">
              <Link
                href={`/analyze/${job.id}`}
                className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl text-center transition-colors"
              >
                Analyze My Resume Against This Role
              </Link>
            </div>
          </div>

          {/* Job description */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">About the role</h2>
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
            <ul className="space-y-3">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {i + 1}
                  </span>
                  {req}
                </li>
              ))}
            </ul>

            {job.niceToHave.length > 0 && (
              <>
                <h3 className="text-base font-semibold text-gray-900 mt-7 mb-3">Nice to have</h3>
                <ul className="space-y-2">
                  {job.niceToHave.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Tech stack */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {job.techStack.map((tech) => (
                <span
                  key={tech}
                  className="bg-indigo-50 text-indigo-700 rounded-lg px-3 py-1.5 text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Analyze CTA sticky card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">How do you stack up?</h3>
            <p className="text-indigo-200 text-sm mb-4 leading-relaxed">
              Paste your resume and get an AI score, skills gap analysis, and a
              recruiter-ready version optimized for this exact role.
            </p>
            <Link
              href={`/analyze/${job.id}`}
              className="block w-full bg-white text-indigo-700 font-semibold py-2.5 px-4 rounded-xl text-center hover:bg-indigo-50 transition-colors text-sm"
            >
              Analyze My Resume
            </Link>
          </div>

          {/* Applicants */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Applicants</h3>
              <span className="text-sm text-gray-400">{job.applicants.length} total</span>
            </div>
            <div className="space-y-4">
              {job.applicants
                .sort((a, b) => b.score - a.score)
                .map((applicant) => (
                  <div key={applicant.id} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                      {applicant.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {applicant.name}
                        </span>
                        <span className={`text-sm font-bold flex-shrink-0 ${scoreColor(applicant.score)}`}>
                          {applicant.score}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {applicant.headline}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs rounded-full px-2 py-0.5 font-medium capitalize ${statusBadge(applicant.status)}`}>
                          {applicant.status}
                        </span>
                        <span className="text-xs text-gray-300">{timeAgo(applicant.appliedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
