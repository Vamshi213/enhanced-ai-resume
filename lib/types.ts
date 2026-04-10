export type WorkType = 'Remote' | 'Hybrid' | 'On-site';
export type ApplicationStatus = 'screening' | 'interviewing' | 'offered' | 'rejected';
export type RecruiterLikelihood = 'Low' | 'Medium' | 'High' | 'Very High';

export interface Applicant {
  id: string;
  name: string;
  initials: string;
  score: number;
  appliedAt: string; // ISO date string
  status: ApplicationStatus;
  headline: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  companyColor: string; // Tailwind bg color class
  location: string;
  type: WorkType;
  salary: string;
  postedAt: string; // ISO date string
  description: string;
  requirements: string[];
  niceToHave: string[];
  techStack: string[];
  applicants: Applicant[];
}

export interface ScoreBreakdown {
  skillsMatch: number;
  experienceRelevance: number;
  impactQuantification: number;
  formatting: number;
  keywordOptimization: number;
}

export interface AnalysisResult {
  score: number;
  breakdown: ScoreBreakdown;
  recruiterLikelihood: RecruiterLikelihood;
  strengths: string[];
  missingSkills: string[];
  suggestions: string[];
  formattedResume: string;
}
