'use client';

import Link from 'next/link';
import { UserProfile } from '@/lib/types';

interface ProfileCardProps {
  profile: UserProfile;
  compact?: boolean;
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function ProfileCard({ profile, compact = false }: ProfileCardProps) {
  if (compact) {
    return (
      <div className="glass rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
          {initials(profile.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{profile.name}</p>
          <p className="text-xs text-slate-400 truncate">{profile.title}</p>
        </div>
        <Link href="/onboarding" className="btn-ghost text-xs px-3 py-1.5 flex-shrink-0">
          Update
        </Link>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
        >
          {initials(profile.name)}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base">{profile.name}</h3>
          <p className="text-slate-400 text-sm mt-0.5">{profile.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="tag-violet">{profile.yearsExperience} yrs exp</span>
            {profile.domains.slice(0, 2).map((d) => (
              <span key={d} className="tag-slate capitalize">{d}</span>
            ))}
          </div>
        </div>

        <Link
          href="/onboarding"
          className="btn-ghost text-xs px-3 py-1.5 flex-shrink-0"
        >
          Update profile
        </Link>
      </div>

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/[0.07]">
          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Top skills</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.slice(0, 8).map((s) => (
              <span key={s} className="tag-violet">{s}</span>
            ))}
            {profile.skills.length > 8 && (
              <span className="tag-slate">+{profile.skills.length - 8} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
