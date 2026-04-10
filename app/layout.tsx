import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'ResumeAI – Land Every Recruiter Call',
  description:
    'Match your resume to any job description, get an AI score, and receive a recruiter-ready formatted resume.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 text-lg">ResumeAI</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-gray-900 transition-colors">Jobs</Link>
              <a
                href="https://github.com/vamshi213/enhanced-ai-resume"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-24 border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-400">
            ResumeAI — built to help every candidate land the interview they deserve.
          </div>
        </footer>
      </body>
    </html>
  );
}
