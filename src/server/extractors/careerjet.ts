import axios from 'axios'
import { JobExtractor, JobSearchInput, ExtractedJob } from './types'
import { logger } from '../../lib/logger'

interface CareerJetJob {
  id: string
  title: string
  company: string
  locations: { location: string }[]
  salary_currency_code?: string
  salary_min?: number
  salary_max?: number
  description: string
  url: string
  date: number
}

export const careerjetExtractor: JobExtractor = {
  name: 'CareerJet',
  enabled: true,
  async search(input: JobSearchInput): Promise<ExtractedJob[]> {
    try {
      const params = {
        keywords: input.query,
        location: input.location || 'USA',
        page: 1,
        pagesize: 50,
      }

      const response = await axios.get('https://public.api.careerjet.net/search', {
        params,
        timeout: 10000,
      })

      if (!response.data.jobs || !Array.isArray(response.data.jobs)) {
        logger.warn('CareerJet: unexpected response format', response.data)
        return []
      }

      return response.data.jobs
        .filter((job: unknown) => isValidCareerJetJob(job))
        .slice(0, input.limit ?? 50)
        .map((job: CareerJetJob) => ({
          source: 'careerjet',
          sourceJobId: job.id,
          title: job.title,
          company: job.company,
          location: job.locations?.[0]?.location || '',
          remoteType: 'unknown' as const,
          url: job.url,
          description: job.description,
          postedAt: new Date(job.date * 1000).toISOString(),
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          currency: job.salary_currency_code,
          raw: job,
        }))
    } catch (error) {
      logger.error('CareerJet extractor error', error)
      return []
    }
  },
}

function isValidCareerJetJob(job: unknown): job is CareerJetJob {
  const j = job as CareerJetJob
  return !!(j && typeof j === 'object' && j.id && j.title && j.company && j.url && typeof j.date === 'number')
}
