import { getJobsSortedByDate } from '@/lib/jobs';
import { JobList } from '@/components/JobList';

export default function DashboardPage() {
  const jobs = getJobsSortedByDate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Find your next role.{' '}
          <span className="text-indigo-600">Nail the resume.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Browse open positions, analyze your resume against any job description,
          and get an AI-optimized resume that gets recruiter callbacks.
        </p>

        {/* Stats bar */}
        <div className="mt-8 inline-flex items-center gap-8 bg-white border border-gray-100 rounded-2xl px-8 py-4 shadow-sm text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{jobs.length}</div>
            <div className="text-gray-400">Open roles</div>
          </div>
          <div className="w-px h-10 bg-gray-100" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {jobs.reduce((s, j) => s + j.applicants.length, 0)}
            </div>
            <div className="text-gray-400">Active applicants</div>
          </div>
          <div className="w-px h-10 bg-gray-100" />
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">AI</div>
            <div className="text-gray-400">Resume scoring</div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            step: '01',
            title: 'Browse jobs',
            desc: 'See all open positions sorted newest first with full job descriptions.',
          },
          {
            step: '02',
            title: 'Paste your resume',
            desc: 'Drop your resume text into the analyzer for any role that interests you.',
          },
          {
            step: '03',
            title: 'Get your score + fix',
            desc: 'Receive a match score, gap analysis, and a recruiter-ready formatted resume.',
          },
        ].map(({ step, title, desc }) => (
          <div key={step} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="text-xs font-bold text-indigo-400 mb-2">{step}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Job listings */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Latest openings</h2>
        <JobList jobs={jobs} />
      </div>
    </div>
  );
}
