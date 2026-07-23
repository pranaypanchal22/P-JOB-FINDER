import axios from 'axios'
import { JobExtractor, JobSearchInput, ExtractedJob } from './types'
import { logger } from '@/lib/logger'

interface USAJobsPosition {
  id: string
  position_title: string
  organization_name: string
  location_display: string
  positions: { location: { display: string } }[]
  salary_range_from?: number
  salary_range_to?: number
  minimum_pay?: number
  maximum_pay?: number
  job_summary: string
  url: string
  publication_start_date: string
}

interface USAJobsResponse {
  SearchResult: {
    SearchResultItems: Array<{ MatchedObjectDescriptor: USAJobsPosition }>
  }
}

export const usajobsExtractor: JobExtractor = {
  name: 'USAJobs',
  enabled: true,
  async search(input: JobSearchInput): Promise<ExtractedJob[]> {
    try {
      const params = {
        Keyword: input.query,
        LocationName: input.location || 'United States',
        CountrysCode: ['United States'],
        ResultsPerPage: 50,
      }

      const response = await axios.get('https://data.usajobs.gov/api/search', {
        params,
        headers: {
          'Authorization-Key': 'JobOps-JobFinder-Search',
        },
        timeout: 10000,
      })

      if (!response.data.SearchResult?.SearchResultItems || !Array.isArray(response.data.SearchResult.SearchResultItems)) {
        logger.warn('USAJobs: unexpected response format', response.data)
        return []
      }

      return (response.data as USAJobsResponse).SearchResult.SearchResultItems
        .map(item => item.MatchedObjectDescriptor)
        .filter((job: unknown) => isValidUSAJobsPosition(job))
        .slice(0, input.limit ?? 50)
        .map((job: USAJobsPosition) => ({
          source: 'usajobs',
          sourceJobId: job.id,
          title: job.position_title,
          company: job.organization_name,
          location: job.location_display || job.positions?.[0]?.location?.display || 'Remote',
          remoteType: 'unknown' as const,
          url: job.url,
          description: job.job_summary,
          postedAt: new Date(job.publication_start_date).toISOString(),
          salaryMin: job.minimum_pay || job.salary_range_from,
          salaryMax: job.maximum_pay || job.salary_range_to,
          currency: 'USD',
          raw: job,
        }))
    } catch (error) {
      logger.error('USAJobs extractor error', error)
      return []
    }
  },
}

function isValidUSAJobsPosition(job: unknown): job is USAJobsPosition {
  const j = job as USAJobsPosition
  return !!(
    j &&
    typeof j === 'object' &&
    j.id &&
    j.position_title &&
    j.organization_name &&
    j.url &&
    j.publication_start_date
  )
}
