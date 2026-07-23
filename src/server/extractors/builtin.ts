import axios from 'axios'
import { JobExtractor, JobSearchInput, ExtractedJob } from './types'
import { logger } from '@/lib/logger'

interface BuiltInJob {
  id: string
  title: string
  company: {
    name: string
  }
  locations: Array<{ name: string }>
  description: string
  job_url: string
  posted_at: string
  salary_min?: number
  salary_max?: number
}

export const builtinExtractor: JobExtractor = {
  name: 'BuiltIn',
  enabled: true,
  async search(input: JobSearchInput): Promise<ExtractedJob[]> {
    try {
      const params = {
        keywords: input.query,
        locations: input.location || 'all',
        limit: input.limit ?? 50,
      }

      const response = await axios.get('https://api.builtin.com/jobs/search', {
        params,
        timeout: 10000,
      })

      if (!response.data.jobs || !Array.isArray(response.data.jobs)) {
        logger.warn('BuiltIn: unexpected response format', response.data)
        return []
      }

      return response.data.jobs
        .filter((job: unknown) => isValidBuiltInJob(job))
        .slice(0, input.limit ?? 50)
        .map((job: BuiltInJob) => ({
          source: 'builtin',
          sourceJobId: job.id,
          title: job.title,
          company: job.company.name,
          location: job.locations?.[0]?.name || 'Remote',
          remoteType: 'unknown' as const,
          url: job.job_url,
          description: job.description,
          postedAt: new Date(job.posted_at).toISOString(),
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          currency: 'USD',
          raw: job,
        }))
    } catch (error) {
      logger.error('BuiltIn extractor error', error)
      return []
    }
  },
}

function isValidBuiltInJob(job: unknown): job is BuiltInJob {
  const j = job as BuiltInJob
  return !!(
    j &&
    typeof j === 'object' &&
    j.id &&
    j.title &&
    j.company?.name &&
    j.job_url &&
    j.posted_at
  )
}
