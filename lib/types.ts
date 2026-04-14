export type WorkType = 'Remote' | 'Hybrid' | 'On-site';
export type ApplicationStatus = 'screening' | 'interviewing' | 'offered' | 'rejected';
export type RecruiterLikelihood = 'Low' | 'Medium' | 'High' | 'Very High';

export interface Applicant {
  id: string;
  name: string;
  initials: string;
  score: number;
  appliedAt: string;
  status: ApplicationStatus;
  headline: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  companyColor: string;
  location: string;
  type: WorkType;
  salary: string;
  postedAt: string;
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

/** Extracted user profile stored in localStorage */
export interface UserProfile {
  name: string;
  title: string;
  yearsExperience: number;
  skills: string[];
  /** Domain tags: 'frontend' | 'backend' | 'fullstack' | 'ml' | 'devops' | 'leadership' | ... */
  domains: string[];
  education: string;
  resumeText: string;
  createdAt: string;
}
