'use client'

import { useState } from 'react'
import { Application, Job } from '@prisma/client'
import { formatRelativeTime } from '../../lib/utils'
import { Calendar, Users, Wand2 } from 'lucide-react'
import { TailorResumeModal } from './TailorResumeModal'

interface ApplicationCardProps {
  application: Application & { job: Job }
  profileId: string
}

export function ApplicationCard({ application, profileId }: ApplicationCardProps) {
  const [showTailorModal, setShowTailorModal] = useState(false)

  return (
    <>
      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {application.job.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {application.job.company}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowTailorModal(true)
            }}
            className="flex-shrink-0 p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 rounded transition-colors"
            title="Tailor resume for this job"
          >
            <Wand2 className="w-4 h-4" />
          </button>
        </div>

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

      {showTailorModal && (
        <TailorResumeModal
          jobId={application.jobId}
          jobTitle={application.job.title}
          jobDescription={application.job.description || ''}
          profileId={profileId}
          onClose={() => setShowTailorModal(false)}
        />
      )}
    </>
  )
}
