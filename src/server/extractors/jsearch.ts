import axios from 'axios'
import { JobExtractor, JobSearchInput, ExtractedJob } from './types'
import { logger } from '../../lib/logger'

interface JSearchJob {
  job_id: string
  job_title: string
  employer_name: string
  job_location: string
  job_description: string
  job_apply_link: string
  job_posted_at_datetime_utc: string
  job_salary_currency?: string
  job_salary_period?: string
  job_salary_min?: number
  job_salary_max?: number
}

interface JSearchResponse {
  data: JSearchJob[]
}

export const jsearchExtractor: JobExtractor = {
  name: 'JSearch',
  enabled: true,
  async search(input: JobSearchInput): Promise<ExtractedJob[]> {
    try {
      const apiKey = process.env.JSEARCH_API_KEY
      if (!apiKey) {
        logger.warn('JSearch: API key not configured')
        return []
      }

      const datePostedMap: { [key: string]: string } = {
        '24h': 'last_24_hours',
        '7d': 'last_7_days',
        '30d': 'last_30_days',
        any: 'all',
      }

      const params = {
        query: input.query,
        page: 1,
        num_pages: 1,
        date_posted: datePostedMap[input.datePosted || 'any'] || 'all',
      }

      if (input.location) {
        params.query = `${input.query} ${input.location}`
      }

      const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
        params,
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
        timeout: 15000,
      })

      logger.info('JSearch response:', {
        hasData: !!response.data?.data,
        isArray: Array.isArray(response.data?.data),
        dataLength: response.data?.data?.length,
        responseKeys: Object.keys(response.data || {}),
      })

      if (!response.data?.data || !Array.isArray(response.data.data)) {
        logger.warn('JSearch: unexpected response format', response.data)
        return []
      }

      return (response.data as JSearchResponse).data
        .filter((job: unknown) => isValidJSearchJob(job))
        .slice(0, input.limit ?? 50)
        .map((job: JSearchJob) => ({
          source: 'jsearch',
          sourceJobId: job.job_id,
          title: job.job_title,
          company: job.employer_name,
          location: job.job_location,
          remoteType: 'unknown' as const,
          url: job.job_apply_link,
          description: job.job_description,
          postedAt: job.job_posted_at_datetime_utc
            ? new Date(job.job_posted_at_datetime_utc).toISOString()
            : new Date().toISOString(),
          salaryMin: job.job_salary_min,
          salaryMax: job.job_salary_max,
          currency: job.job_salary_currency || 'USD',
          raw: job,
        }))
    } catch (error) {
      logger.error('JSearch extractor error', error)
      return []
    }
  },
}

function isValidJSearchJob(job: unknown): job is JSearchJob {
  const j = job as JSearchJob
  return !!(
    j &&
    typeof j === 'object' &&
    j.job_id &&
    j.job_title &&
    j.employer_name &&
    j.job_location
  )
}
