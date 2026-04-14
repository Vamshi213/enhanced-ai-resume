import { Job, UserProfile } from './types';

/**
 * Client-side job match scorer — zero AI tokens.
 * Weights: 60% skill overlap, 25% experience level fit, 15% domain alignment.
 */
export function scoreJobForProfile(job: Job, profile: UserProfile): number {
  const profileSkills = new Set(profile.skills.map((s) => s.toLowerCase().trim()));

  // 60% — skill overlap
  const required = job.techStack;
  const matched = required.filter((s) => profileSkills.has(s.toLowerCase().trim())).length;
  const skillScore = required.length > 0 ? Math.round((matched / required.length) * 100) : 50;

  // 25% — experience level fit
  const levelScore = calcLevelScore(job.title, profile.yearsExperience);

  // 15% — domain alignment
  const domainScore = calcDomainScore(job, profile.domains);

  return Math.min(100, Math.round(skillScore * 0.6 + levelScore * 0.25 + domainScore * 0.15));
}

function calcLevelScore(title: string, years: number): number {
  const t = title.toLowerCase();
  if (t.includes('staff') || t.includes('principal')) {
    return years >= 8 ? 100 : years >= 6 ? 72 : 38;
  }
  if (t.includes('senior') || t.includes('lead') || t.includes('manager')) {
    return years >= 5 ? 100 : years >= 3 ? 78 : 48;
  }
  if (t.includes('junior') || t.includes('associate')) {
    return years <= 2 ? 100 : years <= 4 ? 72 : 50;
  }
  // mid-level default
  if (years >= 3 && years <= 7) return 100;
  return years >= 1 ? 72 : 45;
}

function calcDomainScore(job: Job, profileDomains: string[]): number {
  if (!profileDomains.length) return 50;
  const jobDomains = inferDomains(job);
  const overlap = profileDomains.filter((d) => jobDomains.includes(d)).length;
  return overlap > 0 ? Math.min(100, Math.round((overlap / Math.max(jobDomains.length, 1)) * 130)) : 30;
}

function inferDomains(job: Job): string[] {
  const text = (job.title + ' ' + job.description).toLowerCase();
  const d: string[] = [];
  if (/frontend|react|vue|angular|ui.ux|css/.test(text)) d.push('frontend');
  if (/backend|api|server|microservice|database|postgres|mysql/.test(text)) d.push('backend');
  if (/full.?stack/.test(text)) d.push('frontend', 'backend', 'fullstack');
  if (/machine.?learn|ml\b|deep.?learn|nlp|llm|pytorch|tensorflow|jax/.test(text)) d.push('ml', 'ai');
  if (/devops|sre\b|infrastructure|kubernetes|terraform|reliability/.test(text)) d.push('devops', 'infra');
  if (/staff|principal|architect|platform/.test(text)) d.push('leadership');
  return d.length ? [...new Set(d)] : ['engineering'];
}

export function getMatchLabel(score: number): string {
  if (score >= 80) return 'Strong match';
  if (score >= 65) return 'Good match';
  if (score >= 45) return 'Partial match';
  return 'Low match';
}

export function getMatchColor(score: number): string {
  if (score >= 80) return '#34d399'; // emerald
  if (score >= 65) return '#818cf8'; // indigo
  if (score >= 45) return '#fbbf24'; // amber
  return '#f87171'; // red
}

/** Same colours expressed as Tailwind-compatible hex for text/bg usage */
export function getMatchColorClass(score: number): { text: string; bg: string; border: string } {
  if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
  if (score >= 65) return { text: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' };
  if (score >= 45) return { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
  return { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
}
