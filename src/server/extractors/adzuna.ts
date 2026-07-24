import axios from 'axios'
import { JobExtractor, JobSearchInput, ExtractedJob } from './types'
import { logger } from '../../lib/logger'
import { getEnv } from '../../lib/env'

const ADZUNA_API = 'https://api.adzuna.com/v1/api/jobs/gb/search/1'

interface AdzunaJob {
  id: string
  title: string
  company: { display_name: string }
  location: { display_name: string }
  description: string
  created: string
  redirect_url: string
  salary_min?: number
  salary_max?: number
  salary_currency?: string
}

export const adzunaExtractor: JobExtractor = {
  name: 'Adzuna',
  get enabled() {
    const env = getEnv()
    return !!(env.ADZUNA_APP_ID && env.ADZUNA_APP_KEY)
  },
  async search(input: JobSearchInput): Promise<ExtractedJob[]> {
    const env = getEnv()

    if (!env.ADZUNA_APP_ID || !env.ADZUNA_APP_KEY) {
      logger.warn('Adzuna: API keys not configured')
      return []
    }

    try {
      const params = {
        app_id: env.ADZUNA_APP_ID,
        app_key: env.ADZUNA_APP_KEY,
        results_per_page: input.limit ?? 50,
        what: input.query,
        where: input.location || '',
      }

      const response = await axios.get<{
        results: AdzunaJob[]
      }>(ADZUNA_API, { params, timeout: 10000 })

      return response.data.results
        .filter((job) => isValidAdzunaJob(job))
        .map((job) => ({
          source: 'adzuna',
          sourceJobId: job.id,
          title: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          url: job.redirect_url,
          description: job.description,
          postedAt: job.created,
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          currency: job.salary_currency,
          raw: job,
        }))
    } catch (error) {
      logger.error('Adzuna extractor error', error)
      return []
    }
  },
}

function isValidAdzunaJob(job: unknown): job is AdzunaJob {
  const j = job as AdzunaJob
  return !!(
    j &&
    typeof j === 'object' &&
    j.id &&
    j.title &&
    j.company?.display_name &&
    j.redirect_url
  )
}
