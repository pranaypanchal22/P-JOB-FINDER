'use client'

import { Application, Job } from '@prisma/client'
import { formatRelativeTime } from '@/lib/utils'
import { Calendar, Users } from 'lucide-react'

interface ApplicationCardProps {
  application: Application & { job: Job }
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
        {application.job.title}
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
        {application.job.company}
      </p>

      <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
        {application.dateApplied && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Applied {formatRelativeTime(application.dateApplied)}</span>
          </div>
        )}

        {application.recruiterName && (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{application.recruiterName}</span>
          </div>
        )}

        {application.nextFollowUpDate && new Date(application.nextFollowUpDate) < new Date() && (
          <div className="text-red-600 dark:text-red-400 font-medium">
            Follow-up overdue
          </div>
        )}
      </div>

      {application.notes && (
        <p className="mt-2 text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
          {application.notes}
        </p>
      )}
    </div>
  )
}
