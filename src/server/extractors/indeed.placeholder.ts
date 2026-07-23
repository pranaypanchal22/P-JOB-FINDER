import { JobExtractor, JobSearchInput, ExtractedJob } from './types'

export const indeedExtractor: JobExtractor = {
  name: 'Indeed',
  enabled: false,
  async search(_input: JobSearchInput): Promise<ExtractedJob[]> {
    throw new Error(
      'Indeed integration is disabled. Indeed does not provide a public API and scraping their site violates their terms of service. ' +
      'Please use RemoteOK, Adzuna, or manual job entry instead.'
    )
  },
}
