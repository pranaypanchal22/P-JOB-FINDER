'use client'

import { useState } from 'react'
import { Job } from '@prisma/client'
import { JobSearchForm } from '../../components/jobs/JobSearchForm'
import { JobCard } from '../../components/jobs/JobCard'
import { logger } from '../../lib/logger'

interface SearchResult {
  success: boolean
  jobs: Job[]
  stats: {
    jobsFound: number
    jobsCreated: number
    jobsDeduped: number
    sourcesQueried: string[]
    errors: Array<{ source: string; error: string }>
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<SearchResult['stats'] | null>(null)

  async function handleSearch(data: any) {
    setIsLoading(true)
    setJobs([])
    setSelectedJob(null)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const result: SearchResult = await response.json()

      if (result.success) {
        setJobs(result.jobs)
        setStats(result.stats)
        logger.info(`Found ${result.jobs.length} jobs`, result.stats)
      } else {
        logger.error('Search returned error', result)
      }
    } catch (error) {
      logger.error('Search error', error)
      alert(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jobs</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Search and manage job opportunities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Search
            </h2>
            <JobSearchForm onSearch={handleSearch} isLoading={isLoading} />

            {/* Stats */}
            {stats && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Total found:</span>
                    <strong className="text-gray-900 dark:text-white">{stats.jobsFound}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Newly saved:</span>
                    <strong className="text-gray-900 dark:text-white">{stats.jobsCreated}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicates:</span>
                    <strong className="text-gray-900 dark:text-white">{stats.jobsDeduped}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Sources:</span>
                    <strong className="text-gray-900 dark:text-white">{stats.sourcesQueried.length}</strong>
                  </div>
                </div>

                {stats.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 rounded text-sm text-red-700 dark:text-red-200">
                    <p className="font-medium">Errors:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      {stats.errors.map((err, i) => (
                        <li key={i}>{err.source}: {err.error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Jobs List and Detail */}
        <div className="lg:col-span-2">
          {jobs.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>Search for jobs to get started</p>
            </div>
          )}

          {jobs.length > 0 && (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSelect={setSelectedJob}
                  isSelected={selectedJob?.id === job.id}
                />
              ))}
            </div>
          )}

          {/* Selected Job Detail */}
          {selectedJob && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedJob.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {selectedJob.company}
                </p>

                {selectedJob.description && (
                  <div className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                    {selectedJob.description}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <a
                    href={selectedJob.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
                  >
                    View on Site
                  </a>
                  {selectedJob.applyUrl && (
                    <a
                      href={selectedJob.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg font-medium"
                    >
                      Apply
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
