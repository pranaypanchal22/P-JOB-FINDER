export interface AIProvider {
  name: string
  configured: boolean
  scoreJob(input: ScoringInput): Promise<JobScore>
}

export interface ScoringInput {
  jobDescription: string
  jobTitle: string
  company: string
  profileSummary: string
  userSkills: string[]
}

export interface JobScore {
  fitScore: number
  rationale: string
  matchedSkills: string[]
  missingSkills: string[]
  concerns: string[]
  recommendation: 'save' | 'apply' | 'maybe' | 'skip'
  seniorityFit: 'too_junior' | 'good_fit' | 'stretch' | 'too_senior'
  roleCategory: 'devops' | 'sre' | 'cloud' | 'it_operations' | 'project_management' | 'software' | 'other'
}
