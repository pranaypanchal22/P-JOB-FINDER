import { JobExtractor, JobSearchInput, ExtractedJob } from './types'

export const glassdoorExtractor: JobExtractor = {
  name: 'Glassdoor',
  enabled: false,
  async search(_input: JobSearchInput): Promise<ExtractedJob[]> {
    throw new Error(
      'Glassdoor integration is disabled. Glassdoor does not provide a public API and actively blocks automated access. ' +
      'Scraping Glassdoor violates their terms of service. ' +
      'Please use RemoteOK, Adzuna, or manual job entry instead.'
    )
  },
}
