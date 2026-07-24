'use client'

import { useState } from 'react'
import { Application, Job } from '@prisma/client'
import { formatDate, formatRelativeTime } from '../../lib/utils'
import { X, Calendar, Users, FileText } from 'lucide-react'

type Status = 'saved' | 'preparing' | 'applied' | 'interviewing' | 'assessment' | 'offer' | 'rejected' | 'withdrawn' | 'archived'

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'saved', label: 'Saved' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'archived', label: 'Archived' },
]

interface DetailPanelProps {
  application: Application & { job: Job }
  onClose: () => void
  onStatusChange: (appId: string, status: Status) => Promise<void>
}

export function ApplicationDetailPanel({
  application,
  onClose,
  onStatusChange,
}: DetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    recruiterName: application.recruiterName || '',
    recruiterEmail: application.recruiterEmail || '',
    notes: application.notes || '',
    nextFollowUpDate: application.nextFollowUpDate
      ? new Date(application.nextFollowUpDate).toISOString().split('T')[0]
      : '',
  })

  async function handleStatusUpdate(newStatus: Status) {
    await onStatusChange(application.id, newStatus)
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white dark:bg-gray-800 shadow-lg z-50 overflow-y-auto">
      <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
          Application
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Job Info */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {application.job.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {application.job.company}
          </p>
          <a
            href={application.job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:underline mt-1 inline-block"
          >
            View job posting →
          </a>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            value={application.status}
            onChange={(e) => handleStatusUpdate(e.target.value as Status)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Timeline */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timeline
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Saved {formatRelativeTime(application.dateSaved)}</span>
            </div>
            {application.dateApplied && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FileText className="w-4 h-4" />
                <span>Applied {formatDate(application.dateApplied)}</span>
              </div>
            )}
            {application.lastContactDate && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>Last contact {formatDate(application.lastContactDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Follow-up */}
        {application.nextFollowUpDate && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <span className="font-medium">Follow-up due:</span>{' '}
              {formatDate(application.nextFollowUpDate)}
            </p>
            {new Date(application.nextFollowUpDate) < new Date() && (
              <p className="text-sm text-red-600 dark:text-red-300 font-medium mt-1">
                ⚠ Overdue
              </p>
            )}
          </div>
        )}

        {/* Recruiter Info */}
        {!isEditing ? (
          <>
            {application.recruiterName && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recruiter
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {application.recruiterName}
                </p>
                {application.recruiterEmail && (
                  <a
                    href={`mailto:${application.recruiterEmail}`}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    {application.recruiterEmail}
                  </a>
                )}
              </div>
            )}

            {application.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {application.notes}
                </p>
              </div>
            )}

            <button
              onClick={() => setIsEditing(true)}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium"
            >
              Edit Details
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Recruiter name"
              value={formData.recruiterName}
              onChange={(e) =>
                setFormData({ ...formData, recruiterName: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <input
              type="email"
              placeholder="Recruiter email"
              value={formData.recruiterEmail}
              onChange={(e) =>
                setFormData({ ...formData, recruiterEmail: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <input
              type="date"
              value={formData.nextFollowUpDate}
              onChange={(e) =>
                setFormData({ ...formData, nextFollowUpDate: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
