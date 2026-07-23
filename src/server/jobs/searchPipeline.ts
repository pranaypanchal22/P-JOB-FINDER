import { ExtractedJob, JobSearchInput } from '@/server/extractors/types'
import { getEnabledExtractors } from '@/server/extractors/registry'
import { dedupeJobs } from './dedupe'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/db'

export interface SearchPipelineOptions {
  profileId: string
  recordRun?: boolean
}

export interface SearchPipelineResult {
  jobs: ExtractedJob[]
  runId: string
  stats: {
    jobsFound: number
    jobsCreated: number
    jobsDeduped: number
    sourcesQueried: string[]
    errors: Array<{ source: string; error: string }>
  }
}

export async function runSearchPipeline(
  input: JobSearchInput,
  options: SearchPipelineOptions
): Promise<SearchPipelineResult> {
  const startTime = Date.now()
  const errors: Array<{ source: string; error: string }> = []
  const sourcesQueried: string[] = []
  let allJobs: ExtractedJob[] = []

  const enabledExtractors = getEnabledExtractors()
  logger.info(`Starting search with ${enabledExtractors.length} extractors`, input)

  // Search with enabled extractors in parallel
  const results = await Promise.allSettled(
    enabledExtractors.map(async (extractor) => {
      try {
        logger.info(`Searching ${extractor.name}...`)
        const jobs = await extractor.search(input)
        sourcesQueried.push(extractor.name)
        logger.info(`${extractor.name} returned ${jobs.length} jobs`)
        return jobs
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        errors.push({ source: extractor.name, error: msg })
        logger.warn(`${extractor.name} error:`, msg)
        return []
      }
    })
  )

  // Flatten results
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allJobs = allJobs.concat(result.value)
    }
  }

  logger.info(`Total jobs found: ${allJobs.length}`)

  // Dedupe
  const { unique, duplicates } = dedupeJobs(allJobs)
  logger.info(
    `Dedupe: ${unique.length} unique, ${duplicates.length} duplicates removed`
  )

  // Save to database
  let jobsCreated = 0
  const jobIds: string[] = []

  for (const job of unique) {
    try {
      const existingJob = await prisma.job.findFirst({
        where: {
          AND: [
            { source: job.source },
            job.sourceJobId
              ? { sourceJobId: job.sourceJobId }
              : { url: job.url },
          ],
        },
      })

      if (!existingJob) {
        const created = await prisma.job.create({
          data: {
            source: job.source,
            sourceJobId: job.sourceJobId,
            title: job.title,
            company: job.company,
            normalizedTitle: job.title.toLowerCase().trim(),
            normalizedCompany: job.company.toLowerCase().trim(),
            location: job.location,
            remoteType: job.remoteType || 'unknown',
            employmentType: job.employmentType || 'unknown',
            description: job.description,
            url: job.url,
            applyUrl: job.applyUrl,
            postedAt: job.postedAt ? new Date(job.postedAt) : undefined,
            discoveredAt: new Date(),
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            currency: job.currency,
            rawJson: JSON.stringify(job.raw || {}),
          },
        })
        jobIds.push(created.id)
        jobsCreated++
      } else {
        jobIds.push(existingJob.id)
      }
    } catch (error) {
      logger.error('Error saving job', { error, job })
    }
  }

  // Record extractor run
  let runId = 'unknown'
  if (options.recordRun) {
    try {
      const run = await prisma.extractorRun.create({
        data: {
          source: sourcesQueried.join(','),
          query: input.query,
          filtersJson: JSON.stringify({
            location: input.location,
            remote: input.remote,
            roleTypes: input.roleTypes,
            datePosted: input.datePosted,
          }),
          status: 'completed',
          jobsFound: allJobs.length,
          jobsCreated,
          jobsDeduped: duplicates.length,
          errorMessage: errors.length > 0 ? JSON.stringify(errors) : null,
          finishedAt: new Date(),
        },
      })
      runId = run.id
    } catch (error) {
      logger.error('Error recording extractor run', error)
    }
  }

  const duration = Date.now() - startTime
  logger.info(`Search pipeline complete in ${duration}ms`, {
    jobsFound: allJobs.length,
    jobsCreated,
    jobsDeduped: duplicates.length,
  })

  return {
    jobs: unique,
    runId,
    stats: {
      jobsFound: allJobs.length,
      jobsCreated,
      jobsDeduped: duplicates.length,
      sourcesQueried,
      errors,
    },
  }
}
