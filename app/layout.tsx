import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'ResumeAI — Land every recruiter call',
  description:
    'AI-powered resume scoring, personalized job recommendations, and formatted resumes tailored to specific job descriptions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Global background gradient */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% -5%, rgba(124,58,237,0.22) 0%, transparent 55%), radial-gradient(ellipse at 85% 95%, rgba(6,182,212,0.07) 0%, transparent 45%)',
            zIndex: 0,
          }}
        />
        {/* Dot grid */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            zIndex: 0,
          }}
        />

        {/* Nav */}
        <header
          className="sticky top-0 z-50"
          style={{
            background: 'rgba(7,8,15,0.8)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-15 py-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-bold text-white text-base tracking-tight">ResumeAI</span>
            </Link>

            <nav className="flex items-center gap-2">
              <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">
                Jobs
              </Link>
              <Link
                href="/onboarding"
                className="btn-primary text-sm px-4 py-1.5"
              >
                My Profile
              </Link>
            </nav>
          </div>
        </header>

        <main className="relative z-10">{children}</main>

        <footer className="relative z-10 mt-24 border-t border-white/[0.06]">
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between text-xs text-slate-600"
          >
            <span>ResumeAI — built to help every candidate land the interview they deserve.</span>
            <Link href="/onboarding" className="text-violet-500 hover:text-violet-400 transition-colors">
              Build your profile →
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
