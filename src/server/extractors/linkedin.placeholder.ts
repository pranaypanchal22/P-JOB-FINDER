import { JobExtractor, JobSearchInput, ExtractedJob } from './types'

export const linkedinExtractor: JobExtractor = {
  name: 'LinkedIn',
  enabled: false,
  async search(_input: JobSearchInput): Promise<ExtractedJob[]> {
    throw new Error(
      'LinkedIn integration is disabled. LinkedIn prohibits automated scraping and has legal terms against it. ' +
      'LinkedIn job board scraping violates their User Agreement and has resulted in lawsuits. ' +
      'Please use official LinkedIn API (if available for your use case), RemoteOK, Adzuna, or manual job entry instead.'
    )
  },
}
