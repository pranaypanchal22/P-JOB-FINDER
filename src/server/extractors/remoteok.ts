import axios from 'axios'
import { JobExtractor, JobSearchInput, ExtractedJob } from './types'
import { logger } from '@/lib/logger'

const REMOTEOK_API = 'https://remoteok.io/api'

interface RemoteOKJob {
  id: string
  slug: string
  job_title: string
  company_name: string
  location?: string
  date_posted: number
  url: string
  description: string
  salary_min?: number
  salary_max?: number
  currency?: string
}

export const remoteOkExtractor: JobExtractor = {
  name: 'RemoteOK',
  enabled: true,
  async search(input: JobSearchInput): Promise<ExtractedJob[]> {
    try {
      const params = new URLSearchParams()
      params.append('api_token', 'a')
      params.append('search', input.query)

      if (input.location && !input.remote) {
        params.append('location', input.location)
      }

      const response = await axios.get(`${REMOTEOK_API}`, {
        params: Object.fromEntries(params),
        timeout: 10000,
      })

      if (!Array.isArray(response.data)) {
        logger.warn('RemoteOK: unexpected response format', response.data)
        return []
      }

      return response.data
        .filter((job: unknown) => isValidRemoteOKJob(job))
        .slice(0, input.limit ?? 50)
        .map((job: RemoteOKJob) => ({
          source: 'remoteok',
          sourceJobId: job.id,
          title: job.job_title,
          company: job.company_name,
          location: job.location,
          remoteType: 'remote',
          url: `https://remoteok.io/${job.slug}`,
          description: job.description,
          postedAt: new Date(job.date_posted * 1000).toISOString(),
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          currency: job.currency,
          raw: job,
        }))
    } catch (error) {
      logger.error('RemoteOK extractor error', error)
      return []
    }
  },
}

function isValidRemoteOKJob(job: unknown): job is RemoteOKJob {
  const j = job as RemoteOKJob
  return !!(
    j &&
    typeof j === 'object' &&
    j.id &&
    j.job_title &&
    j.company_name &&
    j.url &&
    typeof j.date_posted === 'number'
  )
}
