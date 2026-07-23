export type RemoteType = 'remote' | 'hybrid' | 'onsite' | 'unknown'
export type EmploymentType = 'internship' | 'co-op' | 'full-time' | 'contract' | 'part-time' | 'unknown'

export interface JobSearchInput {
  query: string
  location?: string
  remote?: boolean
  roleTypes?: string[]
  datePosted?: 'any' | '24h' | '7d' | '30d'
  limit?: number
}

export interface ExtractedJob {
  source: string
  sourceJobId?: string
  title: string
  company: string
  location?: string
  remoteType?: RemoteType
  employmentType?: EmploymentType
  url: string
  applyUrl?: string
  description?: string
  postedAt?: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  raw?: unknown
}

export interface JobExtractor {
  name: string
  enabled: boolean
  search(input: JobSearchInput): Promise<ExtractedJob[]>
}
