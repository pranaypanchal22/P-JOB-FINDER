import { JobExtractor, JobSearchInput, ExtractedJob } from './types'

export const csvImportExtractor: JobExtractor = {
  name: 'CSV Import',
  enabled: true,
  async search(_input: JobSearchInput): Promise<ExtractedJob[]> {
    // CSV import is handled via file upload, not search
    return []
  },
}

// CSV row validation - expects these columns at minimum
export interface CSVJobRow {
  title: string
  company: string
  location?: string
  url: string
  description?: string
  salary_min?: string
  salary_max?: string
  currency?: string
  employment_type?: string
  remote_type?: string
  posted_at?: string
}

export function parseCSVJobs(rows: CSVJobRow[]): ExtractedJob[] {
  return rows
    .filter((row) => row.title && row.company && row.url)
    .map((row) => ({
      source: 'csv-import',
      title: row.title.trim(),
      company: row.company.trim(),
      location: row.location?.trim(),
      url: row.url.trim(),
      description: row.description?.trim(),
      salaryMin: row.salary_min ? parseInt(row.salary_min, 10) : undefined,
      salaryMax: row.salary_max ? parseInt(row.salary_max, 10) : undefined,
      currency: row.currency?.toUpperCase(),
      employmentType: (row.employment_type?.toLowerCase() as any) || 'unknown',
      remoteType: (row.remote_type?.toLowerCase() as any) || 'unknown',
      postedAt: row.posted_at,
      raw: row,
    }))
}
