'use client'

import { useState } from 'react'
import { Wand2 } from 'lucide-react'
import { TailorResumeModal } from './TailorResumeModal'

interface ApplicationCardWithTailorProps {
  jobId: string
  jobTitle: string
  company: string
  recruiterName?: string
  recruiterEmail?: string
  appliedDate?: string
  profileId: string
  jobDescription: string
  status: string
}

export function ApplicationCardWithTailor({
  jobId,
  jobTitle,
  company,
  recruiterName,
  recruiterEmail,
  appliedDate,
  profileId,
  jobDescription,
  status,
}: ApplicationCardWithTailorProps) {
  const [showTailorModal, setShowTailorModal] = useState(false)

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{jobTitle}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{company}</p>
          </div>
          <button
            onClick={() => setShowTailorModal(true)}
            className="flex items-center gap-2 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
            title="Tailor resume for this job"
          >
            <Wand2 className="w-3 h-3" />
            Tailor
          </button>
        </div>

        {recruiterName && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <p>👤 {recruiterName}</p>
            {recruiterEmail && <p>📧 {recruiterEmail}</p>}
          </div>
        )}

        {appliedDate && (
          <p className="text-xs text-gray-500 dark:text-gray-500">Applied: {appliedDate}</p>
        )}

        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
            {status}
          </span>
        </div>
      </div>

      {showTailorModal && (
        <TailorResumeModal
          jobId={jobId}
          jobTitle={jobTitle}
          jobDescription={jobDescription}
          profileId={profileId}
          onClose={() => setShowTailorModal(false)}
        />
      )}
    </>
  )
}
