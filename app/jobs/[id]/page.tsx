import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJob, getJobsSortedByDate } from '@/lib/jobs';
import { ApplicationStatus } from '@/lib/types';

export async function generateStaticParams() {
  return getJobsSortedByDate().map((j) => ({ id: j.id }));
}

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  screening: 'tag-slate',
  interviewing: 'tag-cyan',
  offered: 'tag-green',
  rejected: 'tag-red',
};

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 65) return 'text-indigo-400';
  if (score >= 45) return 'text-amber-400';
  return 'text-red-400';
}

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
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
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link href="/" className="hover:text-slate-300 transition-colors">Jobs</Link>
        <span>/</span>
        <span className="text-slate-300">{job.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="glass rounded-2xl p-7">
            <div className="flex items-start gap-5">
              <div
                className={`w-14 h-14 rounded-2xl ${job.companyColor} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}
              >
                {job.companyInitials}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                <p className="text-slate-400 mt-1">{job.company} · {job.location}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="tag-slate">{job.type}</span>
                  <span className="tag-slate">{job.salary}</span>
                  <span className="tag-violet">{job.applicants.length} applicants</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`/analyze/${job.id}`}
                className="btn-primary text-sm px-6 py-2.5 inline-flex"
              >
                Analyze my resume against this role →
              </Link>
            </div>
          </div>

          {/* Description */}
          <div className="glass rounded-2xl p-7">
            <h2 className="text-base font-bold text-white mb-4">About the role</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="glass rounded-2xl p-7">
            <h2 className="text-base font-bold text-white mb-4">Requirements</h2>
            <ul className="space-y-3">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span
                    className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-violet-300"
                    style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}
                  >
                    {i + 1}
                  </span>
                  {req}
                </li>
              ))}
            </ul>

            {job.niceToHave.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-slate-300 mt-7 mb-3">Nice to have</h3>
                <ul className="space-y-2">
                  {job.niceToHave.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-500">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Tech stack */}
          <div className="glass rounded-2xl p-7">
            <h2 className="text-base font-bold text-white mb-4">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {job.techStack.map((t) => (
                <span key={t} className="tag-violet text-sm px-3 py-1">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Analyze CTA */}
          <div
            className="rounded-2xl p-6 text-white"
            style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.9),rgba(79,70,229,0.9))', border: '1px solid rgba(139,92,246,0.4)' }}
          >
            <h3 className="font-bold text-lg mb-2">How do you stack up?</h3>
            <p className="text-violet-200 text-sm mb-4 leading-relaxed">
              Get an AI score, skills gap analysis, and a recruiter-ready resume
              tailored to this exact role.
            </p>
            <Link
              href={`/analyze/${job.id}`}
              className="block w-full text-center font-semibold py-2.5 px-4 rounded-xl text-sm text-violet-700 transition-all hover:-translate-y-0.5"
              style={{ background: '#fff' }}
            >
              Analyze my resume
            </Link>
          </div>

          {/* Applicants */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">Applicants</h3>
              <span className="text-xs text-slate-500">{job.applicants.length} total</span>
            </div>
            <div className="space-y-4">
              {job.applicants
                .sort((a, b) => b.score - a.score)
                .map((applicant) => (
                  <div key={applicant.id} className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.07)', color: '#94a3b8' }}
                    >
                      {applicant.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-white truncate">{applicant.name}</span>
                        <span className={`text-sm font-bold flex-shrink-0 ${scoreColor(applicant.score)}`}>
                          {applicant.score}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {applicant.headline}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`${STATUS_STYLE[applicant.status]} capitalize`}>
                          {applicant.status}
                        </span>
                        <span className="text-xs text-slate-600">{timeAgo(applicant.appliedAt)}</span>
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
