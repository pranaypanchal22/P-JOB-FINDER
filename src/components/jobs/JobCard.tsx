'use client'

import { Job } from '@prisma/client'
import { formatCurrency, formatRelativeTime } from '../../lib/utils'
import { Briefcase, MapPin, DollarSign, Calendar, ExternalLink } from 'lucide-react'

interface JobCardProps {
  job: Job
  onSelect: (job: Job) => void
  isSelected: boolean
}

export function JobCard({ job, onSelect, isSelected }: JobCardProps) {
  return (
    <div
      onClick={() => onSelect(job)}
      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
        isSelected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {job.company}
          </p>
        </div>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </a>
      </div>

      <div className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400">
        {job.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{job.location}</span>
          </div>
        )}

        {job.remoteType !== 'unknown' && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span className="capitalize">{job.remoteType}</span>
          </div>
        )}

        {(job.salaryMin || job.salaryMax) && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>
              {job.salaryMin && formatCurrency(job.salaryMin, job.currency || 'USD')}{' '}
              {job.salaryMax && `- ${formatCurrency(job.salaryMax, job.currency || 'USD')}`}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {job.postedAt
              ? formatRelativeTime(job.postedAt)
              : formatRelativeTime(job.discoveredAt)}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Source: {job.source}
        </span>
      </div>
    </div>
  )
}
