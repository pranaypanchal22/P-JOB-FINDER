import axios from 'axios'
import { JobExtractor, JobSearchInput, ExtractedJob } from './types'
import { logger } from '@/lib/logger'

interface AngelListJob {
  id: string
  title: string
  startup: {
    name: string
    location?: string
  }
  job_type: string
  description: string
  url: string
  created_at: string
  equity_min?: number
  equity_max?: number
  salary_min?: number
  salary_max?: number
  salary_currency?: string
}

interface AngelListResponse {
  jobs: AngelListJob[]
}

export const angellistExtractor: JobExtractor = {
  name: 'AngelList',
  enabled: true,
  async search(input: JobSearchInput): Promise<ExtractedJob[]> {
    try {
      const params = {
        query: input.query,
        location: input.location || 'United States',
      }

      const response = await axios.get('https://api.angel.co/1/search/jobs', {
        params,
        timeout: 10000,
      })

      if (!response.data.jobs || !Array.isArray(response.data.jobs)) {
        logger.warn('AngelList: unexpected response format', response.data)
        return []
      }

      return (response.data as AngelListResponse).jobs
        .filter((job: unknown) => isValidAngelListJob(job))
        .filter((job: AngelListJob) => job.job_type === 'Remote')
        .slice(0, input.limit ?? 50)
        .map((job: AngelListJob) => ({
          source: 'angellist',
          sourceJobId: job.id,
          title: job.title,
          company: job.startup.name,
          location: job.startup.location || 'Remote',
          remoteType: 'remote' as const,
          url: job.url,
          description: job.description,
          postedAt: new Date(job.created_at).toISOString(),
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          currency: job.salary_currency || 'USD',
          raw: job,
        }))
    } catch (error) {
      logger.error('AngelList extractor error', error)
      return []
    }
  },
}

function isValidAngelListJob(job: unknown): job is AngelListJob {
  const j = job as AngelListJob
  return !!(
    j &&
    typeof j === 'object' &&
    j.id &&
    j.title &&
    j.startup?.name &&
    j.url &&
    j.created_at
  )
}
